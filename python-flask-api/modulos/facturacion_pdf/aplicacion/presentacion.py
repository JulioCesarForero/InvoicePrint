"""Entorno Jinja propio del módulo (independiente de Flask) y filtros de formato."""
from __future__ import annotations

import os
from decimal import Decimal
from typing import Optional, Sequence

from jinja2 import ChoiceLoader, Environment, FileSystemLoader, select_autoescape

DIR_PLANTILLAS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "plantillas")


def money(v) -> str:
    return "{:,.2f}".format(Decimal(v or 0))


def qty(v) -> str:
    v = Decimal(v or 0)
    return "{:,.0f}".format(v) if v == v.to_integral() else "{:,.2f}".format(v)


def fecha(v, fmt: str = "%d/%m/%Y") -> str:
    return v.strftime(fmt) if v else "—"


def crear_entorno(directorios_extra: Optional[Sequence[str]] = None) -> Environment:
    """
    directorios_extra: carpetas con plantillas que sobrescriben las del módulo
    (mismo nombre relativo, p. ej. 'weasyprint/factura.html'). Así otro proyecto
    personaliza el diseño sin modificar el módulo.
    """
    cargadores = [FileSystemLoader(d) for d in (directorios_extra or [])] + [FileSystemLoader(DIR_PLANTILLAS)]
    env = Environment(loader=ChoiceLoader(cargadores),
                      autoescape=select_autoescape(["html"]),
                      trim_blocks=True, lstrip_blocks=True)
    env.filters.update(money=money, qty=qty, fecha=fecha)
    return env
