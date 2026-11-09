"""
Representación impresa de una factura (documento interno, formato cercano a CFDI 4.0).

GET /api/facturas/imprimir/<factura_id>?format=pdf   -> descarga PDF (por defecto)
GET /api/facturas/imprimir/<factura_id>?format=html  -> HTML para vista previa / impresión desde el navegador

Archivo propio (no generado por RadSystems) para que no se sobrescriba al regenerar el proyecto.
"""
import base64
import mimetypes
import os
from collections import OrderedDict
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

import pdfkit
from flask import Blueprint, Response, render_template, request
from sqlalchemy import text

from app import config, db
from ..helpers.http_errors import InternalServerError, ResourceNotFound
from ..helpers.numero_letras import importe_con_letra

FacturaImpresion_blueprint = Blueprint('FacturaImpresion', __name__)

D2 = Decimal("0.01")
TOLERANCIA = Decimal("0.01")

# Paginación del detalle hecha en el servidor: wkhtmltopdf sin Qt parcheado (Linux/Docker) no repite
# el encabezado de tabla ni evita partir filas. Valores conservadores para carta con descripciones de 2 líneas.
PARTIDAS_PRIMERA_PAGINA = 15
PARTIDAS_PAGINA_SIGUIENTE = 26


def paginar(lineas):
    paginas = [lineas[:PARTIDAS_PRIMERA_PAGINA]]
    resto = lineas[PARTIDAS_PRIMERA_PAGINA:]
    while resto:
        paginas.append(resto[:PARTIDAS_PAGINA_SIGUIENTE])
        resto = resto[PARTIDAS_PAGINA_SIGUIENTE:]
    return paginas


TIPOS_COMPROBANTE = {"INGRESO": "I - Ingreso", "EGRESO": "E - Egreso", "TRASLADO": "T - Traslado",
                     "PAGO": "P - Pago", "NOMINA": "N - Nómina", "NÓMINA": "N - Nómina"}

SQL_CABECERA = text("""
    SELECT f.factura_id, f.folio, f.fecha_emision, f.fecha_vencimiento, f.subtotal, f.impuesto_total, f.total,
           f.moneda, f.forma_pago, f.metodo_pago, f.uso_cfdi, f.estatus, f.notas, f.uuid, f.created_at,
           s.serie, s.tipo_comprobante,
           e.nombre AS emisor_nombre, e.rfc AS emisor_rfc, e.direccion AS emisor_direccion, e.ciudad AS emisor_ciudad,
           e.estado AS emisor_estado, e.pais AS emisor_pais, e.codigo_postal AS emisor_cp, e.telefono AS emisor_telefono,
           e.email AS emisor_email, e.logo AS emisor_logo, e.regimen_fiscal AS emisor_regimen,
           c.title AS receptor_titulo, c.first_name AS receptor_nombre, c.last_name AS receptor_apellidos,
           c.rfc AS receptor_rfc, c.email AS receptor_email, c.phone AS receptor_telefono, c.address AS receptor_direccion,
           c.city AS receptor_ciudad, c.state AS receptor_estado, c.country AS receptor_pais, c.zipcode AS receptor_cp
    FROM dbo.facturas f
    JOIN dbo.series_folios s ON s.serie_folio_id = f.serie_folio_id
    JOIN dbo.empresa e       ON e.empresa_id = f.empresa_id
    JOIN dbo.clientes c      ON c.cliente_id = f.cliente_id
    WHERE f.factura_id = :id
""")

SQL_DETALLE = text("""
    SELECT d.detalle_id, d.cantidad, d.precio_unitario, d.descuento, d.impuesto_monto, d.total,
           p.codigo, p.nombre AS producto, p.descripcion,
           i.impuesto_id, i.nombre AS impuesto_nombre, i.codigo AS impuesto_codigo, i.tasa
    FROM dbo.detalles_factura d
    JOIN dbo.productos p      ON p.producto_id = d.producto_id
    LEFT JOIN dbo.impuestos i ON i.impuesto_id = d.impuesto_id
    WHERE d.factura_id = :id
    ORDER BY d.detalle_id
""")

SQL_PAGOS = text("""
    SELECT COALESCE(SUM(monto), 0) AS pagado, COUNT(*) AS num_pagos, MAX(fecha_pago) AS ultimo_pago
    FROM dbo.pagos WHERE factura_id = :id
""")


