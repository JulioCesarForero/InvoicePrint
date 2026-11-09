
from flask import Blueprint
from flask import Blueprint
from sqlalchemy import text
from app import db, jsonify
from ..helpers.http_errors import InternalServerError


Components_Data_blueprint = Blueprint('components_data', __name__)





@Components_Data_blueprint.route('/factura_id_option_list')
def factura_id_option_list():
    try:
        sqltext = text(f"""SELECT factura_id as value, factura_id as label FROM dbo.facturas""")
        arr = db.session.execute(sqltext)
        
        return jsonify([row._asdict() for row in arr])
    except Exception as ex:
        return InternalServerError(ex)



@Components_Data_blueprint.route('/producto_id_option_list')
def producto_id_option_list():
    try:
        sqltext = text(f"""SELECT producto_id as value, producto_id as label FROM dbo.productos""")
        arr = db.session.execute(sqltext)
        
        return jsonify([row._asdict() for row in arr])
    except Exception as ex:
        return InternalServerError(ex)



@Components_Data_blueprint.route('/impuesto_id_option_list')
def impuesto_id_option_list():
    try:
        sqltext = text(f"""SELECT impuesto_id as value, impuesto_id as label FROM dbo.impuestos""")
        arr = db.session.execute(sqltext)
        
        return jsonify([row._asdict() for row in arr])
    except Exception as ex:
        return InternalServerError(ex)



@Components_Data_blueprint.route('/serie_folio_id_option_list')
def serie_folio_id_option_list():
    try:
        sqltext = text(f"""SELECT serie_folio_id as value, serie_folio_id as label FROM dbo.series_folios""")
        arr = db.session.execute(sqltext)
        
        return jsonify([row._asdict() for row in arr])
    except Exception as ex:
        return InternalServerError(ex)



@Components_Data_blueprint.route('/cliente_id_option_list')
def cliente_id_option_list():
    try:
        sqltext = text(f"""SELECT cliente_id as value, title as label FROM dbo.clientes""")
        arr = db.session.execute(sqltext)
        
        return jsonify([row._asdict() for row in arr])
    except Exception as ex:
        return InternalServerError(ex)



@Components_Data_blueprint.route('/empresa_id_option_list')
def empresa_id_option_list():
    try:
        sqltext = text(f"""SELECT empresa_id as value, empresa_id as label FROM dbo.empresa""")
        arr = db.session.execute(sqltext)
        
        return jsonify([row._asdict() for row in arr])
    except Exception as ex:
        return InternalServerError(ex)
