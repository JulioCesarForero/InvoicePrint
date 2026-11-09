"""
Modelos del dominio.

Dos grupos:
- Datos de ENTRADA (DatosFactura, ...): el contrato que debe cumplir cualquier repositorio.
  Son valores "crudos" tal como vienen de la fuente (sin cálculos).
- Modelo de SALIDA (FacturaImpresa, ...): la factura lista para presentarse, con todos
  los cálculos hechos. Las plantillas solo leen este modelo.

No dependen de Flask, SQLAlchemy ni de ningún motor PDF.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, time
from decimal import Decimal
from typing import Optional


# ----------------------------------------------------------------- entrada (contrato del repositorio)

@dataclass(frozen=True)
class DatosEmisor:
    nombre: str
    rfc: str
    regimen_fiscal: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None
    codigo_postal: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    logo: Optional[str] = None          # ruta/identificador; el servicio lo resuelve a imagen


@dataclass(frozen=True)
class DatosReceptor:
    nombre: str
    rfc: Optional[str] = None
    codigo_postal: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None


@dataclass(frozen=True)
class DatosLinea:
    cantidad: Decimal
    precio_unitario: Decimal
    codigo: str
    producto: str
    descripcion: Optional[str] = None
    descuento: Optional[Decimal] = None
    impuesto_nombre: Optional[str] = None     # None = concepto sin impuesto (no objeto)
    impuesto_codigo: Optional[str] = None
    impuesto_tasa: Optional[Decimal] = None   # porcentaje: 16.00
    impuesto_monto: Optional[Decimal] = None  # si es None se calcula base * tasa


@dataclass(frozen=True)
class DatosFactura:
    id: int
    serie: str
    folio: Optional[int]
    fecha_emision: datetime
    total: Decimal
    moneda: str
    estatus: str
    emisor: DatosEmisor
    receptor: DatosReceptor
    lineas: list[DatosLinea]
    tipo_comprobante: Optional[str] = None
    fecha_vencimiento: Optional[datetime] = None
    forma_pago: Optional[str] = None
    metodo_pago: Optional[str] = None
    uso_cfdi: Optional[str] = None
    uuid: Optional[str] = None
    notas: Optional[str] = None
    pagado: Decimal = Decimal("0")
    num_pagos: int = 0


# ----------------------------------------------------------------- salida (modelo de presentación)

@dataclass
class LineaImpresa:
    n: int
    codigo: str
    producto: str
    descripcion: Optional[str]
    cantidad: Decimal
    precio: Decimal
    importe: Decimal          # cantidad * precio
    descuento: Decimal
    base: Decimal             # importe - descuento
    impuesto: str             # etiqueta: "IVA 16%", "Exento", "No objeto"
    impuesto_monto: Decimal
    objeto_imp: str           # "01" no objeto, "02" sí objeto


@dataclass
class ImpuestoResumen:
    impuesto: str             # "002 - IVA"
    tipo_factor: str          # "Tasa" | "Exento"
    tasa: Optional[Decimal]   # porcentaje; None si exento
    base: Decimal = Decimal("0")
    importe: Decimal = Decimal("0")

    @property
    def nombre_corto(self) -> str:
        return self.impuesto.split(" - ", 1)[-1]

    @property
    def tasa_cuota(self) -> Optional[str]:
        """Tasa como la expresa el CFDI: 0.160000"""
        return None if self.tasa is None else f"{self.tasa / 100:.6f}"


@dataclass
class FacturaImpresa:
    id: int
    serie: str
    folio: int
    folio_provisional: bool
    tipo_comprobante: str
    fecha_emision: datetime
    hora_emision: Optional[time]
    fecha_vencimiento: Optional[datetime]
    lugar_expedicion: Optional[str]
    moneda: str
    forma_pago: Optional[str]
    metodo_pago: Optional[str]
    uso_cfdi: Optional[str]
    uuid: Optional[str]
    estatus: str
    notas: Optional[str]
    emisor: DatosEmisor
    emisor_domicilio: str
    receptor: DatosReceptor
    receptor_domicilio: str
    lineas: list[LineaImpresa]
    resumen_impuestos: list[ImpuestoResumen]
    subtotal: Decimal
    descuentos: Decimal
    traslados: Decimal
    total: Decimal
    total_calculado: Decimal
    importe_letra: str
    pagado: Decimal
    num_pagos: int
    saldo: Decimal
    generado: datetime = field(default_factory=datetime.now)
    logo_uri: Optional[str] = None           # lo completa el servicio (data URI)

    # ----- propiedades derivadas para las plantillas
    @property
    def serie_folio(self) -> str:
        return f"{self.serie}-{self.folio}" if self.serie else str(self.folio)

    @property
    def descuadre(self) -> bool:
        return abs(self.total_calculado - self.total) > Decimal("0.01")

    @property
    def cancelada(self) -> bool:
        return self.estatus.upper() == "CANCELADA"

    @property
    def borrador(self) -> bool:
        return self.estatus.upper() == "BORRADOR"

    @property
    def marca_agua(self) -> Optional[str]:
        return "CANCELADA" if self.cancelada else ("BORRADOR" if self.borrador else None)

    @property
    def muestra_saldo(self) -> bool:
        return not (self.cancelada or self.borrador)

    @property
    def impuestos_trasladados(self) -> list[ImpuestoResumen]:
        return [t for t in self.resumen_impuestos if t.tipo_factor != "Exento"]

    @property
    def clase_estatus(self) -> str:
        e = self.estatus.upper()
        if e in ("PAGADA", "TIMBRADA"):
            return "ok"
        if e in ("CANCELADA", "VENCIDA"):
            return "bad"
        if e in ("PARCIAL", "PENDIENTE"):
            return "warn"
        return ""

    def paginar(self, primera: int, siguientes: int) -> list[list[LineaImpresa]]:
        """Divide las partidas en páginas (solo lo necesitan motores sin paginación CSS, como wkhtmltopdf)."""
        paginas = [self.lineas[:primera]]
        resto = self.lineas[primera:]
        while resto:
            paginas.append(resto[:siguientes])
            resto = resto[siguientes:]
        return paginas


@dataclass(frozen=True)
class ResultadoPdf:
    contenido: bytes
    nombre_archivo: str
    motor: str
    milisegundos: int
    paginas: int

    @property
    def kb(self) -> float:
        return round(len(self.contenido) / 1024, 1)