def _d(v):
    return Decimal(str(v if v is not None else 0)).quantize(D2, rounding=ROUND_HALF_UP)


def _fecha(v):
    """date/datetime de pyodbc, o texto ISO (otros drivers) -> datetime; None si vacío."""
    if v in (None, ""):
        return None
    if isinstance(v, datetime):
        return v
    if hasattr(v, "year"):
        return datetime(v.year, v.month, v.day)
    return datetime.fromisoformat(str(v).replace("T", " ")[:19])


def _es_exento(nombre, codigo):
    return "EXENTO" in (nombre or "").upper() or "EX" in (codigo or "").upper()


def _tipo_impuesto(nombre, codigo):
    n = (nombre or "").upper()
    c = (codigo or "")[:3]
    if "IVA" in n or c == "002":
        return "002 - IVA"
    if "IEPS" in n or c == "003":
        return "003 - IEPS"
    if "ISR" in n or c == "001":
        return "001 - ISR"
    return nombre or "-"


def _logo_data_uri(logo):
    """Incrusta el logo como data URI (evita depender del acceso a archivos locales de wkhtmltopdf)."""
    if not logo or logo.startswith(("http://", "https://")):
        return None
    rel = logo.lstrip("/\\")
    candidatos = [os.path.join(config.APP_ROOT, rel), os.path.join(config.APP_STATIC, rel)]
    if rel.startswith("static/"):
        candidatos.append(os.path.join(config.APP_STATIC, rel[len("static/"):]))
    for ruta in candidatos:
        if os.path.isfile(ruta):
            mime = mimetypes.guess_type(ruta)[0] or "image/png"
            with open(ruta, "rb") as fh:
                return f"data:{mime};base64,{base64.b64encode(fh.read()).decode()}"
    return None


