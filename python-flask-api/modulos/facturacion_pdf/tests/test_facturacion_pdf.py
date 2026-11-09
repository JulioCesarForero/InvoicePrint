"""
Pruebas del módulo facturacion_pdf.

    cd python-flask-api
    python -m pytest modulos/facturacion_pdf/tests -v

Las pruebas de cada motor se omiten automáticamente si ese motor no está instalado.
"""
from datetime import datetime
from decimal import Decimal

import pytest

from modulos.facturacion_pdf import (DatosEmisor, DatosFactura, DatosLinea, DatosReceptor, FacturaNoEncontrada,
                                     MotorWeasyPrint, MotorWkhtmltopdf, construir_factura_impresa,
                                     crear_servicio, importe_con_letra)

D = Decimal


def factura_ejemplo(lineas=None, **cambios):
    base = dict(
        id=1, serie="A", folio=135, fecha_emision=datetime(2026, 11, 9, 10, 30), total=D("1356.80"),
        moneda="MXN", estatus="Pendiente", tipo_comprobante="Ingreso",
        emisor=DatosEmisor(nombre="Empresa Demo S.A. de C.V.", rfc="EDE010101AB1", codigo_postal="37160"),
        receptor=DatosReceptor(nombre="CLIENTE DEMO", rfc="XAXX010101000"),
        lineas=lineas if lineas is not None else [
            DatosLinea(cantidad=D(2), precio_unitario=D("500"), codigo="P1", producto="Servicio",
                       descuento=D("100"), impuesto_nombre="IVA 16%", impuesto_codigo="002", impuesto_tasa=D("16")),
            DatosLinea(cantidad=D(1), precio_unitario=D("200"), codigo="P2", producto="Libro",
                       impuesto_nombre="IVA Tasa 0%", impuesto_codigo="002", impuesto_tasa=D("0")),
            DatosLinea(cantidad=D(1), precio_unitario=D("12"), codigo="P3", producto="Exento",
                       impuesto_nombre="IVA Exento", impuesto_codigo="002-EX", impuesto_tasa=D("0")),
        ],
        pagado=D("500"), num_pagos=1,
    )
    base.update(cambios)
    return DatosFactura(**base)


class RepoMemoria:
    def __init__(self, *facturas):
        self.facturas = {f.id: f for f in facturas}

    def obtener(self, factura_id):
        return self.facturas.get(factura_id)


# ------------------------------------------------------------------ dominio
def test_totales_convencion_cfdi():
    f = construir_factura_impresa(factura_ejemplo())
    assert f.subtotal == D("1212.00")          # 1000 + 200 + 12 (antes de descuento)
    assert f.descuentos == D("100.00")
    assert f.traslados == D("144.00")           # (1000-100) * 16%
    assert f.total_calculado == D("1256.00")
    assert f.saldo == D("856.80")


def test_resumen_impuestos_agrupa_por_tasa():
    f = construir_factura_impresa(factura_ejemplo())
    resumen = {(t.impuesto, t.tipo_factor, t.tasa): (t.base, t.importe) for t in f.resumen_impuestos}
    assert resumen[("002 - IVA", "Tasa", D("16.00"))] == (D("900.00"), D("144.00"))
    assert resumen[("002 - IVA", "Tasa", D("0.00"))] == (D("200.00"), D("0.00"))
    assert resumen[("002 - IVA", "Exento", None)] == (D("12.00"), D("0"))
    assert [t.nombre_corto for t in f.impuestos_trasladados] == ["IVA", "IVA"]


def test_detecta_descuadre():
    assert construir_factura_impresa(factura_ejemplo()).descuadre            # total guardado != calculado
    assert not construir_factura_impresa(factura_ejemplo(total=D("1256.00"))).descuadre


def test_cancelada_sin_saldo_y_con_marca_de_agua():
    f = construir_factura_impresa(factura_ejemplo(estatus="Cancelada"))
    assert f.marca_agua == "CANCELADA" and f.saldo == 0 and not f.muestra_saldo


def test_paginacion_para_wkhtmltopdf():
    lineas = [DatosLinea(cantidad=D(1), precio_unitario=D(1), codigo=f"C{i}", producto="x") for i in range(45)]
    f = construir_factura_impresa(factura_ejemplo(lineas=lineas, total=D(45)))
    assert [len(p) for p in f.paginar(15, 26)] == [15, 26, 4]


@pytest.mark.parametrize("importe, moneda, esperado", [
    (1, "MXN", "UN PESO 00/100 M.N."),
    (21.5, "MXN", "VEINTIÚN PESOS 50/100 M.N."),
    (100, "MXN", "CIEN PESOS 00/100 M.N."),
    (1160, "MXN", "UN MIL CIENTO SESENTA PESOS 00/100 M.N."),
    (1000000, "MXN", "UN MILLÓN DE PESOS 00/100 M.N."),
    (3005.33, "USD", "TRES MIL CINCO DÓLARES 33/100 USD"),
])
def test_importe_con_letra(importe, moneda, esperado):
    assert importe_con_letra(importe, moneda) == esperado


# ------------------------------------------------------------------ servicio + motores
@pytest.fixture
def servicio():
    return crear_servicio(RepoMemoria(factura_ejemplo()), motor_por_defecto="weasyprint")


def test_factura_inexistente(servicio):
    with pytest.raises(FacturaNoEncontrada):
        servicio.factura(999)


def test_html_de_ambas_plantillas(servicio):
    for motor in ("weasyprint", "wkhtmltopdf"):
        html = servicio.html(1, motor)
        assert "A-135" in html and "UN MIL TRESCIENTOS CINCUENTA Y SEIS PESOS 80/100 M.N." in html


@pytest.mark.parametrize("motor", [MotorWeasyPrint(), MotorWkhtmltopdf()], ids=lambda m: m.nombre)
def test_genera_pdf(servicio, motor):
    ok, detalle = motor.disponible()
    if not ok:
        pytest.skip(detalle)
    r = servicio.pdf(1, motor.nombre)
    assert r.contenido[:4] == b"%PDF" and r.paginas >= 1
    assert r.nombre_archivo == "factura-A-135.pdf"


def test_weasyprint_repite_encabezado_y_numera_paginas(servicio):
    ok, detalle = MotorWeasyPrint().disponible()
    if not ok:
        pytest.skip(detalle)
    lineas = [DatosLinea(cantidad=D(1), precio_unitario=D(10), codigo=f"C{i:03}", producto=f"Producto {i}",
                         descripcion="Descripción de prueba", impuesto_nombre="IVA 16%", impuesto_codigo="002",
                         impuesto_tasa=D(16)) for i in range(60)]
    servicio.repositorio.facturas[2] = factura_ejemplo(id=2, lineas=lineas, total=D("696.00"))
    r = servicio.pdf(2, "weasyprint")
    assert r.paginas >= 2
