"""
Reglas de negocio de la factura impresa: importes, resumen de impuestos, totales y saldo.

Función pura: recibe DatosFactura y devuelve FacturaImpresa. Fácil de probar sin base de datos.
Convención CFDI:  Subtotal = Σ importes (antes de descuento)
                  Total    = Subtotal - Descuento + Impuestos trasladados
"""
from __future__ import annotations

from collections import OrderedDict
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime

from .modelos import DatosFactura, FacturaImpresa, ImpuestoResumen, LineaImpresa
from .numero_letras import importe_con_letra

D2 = Decimal("0.01")

TIPOS_COMPROBANTE = {"INGRESO": "I - Ingreso", "EGRESO": "E - Egreso", "TRASLADO": "T - Traslado",
                     "PAGO": "P - Pago", "NOMINA": "N - Nómina", "NÓMINA": "N - Nómina"}


def dinero(v) -> Decimal:
    """Convierte a Decimal con 2 decimales (redondeo comercial). Nunca usar float para dinero."""
    return Decimal(str(v if v is not None else 0)).quantize(D2, rounding=ROUND_HALF_UP)


def es_exento(nombre, codigo) -> bool:
    return "EXENTO" in (nombre or "").upper() or "EX" in (codigo or "").upper()


def tipo_impuesto(nombre, codigo) -> str:
    """Clave SAT del impuesto a partir del nombre o código: '002 - IVA', '003 - IEPS', '001 - ISR'."""
    n, c = (nombre or "").upper(), (codigo or "")[:3]
    if "IVA" in n or c == "002":
        return "002 - IVA"
    if "IEPS" in n or c == "003":
        return "003 - IEPS"
    if "ISR" in n or c == "001":
        return "001 - ISR"
    return nombre or "-"


def _domicilio(*partes) -> str:
    return ", ".join(p for p in partes if p)


def construir_factura_impresa(datos: DatosFactura) -> FacturaImpresa:
    lineas: list[LineaImpresa] = []
    resumen: "OrderedDict[tuple, ImpuestoResumen]" = OrderedDict()
    subtotal = descuentos = traslados = Decimal(0)

    for n, ln in enumerate(datos.lineas, 1):
        cantidad = Decimal(str(ln.cantidad))
        precio = dinero(ln.precio_unitario)
        importe = (cantidad * precio).quantize(D2, rounding=ROUND_HALF_UP)
        descuento = dinero(ln.descuento)
        base = importe - descuento

        if ln.impuesto_nombre is None and ln.impuesto_tasa is None:
            etiqueta, objeto, monto = "No objeto", "01", Decimal(0)
        else:
            objeto = "02"
            exento = es_exento(ln.impuesto_nombre, ln.impuesto_codigo)
            tasa = None if exento else dinero(ln.impuesto_tasa)
            monto = dinero(ln.impuesto_monto) if ln.impuesto_monto is not None \
                else (Decimal(0) if exento else dinero(base * tasa / 100))
            clave_sat = tipo_impuesto(ln.impuesto_nombre, ln.impuesto_codigo)
            etiqueta = "Exento" if exento else f"{clave_sat.split(' - ')[-1]} {tasa.normalize():f}%"
            grupo = resumen.setdefault((clave_sat, exento, tasa),
                                       ImpuestoResumen(clave_sat, "Exento" if exento else "Tasa", tasa))
            grupo.base += base
            grupo.importe += monto

        subtotal += importe
        descuentos += descuento
        traslados += monto
        lineas.append(LineaImpresa(n=n, codigo=ln.codigo, producto=ln.producto, descripcion=ln.descripcion,
                                   cantidad=cantidad, precio=precio, importe=importe, descuento=descuento,
                                   base=base, impuesto=etiqueta, impuesto_monto=monto, objeto_imp=objeto))

    total = dinero(datos.total)
    pagado = dinero(datos.pagado)
    cancelada_o_borrador = datos.estatus.strip().upper() in ("CANCELADA", "BORRADOR")
    creado = datos.fecha_emision
    tipo = (datos.tipo_comprobante or "").strip()
    e, r = datos.emisor, datos.receptor

    return FacturaImpresa(
        id=datos.id,
        serie=datos.serie or "",
        folio=datos.folio if datos.folio is not None else datos.id,
        folio_provisional=datos.folio is None,
        tipo_comprobante=TIPOS_COMPROBANTE.get(tipo.upper(), tipo or "I - Ingreso"),
        fecha_emision=creado,
        hora_emision=creado.time() if isinstance(creado, datetime) and creado.time() != datetime.min.time() else None,
        fecha_vencimiento=datos.fecha_vencimiento,
        lugar_expedicion=e.codigo_postal,
        moneda=datos.moneda,
        forma_pago=datos.forma_pago, metodo_pago=datos.metodo_pago, uso_cfdi=datos.uso_cfdi,
        uuid=datos.uuid, estatus=datos.estatus.strip(), notas=datos.notas,
        emisor=e,
        emisor_domicilio=_domicilio(e.direccion, e.ciudad, e.estado, f"C.P. {e.codigo_postal}" if e.codigo_postal else None, e.pais),
        receptor=r,
        receptor_domicilio=_domicilio(r.direccion, r.ciudad, r.estado, r.pais),
        lineas=lineas,
        resumen_impuestos=list(resumen.values()),
        subtotal=subtotal, descuentos=descuentos, traslados=traslados,
        total=total, total_calculado=subtotal - descuentos + traslados,
        importe_letra=importe_con_letra(total, datos.moneda),
        pagado=pagado, num_pagos=datos.num_pagos,
        saldo=Decimal(0) if cancelada_o_borrador else max(total - pagado, Decimal(0)),
    )
