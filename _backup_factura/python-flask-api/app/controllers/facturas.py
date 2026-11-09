
import os

from flask import Blueprint
from sqlalchemy import text
from app import db, config, jsonify, request
from ..helpers.http_errors import InternalServerError, BadRequest, ResourceNotFound

from ..helpers.uploader import Uploader
from ..helpers.exporter import export
from ..models.facturas import *



Facturas_blueprint = Blueprint('Facturas', __name__)


# list Facturas records
# @param fieldname: filter table records by a field
# @param fieldvalue:  filter value
# @request.args search: search records
# @request.args orderby: sort records by field name
# @request.args ordertype: sort type (asc|desc)
# @request.args page: current page number
# @request.args limit: maximum number of records to select

@Facturas_blueprint.route('/')

@Facturas_blueprint.route('/index')
@Facturas_blueprint.route('/index/<fieldname>')
@Facturas_blueprint.route('/index/<fieldname>/<fieldvalue>')
def list(fieldname=None, fieldvalue=None):
    try:
        query = Facturas.query
        search = request.args.get('search')
        if search:
            query = query.filter(
                Facturas.factura_id.like(f'%{search}%') | 
                Facturas.moneda.like(f'%{search}%') | 
                Facturas.forma_pago.like(f'%{search}%') | 
                Facturas.metodo_pago.like(f'%{search}%') | 
                Facturas.uso_cfdi.like(f'%{search}%') | 
                Facturas.estatus.like(f'%{search}%') | 
                Facturas.notas.like(f'%{search}%') | 
                Facturas.uuid.like(f'%{search}%') 
            )
        
        # filter by dynamic field name
        if fieldname and fieldvalue:
            field_filter = text(f'{fieldname} = :fieldvalue').params(fieldvalue=fieldvalue)
            query = query.filter(field_filter)
        
        orderby = request.args.get('orderby')
        ordertype = request.args.get('ordertype', 'desc')
        if orderby:
            query = query.order_by(text(f'{orderby} {ordertype}'))
        else:
            query = query.order_by(text(f'facturas.factura_id {ordertype}'))
        
        # export page records
        if request.args.get("export"):
            return export_list_records(query)

        
        # fields to select
        query = query.with_entities(
            Facturas.factura_id,
            Facturas.serie_folio_id,
            Facturas.cliente_id,
            Facturas.empresa_id,
            Facturas.fecha_emision,
            Facturas.fecha_vencimiento,
            Facturas.subtotal,
            Facturas.impuesto_total,
            Facturas.total,
            Facturas.moneda,
            Facturas.forma_pago,
            Facturas.metodo_pago,
            Facturas.uso_cfdi,
            Facturas.estatus,
            Facturas.notas,
            Facturas.uuid,
            Facturas.created_at
        )

        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', config.MAX_RECORD_COUNT))
        offset = ((page-1) * limit)

        total_records = query.count()
        records = query.limit(limit).offset(offset).all()
        record_count = len(records)
        total_pages = round(total_records/limit)
        records = [(row._asdict()) for row in records]
        
        # response object
        response = dict(
            records=records, 
            totalRecords=total_records,
            recordCount=record_count,
            totalPages=total_pages
        )
        return jsonify(response)
    except Exception as ex:
        return InternalServerError(ex)
# Import csv file data into a table 
import csv
from ..helpers.uploader import Uploader
@Facturas_blueprint.route('/importdata', methods=['POST'])
def import_data():
    try:
        fieldname="import_data"
        if 'file' not in request.files:
            return BadRequest('No file selected.')
        if fieldname not in config.UPLOAD_SETTINGS:
            return BadRequest('No upload setting for the field')
        files = request.files.getlist('file')

        uploader = Uploader(files, fieldname)

        uploaded_file_paths = uploader.upload()
        records = []
        for filepath in uploaded_file_paths:
            file_full_path = os.path.join(config.APP_ROOT, filepath)
            with open(file_full_path) as csvfile:
                records = list(csv.DictReader(csvfile))
                for row in records:
                    data = Facturas(**row)
                    db.session.add(data)
            db.session.commit()
        return jsonify('{0} records imported'.format(len(records)))
    except Exception as ex:
        return InternalServerError(ex)


# Select table record by ID

@Facturas_blueprint.route('/view/<rec_id>')
def view(rec_id=None):
    try:
        query = Facturas.query
        query = query.filter(Facturas.factura_id == rec_id)
        
        # export page records
        if request.args.get("export"):
            return export_view_records(query)

        query = query.with_entities(
            Facturas.factura_id,
            Facturas.serie_folio_id,
            Facturas.cliente_id,
            Facturas.empresa_id,
            Facturas.fecha_emision,
            Facturas.fecha_vencimiento,
            Facturas.subtotal,
            Facturas.impuesto_total,
            Facturas.total,
            Facturas.moneda,
            Facturas.forma_pago,
            Facturas.metodo_pago,
            Facturas.uso_cfdi,
            Facturas.estatus,
            Facturas.notas,
            Facturas.uuid,
            Facturas.created_at
        )
        
        record = query.first()
        if not record: return ResourceNotFound()
         
        record = record._asdict()
        
        # return result as json
        return jsonify(record)
        
    except Exception as ex:
        return InternalServerError(ex)


