
import os

from flask import Blueprint
from sqlalchemy import text
from app import db, config, jsonify, request
from ..helpers.http_errors import InternalServerError, BadRequest, ResourceNotFound

from ..helpers.uploader import Uploader
from ..helpers.exporter import export
from ..models.impuestos import *



Impuestos_blueprint = Blueprint('Impuestos', __name__)


# list Impuestos records
# @param fieldname: filter table records by a field
# @param fieldvalue:  filter value
# @request.args search: search records
# @request.args orderby: sort records by field name
# @request.args ordertype: sort type (asc|desc)
# @request.args page: current page number
# @request.args limit: maximum number of records to select

@Impuestos_blueprint.route('/')

@Impuestos_blueprint.route('/index')
@Impuestos_blueprint.route('/index/<fieldname>')
@Impuestos_blueprint.route('/index/<fieldname>/<fieldvalue>')
def list(fieldname=None, fieldvalue=None):
    try:
        query = Impuestos.query
        search = request.args.get('search')
        if search:
            query = query.filter(
                Impuestos.impuesto_id.like(f'%{search}%') | 
                Impuestos.nombre.like(f'%{search}%') | 
                Impuestos.codigo.like(f'%{search}%') 
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
            query = query.order_by(text(f'impuestos.impuesto_id {ordertype}'))
        
        # export page records
        if request.args.get("export"):
            return export_list_records(query)

        
        # fields to select
        query = query.with_entities(
            Impuestos.impuesto_id,
            Impuestos.nombre,
            Impuestos.codigo,
            Impuestos.tasa,
            Impuestos.activo
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
@Impuestos_blueprint.route('/importdata', methods=['POST'])
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
                    data = Impuestos(**row)
                    db.session.add(data)
            db.session.commit()
        return jsonify('{0} records imported'.format(len(records)))
    except Exception as ex:
        return InternalServerError(ex)


# Select table record by ID

@Impuestos_blueprint.route('/view/<rec_id>')
def view(rec_id=None):
    try:
        query = Impuestos.query
        query = query.filter(Impuestos.impuesto_id == rec_id)
        
        # export page records
        if request.args.get("export"):
            return export_view_records(query)

        query = query.with_entities(
            Impuestos.impuesto_id,
            Impuestos.nombre,
            Impuestos.codigo,
            Impuestos.tasa,
            Impuestos.activo
        )
        
        record = query.first()
        if not record: return ResourceNotFound()
         
        record = record._asdict()
        
        # return result as json
        return jsonify(record)
        
    except Exception as ex:
        return InternalServerError(ex)


# Save form data to the Impuestos table
@Impuestos_blueprint.route('/add', methods=['POST'])
def add():
    try:
        modeldata = request.body
        form = ImpuestosAddForm(modeldata)
        errors = [] # list of validation errors
        
        # validate impuestos form data
        if not form.validate():
            errors.append(form.errors)
        
        if errors:
            return BadRequest(errors)
        
        record = Impuestos()
        form.populate_obj(record)
        
        # save impuestos records
        db.session.add(record)
        db.session.commit()
        db.session.flush()
        rec_id = record.impuesto_id
         
        record = record._asdict()
        return jsonify(record)
    except Exception as ex:
        return InternalServerError(ex)


# Select record by table primary key and update with form data
@Impuestos_blueprint.route('/edit/<rec_id>', methods=['GET', 'POST'])
def edit(rec_id=None):
    try:
        query = Impuestos.query
        query = query.filter(Impuestos.impuesto_id == rec_id)
        record = query.first()
        if not record: return ResourceNotFound()
        
        if request.method == 'POST':
            errors = []
            modeldata = request.body
            form = ImpuestosEditForm(modeldata, obj=record)
            
            if not form.validate():
                errors.append(form.errors)
            
            if errors:
                return BadRequest(errors)
            
            # save Impuestos record
            form.populate_obj(record)
            db.session.commit()
         
        record = record._asdict()
        return jsonify(record)
    except Exception as ex:
        return InternalServerError(ex)


# Delete record from the database
# Support multi delete by separating record id by comma.
@Impuestos_blueprint.route('/delete/<rec_id>')
def delete(rec_id):
    query = Impuestos.query
    arr_id = rec_id.split(',')
    try:
        query = query.filter(Impuestos.impuesto_id.in_(arr_id))
        query.delete(synchronize_session=False)
        db.session.commit()
        
        return jsonify(arr_id)
    except Exception as ex:
        return InternalServerError(ex)


def export_list_records(query):
    query = query.with_entities(
            Impuestos.impuesto_id.label('Impuesto Id'),
            Impuestos.nombre.label('Nombre'),
            Impuestos.codigo.label('Codigo'),
            Impuestos.tasa.label('Tasa'),
            Impuestos.activo.label('Activo')
    )
    # excel|csv column names to be exported
    column_names = [
            'Impuesto Id',
            'Nombre',
            'Codigo',
            'Tasa',
            'Activo'
    ]

    records = query.all()

    file_name = "impuestos-report" # download filename
    view_name = "reports/impuestoslist.html" # html template for pdf
    sheet_name = "impuestos" # for excel export
    
    return export(records, column_names, view_name, file_name, sheet_name)


def export_view_records(query):
    # exporta un unico registro (pagina View) con la plantilla *view.html
    query = query.with_entities(
            Impuestos.impuesto_id.label('Impuesto Id'),
            Impuestos.nombre.label('Nombre'),
            Impuestos.codigo.label('Codigo'),
            Impuestos.tasa.label('Tasa'),
            Impuestos.activo.label('Activo')
    )
    # excel|csv column names to be exported
    column_names = [
            'Impuesto Id',
            'Nombre',
            'Codigo',
            'Tasa',
            'Activo'
    ]

    records = query.all()

    file_name = "impuestos-detalle" # download filename
    view_name = "reports/impuestosview.html" # html template for pdf
    sheet_name = "impuestos" # for excel export
    
    return export(records, column_names, view_name, file_name, sheet_name)