def construir_factura(factura_id):
    """Arma el diccionario con todo lo que necesita la plantilla. None si no existe."""
    cab = db.session.execute(SQL_CABECERA, {"id": factura_id}).mappings().first()
    if not cab:
        return None
    cab = dict(cab)
    lineas_db = db.session.execute(SQL_DETALLE, {"id": factura_id}).mappings().all()
    pagos = db.session.execute(SQL_PAGOS, {"id": factura_id}).mappings().first()

    lineas, resumen = [], OrderedDict()
    subtotal = descuentos = traslados = Decimal(0)
    for n, ln in enumerate(lineas_db, 1):
        cantidad, precio = Decimal(str(ln["cantidad"])), _d(ln["precio_unitario"])
        importe = (cantidad * precio).quantize(D2, rounding=ROUND_HALF_UP)
        descuento = _d(ln["descuento"])
        base = importe - descuento
        imp = _d(ln["impuesto_monto"])
        exento = _es_exento(ln["impuesto_nombre"], ln["impuesto_codigo"])
        tasa = _d(ln["tasa"]) if ln["tasa"] is not None else None

        if ln["impuesto_id"] is None:
            objeto, etiqueta_imp = "01", "No objeto"
        else:
            objeto = "02"
            etiqueta_imp = "Exento" if exento else f'{_tipo_impuesto(ln["impuesto_nombre"], ln["impuesto_codigo"])[6:]} {tasa:.2f}%'.replace(".00%", "%")
            clave = (_tipo_impuesto(ln["impuesto_nombre"], ln["impuesto_codigo"]), "Exento" if exento else "Tasa", tasa)
            g = resumen.setdefault(clave, {"impuesto": clave[0], "tipo_factor": clave[1],
                                           "tasa": None if exento else tasa, "base": Decimal(0), "importe": Decimal(0)})
            g["base"] += base
            g["importe"] += imp

        subtotal += importe
        descuentos += descuento
        traslados += imp
        lineas.append(dict(n=n, codigo=ln["codigo"], producto=ln["producto"], descripcion=ln["descripcion"],
                           cantidad=cantidad, precio=precio, importe=importe, descuento=descuento,
                           impuesto=etiqueta_imp, impuesto_monto=imp, objeto_imp=objeto, total=_d(ln["total"])))

    total_calculado = subtotal - descuentos + traslados
    total = _d(cab["total"])
    pagado = _d(pagos["pagado"]) if pagos else Decimal(0)
    estatus = (cab["estatus"] or "").strip()
    cancelada = estatus.upper() == "CANCELADA"

    fecha = _fecha(cab["fecha_emision"])
    creado = _fecha(cab["created_at"])
    hora = creado.time() if creado and creado.date() == fecha.date() else None
    tipo = (cab["tipo_comprobante"] or "").strip()

    receptor_nombre = " ".join(x for x in [cab["receptor_nombre"], cab["receptor_apellidos"]] if x).upper()
    emisor_dom = ", ".join(x for x in [cab["emisor_direccion"], cab["emisor_ciudad"], cab["emisor_estado"],
                                        f'C.P. {cab["emisor_cp"]}' if cab["emisor_cp"] else None, cab["emisor_pais"]] if x)
    receptor_dom = ", ".join(x for x in [cab["receptor_direccion"], cab["receptor_ciudad"], cab["receptor_estado"],
                                          cab["receptor_pais"]] if x)

    return dict(
        factura_id=cab["factura_id"],
        serie=cab["serie"] or "",
        folio=cab["folio"] if cab["folio"] is not None else cab["factura_id"],
        folio_provisional=cab["folio"] is None,
        tipo_comprobante=TIPOS_COMPROBANTE.get(tipo.upper(), tipo or "I - Ingreso"),
        fecha_emision=fecha, hora_emision=hora, fecha_vencimiento=_fecha(cab["fecha_vencimiento"]),
        lugar_expedicion=cab["emisor_cp"],
        moneda=cab["moneda"], forma_pago=cab["forma_pago"], metodo_pago=cab["metodo_pago"], uso_cfdi=cab["uso_cfdi"],
        uuid=cab["uuid"], estatus=estatus, notas=cab["notas"],
        marca_agua="CANCELADA" if cancelada else ("BORRADOR" if estatus.upper() == "BORRADOR" else None),
        emisor=dict(nombre=cab["emisor_nombre"], rfc=cab["emisor_rfc"], regimen=cab["emisor_regimen"],
                    domicilio=emisor_dom, telefono=cab["emisor_telefono"], email=cab["emisor_email"],
                    logo=_logo_data_uri(cab["emisor_logo"])),
        receptor=dict(nombre=receptor_nombre, rfc=cab["receptor_rfc"], cp=cab["receptor_cp"], domicilio=receptor_dom,
                      email=cab["receptor_email"], telefono=cab["receptor_telefono"]),
        lineas=lineas,
        paginas=paginar(lineas),
        resumen_impuestos=list(resumen.values()),
        subtotal=subtotal, descuentos=descuentos, traslados=traslados, total=total,
        total_calculado=total_calculado,
        descuadre=abs(total_calculado - total) > TOLERANCIA,
        importe_letra=importe_con_letra(total, cab["moneda"]),
        pagado=pagado, num_pagos=pagos["num_pagos"] if pagos else 0,
        saldo=Decimal(0) if cancelada else max(total - pagado, Decimal(0)),
        generado=datetime.now(),
    )


def _money(v):
    return "{:,.2f}".format(Decimal(v or 0))


def _qty(v):
    v = Decimal(v or 0)
    return "{:,.0f}".format(v) if v == v.to_integral() else "{:,.2f}".format(v)


@FacturaImpresion_blueprint.route('/imprimir/<int:rec_id>')
def imprimir(rec_id):
    try:
        factura = construir_factura(rec_id)
        if not factura:
            return ResourceNotFound()

        html = render_template('reports/factura.html', f=factura, money=_money, qty=_qty)
        if request.args.get('format', 'pdf').lower() == 'html':
            return Response(html, mimetype='text/html')

        options = {
            'page-size': 'Letter', 'encoding': 'UTF-8',
            'margin-top': '10mm', 'margin-bottom': '12mm', 'margin-left': '10mm', 'margin-right': '10mm',
            'print-media-type': None, 'quiet': None,
        }
        pdf_config = pdfkit.configuration(wkhtmltopdf=config.WKHTMLTOPDF_BIN_PATH)
        pdf = pdfkit.from_string(html, False, options=options, configuration=pdf_config)

        nombre = f"factura-{factura['serie']}-{factura['folio']}.pdf".replace("--", "-")
        return Response(pdf, mimetype='application/pdf',
                        headers={'Content-Disposition': f'attachment; filename="{nombre}"',
                                 'Access-Control-Expose-Headers': 'Content-Disposition'})
    except Exception as ex:
        return InternalServerError(ex)
