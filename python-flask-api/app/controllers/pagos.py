
import os

from flask import Blueprint
from sqlalchemy import text
from app import db, config, jsonify, request
from ..helpers.http_errors import InternalServerError, BadRequest, ResourceNotFound

from ..helpers.uploader import Uploader
from ..helpers.exporter import export
from ..models.pagos import *



Pagos_blueprint = Blueprint('Pagos', __name__)


# list Pagos records
# @param fieldname: filter table records by a field
# @param fieldvalue:  filter value
# @request.args search: search records
# @request.args orderby: sort records by field name
# @request.args ordertype: sort type (asc|desc)
# @request.args page: current page number
# @request.args limit: maximum number of records to select

@Pagos_blueprint.route('/')

@Pagos_blueprint.route('/index')
@Pagos_blueprint.route('/index/<fieldname>')
@Pagos_blueprint.route('/index/<fieldname>/<fieldvalue>')
def list(fieldname=None, fieldvalue=None):
    try:
        query = Pagos.query
        search = request.args.get('search')
        if search:
            query = query.filter(
                Pagos.pago_id.like(f'%{search}%') | 
                Pagos.forma_pago.like(f'%{search}%') | 
                Pagos.referencia.like(f'%{search}%') | 
                Pagos.notas.like(f'%{search}%') 
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
            query = query.order_by(text(f'pagos.pago_id {ordertype}'))
        
        # export page records
        if request.args.get("export"):
            return export_list_records(query)

        
        # fields to select
        query = query.with_entities(
            Pagos.pago_id,
            Pagos.factura_id,
            Pagos.monto,
            Pagos.fecha_pago,
            Pagos.forma_pago,
            Pagos.referencia,
            Pagos.notas,
            Pagos.created_at
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
@Pagos_blueprint.route('/importdata', methods=['POST'])
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
                    data = Pagos(**row)
                    db.session.add(data)
            db.session.commit()
        return jsonify('{0} records imported'.format(len(records)))
    except Exception as ex:
        return InternalServerError(ex)


# Select table record by ID

@Pagos_blueprint.route('/view/<rec_id>')
def view(rec_id=None):
    try:
        query = Pagos.query
        query = query.filter(Pagos.pago_id == rec_id)
        
        # export page records
        if request.args.get("export"):
            return export_view_records(query)

        query = query.with_entities(
            Pagos.pago_id,
            Pagos.factura_id,
            Pagos.monto,
            Pagos.fecha_pago,
            Pagos.forma_pago,
            Pagos.referencia,
            Pagos.notas,
            Pagos.created_at
        )
        
        record = query.first()
        if not record: return ResourceNotFound()
         
        record = record._asdict()
        
        # return result as json
        return jsonify(record)
        
    except Exception as ex:
        return InternalServerError(ex)


# Save form data to the Pagos table
@Pagos_blueprint.route('/add', methods=['POST'])
def add():
    try:
        modeldata = request.body
        form = PagosAddForm(modeldata)
        errors = [] # list of validation errors
        
        # validate pagos form data
        if not form.validate():
            errors.append(form.errors)
        
        if errors:
            return BadRequest(errors)
        
        record = Pagos()
        form.populate_obj(record)
        
        # save pagos records
        db.session.add(record)
        db.session.commit()
        db.session.flush()
        rec_id = record.pago_id
         
        record = record._asdict()
        return jsonify(record)
    except Exception as ex:
        return InternalServerError(ex)


# Select record by table primary key and update with form data
@Pagos_blueprint.route('/edit/<rec_id>', methods=['GET', 'POST'])
def edit(rec_id=None):
    try:
        query = Pagos.query
        query = query.filter(Pagos.pago_id == rec_id)
        record = query.first()
        if not record: return ResourceNotFound()
        
        if request.method == 'POST':
            errors = []
            modeldata = request.body
            form = PagosEditForm(modeldata, obj=record)
            
            if not form.validate():
                errors.append(form.errors)
            
            if errors:
                return BadRequest(errors)
            
            # save Pagos record
            form.populate_obj(record)
            db.session.commit()
         
        record = record._asdict()
        return jsonify(record)
    except Exception as ex:
        return InternalServerError(ex)


# Delete record from the database
# Support multi delete by separating record id by comma.
@Pagos_blueprint.route('/delete/<rec_id>')
def delete(rec_id):
    query = Pagos.query
    arr_id = rec_id.split(',')
    try:
        query = query.filter(Pagos.pago_id.in_(arr_id))
        query.delete(synchronize_session=False)
        db.session.commit()
        
        return jsonify(arr_id)
    except Exception as ex:
        return InternalServerError(ex)


def export_list_records(query):
    query = query.with_entities(
            Pagos.pago_id.label('Pago Id'),
            Pagos.factura_id.label('Factura Id'),
            Pagos.monto.label('Monto'),
            Pagos.fecha_pago.label('Fecha Pago'),
            Pagos.forma_pago.label('Forma Pago'),
            Pagos.referencia.label('Referencia'),
            Pagos.notas.label('Notas'),
            Pagos.created_at.label('Created At')
    )
    # excel|csv column names to be exported
    column_names = [
            'Pago Id',
            'Factura Id',
            'Monto',
            'Fecha Pago',
            'Forma Pago',
            'Referencia',
            'Notas',
            'Created At'
    ]

    records = query.all()

    file_name = "pagos-report" # download filename
    view_name = "reports/pagoslist.html" # html template for pdf
    sheet_name = "pagos" # for excel export
    
    return export(records, column_names, view_name, file_name, sheet_name)


def export_view_records(query):
    # exporta un unico registro (pagina View) con la plantilla *view.html
    query = query.with_entities(
            Pagos.pago_id.label('Pago Id'),
            Pagos.factura_id.label('Factura Id'),
            Pagos.monto.label('Monto'),
            Pagos.fecha_pago.label('Fecha Pago'),
            Pagos.forma_pago.label('Forma Pago'),
            Pagos.referencia.label('Referencia'),
            Pagos.notas.label('Notas'),
            Pagos.created_at.label('Created At')
    )
    # excel|csv column names to be exported
    column_names = [
            'Pago Id',
            'Factura Id',
            'Monto',
            'Fecha Pago',
            'Forma Pago',
            'Referencia',
            'Notas',
            'Created At'
    ]

    records = query.all()

    file_name = "pagos-detalle" # download filename
    view_name = "reports/pagosview.html" # html template for pdf
    sheet_name = "pagos" # for excel export
    
    return export(records, column_names, view_name, file_name, sheet_name)
