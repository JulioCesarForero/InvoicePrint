"""
Integración del módulo reutilizable modulos/facturacion_pdf con InvoicePrint.

Este es el ÚNICO punto donde la aplicación conoce al módulo:
  - le entrega el repositorio (esquema dbo de InvoicePrint, sesión de Flask-SQLAlchemy)
  - le dice dónde buscar los logos
  - registra el blueprint en /api/facturas/imprimir

Endpoints resultantes:
  /api/facturas/imprimir/<id>?format=pdf|html&motor=weasyprint|wkhtmltopdf
  /api/facturas/imprimir/<id>/comparar
  /api/facturas/imprimir/motores
"""
import os

from modulos.facturacion_pdf import crear_servicio
from modulos.facturacion_pdf.adaptadores.repositorio_sqlalchemy import RepositorioFacturasSqlAlchemy
from modulos.facturacion_pdf.web.flask import crear_blueprint


def registrar(app, db, config):
    servicio = crear_servicio(
        repositorio=RepositorioFacturasSqlAlchemy(lambda: db.session, esquema="dbo"),
        motor_por_defecto=os.environ.get("PDF_MOTOR", "weasyprint"),
        ruta_wkhtmltopdf=config.WKHTMLTOPDF_BIN_PATH,
        directorios_recursos=[config.APP_ROOT, config.APP_STATIC],
    )
    app.register_blueprint(crear_blueprint(servicio), url_prefix="/api/facturas/imprimir")
    app.extensions["facturacion_pdf"] = servicio
    return servicio