# Save form data to the Facturas table
@Facturas_blueprint.route('/add', methods=['POST'])
def add():
    try:
        modeldata = request.body
        form = FacturasAddForm(modeldata)
        errors = [] # list of validation errors
        
        # validate facturas form data
        if not form.validate():
            errors.append(form.errors)
        
        if errors:
            return BadRequest(errors)
        
        record = Facturas()
        form.populate_obj(record)
        
        # save facturas records
        db.session.add(record)
        db.session.commit()
        db.session.flush()
        rec_id = record.factura_id
         
        record = record._asdict()
        return jsonify(record)
    except Exception as ex:
        return InternalServerError(ex)


# Select record by table primary key and update with form data
@Facturas_blueprint.route('/edit/<rec_id>', methods=['GET', 'POST'])
def edit(rec_id=None):
    try:
        query = Facturas.query
        query = query.filter(Facturas.factura_id == rec_id)
        record = query.first()
        if not record: return ResourceNotFound()
        
        if request.method == 'POST':
            errors = []
            modeldata = request.body
            form = FacturasEditForm(modeldata, obj=record)
            
            if not form.validate():
                errors.append(form.errors)
            
            if errors:
                return BadRequest(errors)
            
            # save Facturas record
            form.populate_obj(record)
            db.session.commit()
         
        record = record._asdict()
        return jsonify(record)
    except Exception as ex:
        return InternalServerError(ex)


# Delete record from the database
# Support multi delete by separating record id by comma.
@Facturas_blueprint.route('/delete/<rec_id>')
def delete(rec_id):
    query = Facturas.query
    arr_id = rec_id.split(',')
    try:
        query = query.filter(Facturas.factura_id.in_(arr_id))
        query.delete(synchronize_session=False)
        db.session.commit()
        
        return jsonify(arr_id)
    except Exception as ex:
        return InternalServerError(ex)


def export_list_records(query):
    query = query.with_entities(
            Facturas.factura_id.label('Factura Id'),
            Facturas.serie_folio_id.label('Serie Folio Id'),
            Facturas.cliente_id.label('Cliente Id'),
            Facturas.empresa_id.label('Empresa Id'),
            Facturas.fecha_emision.label('Fecha Emision'),
            Facturas.fecha_vencimiento.label('Fecha Vencimiento'),
            Facturas.subtotal.label('Subtotal'),
            Facturas.impuesto_total.label('Impuesto Total'),
            Facturas.total.label('Total'),
            Facturas.moneda.label('Moneda'),
            Facturas.forma_pago.label('Forma Pago'),
            Facturas.metodo_pago.label('Metodo Pago'),
            Facturas.uso_cfdi.label('Uso Cfdi'),
            Facturas.estatus.label('Estatus'),
            Facturas.notas.label('Notas'),
            Facturas.uuid.label('Uuid'),
            Facturas.created_at.label('Created At')
    )
    # excel|csv column names to be exported
    column_names = [
            'Factura Id',
            'Serie Folio Id',
            'Cliente Id',
            'Empresa Id',
            'Fecha Emision',
            'Fecha Vencimiento',
            'Subtotal',
            'Impuesto Total',
            'Total',
            'Moneda',
            'Forma Pago',
            'Metodo Pago',
            'Uso Cfdi',
            'Estatus',
            'Notas',
            'Uuid',
            'Created At'
    ]

    records = query.all()

    file_name = "facturas-report" # download filename
    view_name = "reports/facturaslist.html" # html template for pdf
    sheet_name = "facturas" # for excel export
    
    return export(records, column_names, view_name, file_name, sheet_name)


def export_view_records(query):
    # exporta un unico registro (pagina View) con la plantilla *view.html
    query = query.with_entities(
            Facturas.factura_id.label('Factura Id'),
            Facturas.serie_folio_id.label('Serie Folio Id'),
            Facturas.cliente_id.label('Cliente Id'),
            Facturas.empresa_id.label('Empresa Id'),
            Facturas.fecha_emision.label('Fecha Emision'),
            Facturas.fecha_vencimiento.label('Fecha Vencimiento'),
            Facturas.subtotal.label('Subtotal'),
            Facturas.impuesto_total.label('Impuesto Total'),
            Facturas.total.label('Total'),
            Facturas.moneda.label('Moneda'),
            Facturas.forma_pago.label('Forma Pago'),
            Facturas.metodo_pago.label('Metodo Pago'),
            Facturas.uso_cfdi.label('Uso Cfdi'),
            Facturas.estatus.label('Estatus'),
            Facturas.notas.label('Notas'),
            Facturas.uuid.label('Uuid'),
            Facturas.created_at.label('Created At')
    )
    # excel|csv column names to be exported
    column_names = [
            'Factura Id',
            'Serie Folio Id',
            'Cliente Id',
            'Empresa Id',
            'Fecha Emision',
            'Fecha Vencimiento',
            'Subtotal',
            'Impuesto Total',
            'Total',
            'Moneda',
            'Forma Pago',
            'Metodo Pago',
            'Uso Cfdi',
            'Estatus',
            'Notas',
            'Uuid',
            'Created At'
    ]

    records = query.all()

    file_name = "facturas-detalle" # download filename
    view_name = "reports/facturasview.html" # html template for pdf
    sheet_name = "facturas" # for excel export
    
    return export(records, column_names, view_name, file_name, sheet_name)
