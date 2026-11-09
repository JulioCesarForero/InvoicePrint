
import os

from flask import Blueprint
from sqlalchemy import text
from app import db, config, jsonify, request
from ..helpers.http_errors import InternalServerError, BadRequest, ResourceNotFound

from ..helpers.uploader import Uploader
from ..helpers.exporter import export
from ..models.clientes import *



Clientes_blueprint = Blueprint('Clientes', __name__)


# list Clientes records
# @param fieldname: filter table records by a field
# @param fieldvalue:  filter value
# @request.args search: search records
# @request.args orderby: sort records by field name
# @request.args ordertype: sort type (asc|desc)
# @request.args page: current page number
# @request.args limit: maximum number of records to select

@Clientes_blueprint.route('/')

@Clientes_blueprint.route('/index')
@Clientes_blueprint.route('/index/<fieldname>')
@Clientes_blueprint.route('/index/<fieldname>/<fieldvalue>')
def list(fieldname=None, fieldvalue=None):
    try:
        query = Clientes.query
        search = request.args.get('search')
        if search:
            query = query.filter(
                Clientes.cliente_id.like(f'%{search}%') | 
                Clientes.title.like(f'%{search}%') | 
                Clientes.first_name.like(f'%{search}%') | 
                Clientes.last_name.like(f'%{search}%') | 
                Clientes.rfc.like(f'%{search}%') | 
                Clientes.email.like(f'%{search}%') | 
                Clientes.phone.like(f'%{search}%') | 
                Clientes.address.like(f'%{search}%') | 
                Clientes.city.like(f'%{search}%') | 
                Clientes.state.like(f'%{search}%') | 
                Clientes.country.like(f'%{search}%') | 
                Clientes.zipcode.like(f'%{search}%') 
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
            query = query.order_by(text(f'clientes.cliente_id {ordertype}'))
        
        # export page records
        if request.args.get("export"):
            return export_list_records(query)

        
        # fields to select
        query = query.with_entities(
            Clientes.cliente_id,
            Clientes.title,
            Clientes.first_name,
            Clientes.last_name,
            Clientes.rfc,
            Clientes.email,
            Clientes.phone,
            Clientes.address,
            Clientes.city,
            Clientes.state,
            Clientes.country,
            Clientes.zipcode,
            Clientes.created_at
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
@Clientes_blueprint.route('/importdata', methods=['POST'])
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
                    data = Clientes(**row)
                    db.session.add(data)
            db.session.commit()
        return jsonify('{0} records imported'.format(len(records)))
    except Exception as ex:
        return InternalServerError(ex)


# Select table record by ID

@Clientes_blueprint.route('/view/<rec_id>')
def view(rec_id=None):
    try:
        query = Clientes.query
        query = query.filter(Clientes.cliente_id == rec_id)
        
        # export page records
        if request.args.get("export"):
            return export_view_records(query)

        query = query.with_entities(
            Clientes.cliente_id,
            Clientes.title,
            Clientes.first_name,
            Clientes.last_name,
            Clientes.rfc,
            Clientes.email,
            Clientes.phone,
            Clientes.address,
            Clientes.city,
            Clientes.state,
            Clientes.country,
            Clientes.zipcode,
            Clientes.created_at
        )
        
        record = query.first()
        if not record: return ResourceNotFound()
         
        record = record._asdict()
        
        # return result as json
        return jsonify(record)
        
    except Exception as ex:
        return InternalServerError(ex)


# Save form data to the Clientes table
@Clientes_blueprint.route('/add', methods=['POST'])
def add():
    try:
        modeldata = request.body
        form = ClientesAddForm(modeldata)
        errors = [] # list of validation errors
        
        # validate clientes form data
        if not form.validate():
            errors.append(form.errors)
        
        if errors:
            return BadRequest(errors)
        
        record = Clientes()
        form.populate_obj(record)
        
        # save clientes records
        db.session.add(record)
        db.session.commit()
        db.session.flush()
        rec_id = record.cliente_id
         
        record = record._asdict()
        return jsonify(record)
    except Exception as ex:
        return InternalServerError(ex)


# Select record by table primary key and update with form data
@Clientes_blueprint.route('/edit/<rec_id>', methods=['GET', 'POST'])
def edit(rec_id=None):
    try:
        query = Clientes.query
        query = query.filter(Clientes.cliente_id == rec_id)
        record = query.first()
        if not record: return ResourceNotFound()
        
        if request.method == 'POST':
            errors = []
            modeldata = request.body
            form = ClientesEditForm(modeldata, obj=record)
            
            if not form.validate():
                errors.append(form.errors)
            
            if errors:
                return BadRequest(errors)
            
            # save Clientes record
            form.populate_obj(record)
            db.session.commit()
         
        record = record._asdict()
        return jsonify(record)
    except Exception as ex:
        return InternalServerError(ex)


# Delete record from the database
# Support multi delete by separating record id by comma.
@Clientes_blueprint.route('/delete/<rec_id>')
def delete(rec_id):
    query = Clientes.query
    arr_id = rec_id.split(',')
    try:
        query = query.filter(Clientes.cliente_id.in_(arr_id))
        query.delete(synchronize_session=False)
        db.session.commit()
        
        return jsonify(arr_id)
    except Exception as ex:
        return InternalServerError(ex)


def export_list_records(query):
    query = query.with_entities(
            Clientes.cliente_id.label('Cliente Id'),
            Clientes.title.label('Title'),
            Clientes.first_name.label('First Name'),
            Clientes.last_name.label('Last Name'),
            Clientes.rfc.label('Rfc'),
            Clientes.email.label('Email'),
            Clientes.phone.label('Phone'),
            Clientes.address.label('Address'),
            Clientes.city.label('City'),
            Clientes.state.label('State'),
            Clientes.country.label('Country'),
            Clientes.zipcode.label('Zipcode'),
            Clientes.created_at.label('Created At')
    )
    # excel|csv column names to be exported
    column_names = [
            'Cliente Id',
            'Title',
            'First Name',
            'Last Name',
            'Rfc',
            'Email',
            'Phone',
            'Address',
            'City',
            'State',
            'Country',
            'Zipcode',
            'Created At'
    ]

    records = query.all()

    file_name = "clientes-report" # download filename
    view_name = "reports/clienteslist.html" # html template for pdf
    sheet_name = "clientes" # for excel export
    
    return export(records, column_names, view_name, file_name, sheet_name)


def export_view_records(query):
    # exporta un unico registro (pagina View) con la plantilla *view.html
    query = query.with_entities(
            Clientes.cliente_id.label('Cliente Id'),
            Clientes.title.label('Title'),
            Clientes.first_name.label('First Name'),
            Clientes.last_name.label('Last Name'),
            Clientes.rfc.label('Rfc'),
            Clientes.email.label('Email'),
            Clientes.phone.label('Phone'),
            Clientes.address.label('Address'),
            Clientes.city.label('City'),
            Clientes.state.label('State'),
            Clientes.country.label('Country'),
            Clientes.zipcode.label('Zipcode'),
            Clientes.created_at.label('Created At')
    )
    # excel|csv column names to be exported
    column_names = [
            'Cliente Id',
            'Title',
            'First Name',
            'Last Name',
            'Rfc',
            'Email',
            'Phone',
            'Address',
            'City',
            'State',
            'Country',
            'Zipcode',
            'Created At'
    ]

    records = query.all()

    file_name = "clientes-detalle" # download filename
    view_name = "reports/clientesview.html" # html template for pdf
    sheet_name = "clientes" # for excel export
    
    return export(records, column_names, view_name, file_name, sheet_name)
