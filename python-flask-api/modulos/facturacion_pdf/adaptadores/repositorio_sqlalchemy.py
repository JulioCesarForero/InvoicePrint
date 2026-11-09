"""
Repositorio de facturas para el esquema de InvoicePrint (SQL Server / SQLAlchemy).

Es el ÚNICO archivo del módulo que conoce el esquema de la base. Para otro proyecto,
copia esta clase y ajusta las consultas y el mapeo a DatosFactura.
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Callable, Optional

from sqlalchemy import text

from ..dominio import DatosEmisor, DatosFactura, DatosLinea, DatosReceptor


def _fecha(v) -> Optional[datetime]:
    """pyodbc devuelve date/datetime; otros drivers (SQLite) texto ISO."""
    if v in (None, ""):
        return None
    if isinstance(v, datetime):
        return v
    if isinstance(v, date):
        return datetime(v.year, v.month, v.day)
    return datetime.fromisoformat(str(v).replace("T", " ")[:19])


def _dec(v) -> Optional[Decimal]:
    return None if v is None else Decimal(str(v))


class RepositorioFacturasSqlAlchemy:

    def __init__(self, obtener_sesion: Callable, esquema: str = "dbo"):
        """
        obtener_sesion: función sin argumentos que devuelve una sesión SQLAlchemy
                        (con Flask-SQLAlchemy: lambda: db.session).
        esquema: prefijo de las tablas ("dbo" en SQL Server; "" para no usar prefijo).
        """
        self._sesion = obtener_sesion
        p = f"{esquema}." if esquema else ""
        self._sql_cabecera = text(f"""
            SELECT f.factura_id, f.folio, f.fecha_emision, f.fecha_vencimiento, f.total, f.moneda,
                   f.forma_pago, f.metodo_pago, f.uso_cfdi, f.estatus, f.notas, f.uuid, f.created_at,
                   s.serie, s.tipo_comprobante,
                   e.nombre AS e_nombre, e.rfc AS e_rfc, e.direccion AS e_direccion, e.ciudad AS e_ciudad,
                   e.estado AS e_estado, e.pais AS e_pais, e.codigo_postal AS e_cp, e.telefono AS e_telefono,
                   e.email AS e_email, e.logo AS e_logo, e.regimen_fiscal AS e_regimen,
                   c.first_name AS r_nombre, c.last_name AS r_apellidos, c.rfc AS r_rfc, c.email AS r_email,
                   c.phone AS r_telefono, c.address AS r_direccion, c.city AS r_ciudad, c.state AS r_estado,
                   c.country AS r_pais, c.zipcode AS r_cp
            FROM {p}facturas f
            JOIN {p}series_folios s ON s.serie_folio_id = f.serie_folio_id
            JOIN {p}empresa e       ON e.empresa_id = f.empresa_id
            JOIN {p}clientes c      ON c.cliente_id = f.cliente_id
            WHERE f.factura_id = :id
        """)
        self._sql_detalle = text(f"""
            SELECT d.cantidad, d.precio_unitario, d.descuento, d.impuesto_monto,
                   p.codigo, p.nombre AS producto, p.descripcion,
                   i.nombre AS impuesto_nombre, i.codigo AS impuesto_codigo, i.tasa
            FROM {p}detalles_factura d
            JOIN {p}productos p      ON p.producto_id = d.producto_id
            LEFT JOIN {p}impuestos i ON i.impuesto_id = d.impuesto_id
            WHERE d.factura_id = :id
            ORDER BY d.detalle_id
        """)
        self._sql_pagos = text(f"""
            SELECT COALESCE(SUM(monto), 0) AS pagado, COUNT(*) AS num_pagos
            FROM {p}pagos WHERE factura_id = :id
        """)

    def obtener(self, factura_id: int) -> Optional[DatosFactura]:
        s = self._sesion()
        c = s.execute(self._sql_cabecera, {"id": factura_id}).mappings().first()
        if not c:
            return None
        detalle = s.execute(self._sql_detalle, {"id": factura_id}).mappings().all()
        pagos = s.execute(self._sql_pagos, {"id": factura_id}).mappings().first()

        # fecha de emisión con la hora de captura si es del mismo día
        emision = _fecha(c["fecha_emision"])
        creado = _fecha(c["created_at"])
        if creado and creado.date() == emision.date():
            emision = creado

        return DatosFactura(
            id=c["factura_id"], serie=c["serie"] or "", folio=c["folio"],
            fecha_emision=emision, fecha_vencimiento=_fecha(c["fecha_vencimiento"]),
            total=_dec(c["total"]), moneda=c["moneda"], estatus=c["estatus"] or "",
            tipo_comprobante=c["tipo_comprobante"], forma_pago=c["forma_pago"], metodo_pago=c["metodo_pago"],
            uso_cfdi=c["uso_cfdi"], uuid=c["uuid"], notas=c["notas"],
            emisor=DatosEmisor(nombre=c["e_nombre"], rfc=c["e_rfc"], regimen_fiscal=c["e_regimen"],
                               direccion=c["e_direccion"], ciudad=c["e_ciudad"], estado=c["e_estado"],
                               pais=c["e_pais"], codigo_postal=c["e_cp"], telefono=c["e_telefono"],
                               email=c["e_email"], logo=c["e_logo"]),
            receptor=DatosReceptor(nombre=" ".join(x for x in (c["r_nombre"], c["r_apellidos"]) if x).upper(),
                                   rfc=c["r_rfc"], codigo_postal=c["r_cp"], direccion=c["r_direccion"],
                                   ciudad=c["r_ciudad"], estado=c["r_estado"], pais=c["r_pais"],
                                   email=c["r_email"], telefono=c["r_telefono"]),
            lineas=[DatosLinea(cantidad=_dec(d["cantidad"]), precio_unitario=_dec(d["precio_unitario"]),
                               codigo=d["codigo"], producto=d["producto"], descripcion=d["descripcion"],
                               descuento=_dec(d["descuento"]), impuesto_nombre=d["impuesto_nombre"],
                               impuesto_codigo=d["impuesto_codigo"], impuesto_tasa=_dec(d["tasa"]),
                               impuesto_monto=_dec(d["impuesto_monto"]))
                    for d in detalle],
            pagado=_dec(pagos["pagado"]) if pagos else Decimal(0),
            num_pagos=pagos["num_pagos"] if pagos else 0,
        )
