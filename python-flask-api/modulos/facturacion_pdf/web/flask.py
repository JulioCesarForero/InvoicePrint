"""
Adaptador web para Flask. Expone el servicio como endpoints HTTP.

    GET <prefijo>/motores                          -> estado de los motores (JSON)
    GET <prefijo>/<id>?format=pdf&motor=weasyprint -> PDF (descarga; &inline=1 para verlo en el navegador)
    GET <prefijo>/<id>?format=html&motor=...       -> HTML que recibe el motor (vista previa / depuración)
    GET <prefijo>/<id>/comparar                    -> página que compara todos los motores lado a lado
"""
from __future__ import annotations

import logging

from flask import Blueprint, Response, jsonify, request, url_for

from ..aplicacion import FacturaNoEncontrada, MotorNoDisponible, ServicioImpresionFacturas

log = logging.getLogger(__name__)


def crear_blueprint(servicio: ServicioImpresionFacturas, nombre: str = "facturacion_pdf") -> Blueprint:
    bp = Blueprint(nombre, __name__)

    def _error(estado: int, mensaje: str):
        return jsonify({"error": mensaje}), estado

    @bp.errorhandler(FacturaNoEncontrada)
    def _no_encontrada(ex):
        return _error(404, str(ex))

    @bp.errorhandler(MotorNoDisponible)
    def _sin_motor(ex):
        return _error(503, str(ex))

    @bp.route("/motores")
    def motores():
        return jsonify(servicio.estado_motores())

    @bp.route("/<int:factura_id>")
    def imprimir(factura_id: int):
        motor = request.args.get("motor") or None
        if request.args.get("format", "pdf").lower() == "html":
            return Response(servicio.html(factura_id, motor), mimetype="text/html")

        r = servicio.pdf(factura_id, motor)
        disposicion = "inline" if request.args.get("inline") == "1" else "attachment"
        return Response(r.contenido, mimetype="application/pdf", headers={
            "Content-Disposition": f'{disposicion}; filename="{r.nombre_archivo}"',
            "Access-Control-Expose-Headers": "Content-Disposition, X-Pdf-Motor, X-Pdf-Milisegundos, X-Pdf-Paginas",
            "X-Pdf-Motor": r.motor,
            "X-Pdf-Milisegundos": str(r.milisegundos),
            "X-Pdf-Paginas": str(r.paginas),
        })

    @bp.route("/<int:factura_id>/comparar")
    def comparar(factura_id: int):
        def url_pdf(motor):
            return url_for(f"{nombre}.imprimir", factura_id=factura_id, motor=motor, inline=1)
        return Response(servicio.html_comparacion(factura_id, url_pdf), mimetype="text/html")

    return bp
