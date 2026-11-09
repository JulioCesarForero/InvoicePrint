from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from .helpers import jsonmultidict as json2dict
from .helpers.json_encoder import CustomJSONEncoder

from flask_mail import Mail
from flask_cors import CORS

import flask_excel as excel

app = Flask(__name__)
       
# Load the configuration from the instance folder
app.config.from_pyfile('config.py')
app.url_map.strict_slashes = False
CORS(app)  # This will enable CORS for all routes


db = SQLAlchemy(app)  # init database
mail = Mail(app)  # init mail client
excel.init_excel(app)  # init flask_excel


from .helpers.http_errors import InternalServerError, BadRequest, Unauthorized

# Handle app exceptions
# Return 500 Internal Server Error
@app.errorhandler(500)
def server_error(error):
    msg = str(error)
    if not app.config['DEBUG']:
        msg = "Error processing request..."
    return InternalServerError(msg)


def resolve_request_body():
    # Before every request, resolve `request.body` from `request.get_json()`
    if request.method == 'POST' or request.method == 'PUT':
        # Check if request is a json or a form
        if request.is_json:
            body = request.get_json()
            if isinstance(body, list):
                allpost = []
                for post in body:
                    allpost.append(json2dict.get_json_multidict(post))
                request.body = allpost
            else:
                request.body = json2dict.get_json_multidict(body)
        else:
            request.body = json2dict.get_json_multidict(request.form)

app.before_request(resolve_request_body)
app.json_encoder = CustomJSONEncoder



from .controllers.home import  Home_blueprint
from .controllers.components_data import  Components_Data_blueprint
from .controllers.fileuploader import File_Uploader_blueprint
from .controllers.clientes import Clientes_blueprint
from .controllers.detallesfactura import DetallesFactura_blueprint
from .controllers.empresa import Empresa_blueprint
from .controllers.facturas import Facturas_blueprint
from .controllers.impuestos import Impuestos_blueprint
from .controllers.pagos import Pagos_blueprint
from .controllers.productos import Productos_blueprint
from .controllers.seriesfolios import SeriesFolios_blueprint


# Page controller blueprint
app.register_blueprint(Home_blueprint, url_prefix = "/api/home")
app.register_blueprint(Components_Data_blueprint, url_prefix = "/api/components_data")
app.register_blueprint(File_Uploader_blueprint, url_prefix = "/api/fileuploader")
app.register_blueprint(Clientes_blueprint, url_prefix = "/api/clientes")
app.register_blueprint(DetallesFactura_blueprint, url_prefix = "/api/detallesfactura")
app.register_blueprint(Empresa_blueprint, url_prefix = "/api/empresa")
# Módulo reutilizable de impresión de facturas (WeasyPrint / wkhtmltopdf): /api/facturas/imprimir/...
from . import config as _config
from .integraciones.facturacion_pdf import registrar as registrar_facturacion_pdf
registrar_facturacion_pdf(app, db, _config)
app.register_blueprint(Facturas_blueprint, url_prefix = "/api/facturas")
app.register_blueprint(Impuestos_blueprint, url_prefix = "/api/impuestos")
app.register_blueprint(Pagos_blueprint, url_prefix = "/api/pagos")
app.register_blueprint(Productos_blueprint, url_prefix = "/api/productos")
app.register_blueprint(SeriesFolios_blueprint, url_prefix = "/api/seriesfolios")