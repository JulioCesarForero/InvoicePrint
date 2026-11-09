"""
facturacion_pdf — módulo reutilizable para imprimir facturas en PDF.

Arquitectura (monolito modular, puertos y adaptadores):

    dominio/        modelos + reglas de negocio (cálculos, importe con letra). Python puro.
    puertos.py      interfaces: RepositorioFacturas, MotorPdf, ResolutorRecursos
    aplicacion/     ServicioImpresionFacturas (orquesta) + entorno Jinja propio
    adaptadores/    MotorWeasyPrint, MotorWkhtmltopdf, ResolutorArchivosLocales,
                    RepositorioFacturasSqlAlchemy (esquema InvoicePrint)
    web/flask.py    crear_blueprint(servicio)
    plantillas/     una plantilla por motor + página de comparación

Uso mínimo:

    from modulos.facturacion_pdf import crear_servicio
    from modulos.facturacion_pdf.web.flask import crear_blueprint

    servicio = crear_servicio(repositorio=MiRepositorio(), motor_por_defecto="weasyprint")
    app.register_blueprint(crear_blueprint(servicio), url_prefix="/api/facturas/imprimir")
"""
from __future__ import annotations

import os
from typing import Optional, Sequence

from .adaptadores import MotorWeasyPrint, MotorWkhtmltopdf, ResolutorArchivosLocales
from .aplicacion import FacturaNoEncontrada, MotorNoDisponible, ServicioImpresionFacturas
from .dominio import (DatosEmisor, DatosFactura, DatosLinea, DatosReceptor, FacturaImpresa,
                      construir_factura_impresa, importe_con_letra)
from .puertos import MotorPdf, RepositorioFacturas, ResolutorRecursos

__version__ = "1.0.0"


def crear_servicio(repositorio: RepositorioFacturas,
                   motor_por_defecto: Optional[str] = None,
                   directorios_recursos: Sequence[str] = (),
                   directorios_plantillas: Sequence[str] = (),
                   ruta_wkhtmltopdf: Optional[str] = None,
                   motores: Optional[Sequence[MotorPdf]] = None) -> ServicioImpresionFacturas:
    """
    Fábrica con valores por defecto razonables.

    motor_por_defecto: "weasyprint" | "wkhtmltopdf". Si es None se lee PDF_MOTOR (por defecto weasyprint).
    directorios_recursos: carpetas donde buscar el logo del emisor.
    directorios_plantillas: carpetas con plantillas que sustituyen a las del módulo.
    motores: lista propia de motores (por defecto ambos).
    """
    motores = list(motores) if motores else [MotorWeasyPrint(), MotorWkhtmltopdf(ruta_wkhtmltopdf)]
    return ServicioImpresionFacturas(
        repositorio=repositorio,
        motores=motores,
        motor_por_defecto=motor_por_defecto or os.environ.get("PDF_MOTOR", "weasyprint"),
        resolutor=ResolutorArchivosLocales(directorios_recursos) if directorios_recursos else None,
        directorios_plantillas=directorios_plantillas,
    )


__all__ = ["crear_servicio", "ServicioImpresionFacturas", "FacturaNoEncontrada", "MotorNoDisponible",
           "MotorWeasyPrint", "MotorWkhtmltopdf", "ResolutorArchivosLocales",
           "RepositorioFacturas", "MotorPdf", "ResolutorRecursos",
           "DatosFactura", "DatosEmisor", "DatosReceptor", "DatosLinea", "FacturaImpresa",
           "construir_factura_impresa", "importe_con_letra", "__version__"]
