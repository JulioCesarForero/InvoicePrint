"""
Puertos (interfaces) del módulo. El núcleo depende de estas abstracciones, no de implementaciones.

Para reutilizar el módulo en otro proyecto basta con implementar RepositorioFacturas
contra el esquema de esa base de datos; los motores PDF se reutilizan tal cual.
"""
from __future__ import annotations

from typing import Optional, Protocol, runtime_checkable

from .dominio import DatosFactura


@runtime_checkable
class RepositorioFacturas(Protocol):
    def obtener(self, factura_id: int) -> Optional[DatosFactura]:
        """Devuelve los datos crudos de la factura o None si no existe."""
        ...


@runtime_checkable
class MotorPdf(Protocol):
    nombre: str          # identificador: "weasyprint", "wkhtmltopdf"
    descripcion: str
    plantilla: str       # plantilla Jinja que usa este motor, relativa a plantillas/

    def disponible(self) -> tuple[bool, str]:
        """(True, versión) o (False, motivo). No debe lanzar excepciones."""
        ...

    def generar(self, html: str, base_url: Optional[str] = None) -> bytes:
        """Convierte HTML en PDF y devuelve los bytes."""
        ...


@runtime_checkable
class ResolutorRecursos(Protocol):
    def imagen_data_uri(self, referencia: Optional[str]) -> Optional[str]:
        """Convierte una referencia de imagen (p. ej. ruta del logo) en data URI, o None."""
        ...
