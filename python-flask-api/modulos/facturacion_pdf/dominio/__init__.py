"""Núcleo del módulo: modelos y reglas de negocio. Sin dependencias externas."""
from .modelos import (DatosEmisor, DatosReceptor, DatosLinea, DatosFactura,
                      FacturaImpresa, LineaImpresa, ImpuestoResumen, ResultadoPdf)
from .calculos import construir_factura_impresa, dinero
from .numero_letras import importe_con_letra

__all__ = ["DatosEmisor", "DatosReceptor", "DatosLinea", "DatosFactura", "FacturaImpresa", "LineaImpresa",
           "ImpuestoResumen", "ResultadoPdf", "construir_factura_impresa", "dinero", "importe_con_letra"]
