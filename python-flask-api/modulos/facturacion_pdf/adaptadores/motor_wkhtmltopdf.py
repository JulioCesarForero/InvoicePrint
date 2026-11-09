"""
Motor wkhtmltopdf (vía pdfkit).

+ Rápido, binario único, muy usado.
- Proyecto archivado (2023). WebKit antiguo: sin flexbox/grid fiable, sin variables CSS.
- La versión de Linux sin Qt parcheado no repite <thead> ni evita partir filas y no soporta
  encabezados/pies nativos. Por eso su plantilla pagina las partidas en el servidor.
"""
from __future__ import annotations

import os
import shutil
import subprocess
from typing import Optional


class MotorWkhtmltopdf:
    nombre = "wkhtmltopdf"
    descripcion = "wkhtmltopdf 0.12 (WebKit) vía pdfkit"
    plantilla = "wkhtmltopdf/factura.html"

    def __init__(self, ruta_binario: Optional[str] = None, opciones: Optional[dict] = None):
        self.ruta_binario = ruta_binario or os.environ.get("WKHTMLTOPDF_BIN_PATH") or shutil.which("wkhtmltopdf")
        self.opciones = {
            "page-size": "Letter", "encoding": "UTF-8",
            "margin-top": "10mm", "margin-bottom": "12mm", "margin-left": "10mm", "margin-right": "10mm",
            "print-media-type": None, "quiet": None,
            **(opciones or {}),
        }

    def disponible(self) -> tuple[bool, str]:
        try:
            import pdfkit  # noqa: F401
        except ImportError:
            return False, "Falta el paquete Python 'pdfkit'."
        if not self.ruta_binario or not os.path.isfile(self.ruta_binario):
            return False, f"No se encontró el ejecutable wkhtmltopdf ({self.ruta_binario or 'sin ruta'})."
        try:
            out = subprocess.run([self.ruta_binario, "--version"], capture_output=True, text=True, timeout=10)
            return True, (out.stdout or out.stderr).strip()
        except Exception as ex:  # pragma: no cover
            return False, str(ex)

    def generar(self, html: str, base_url: Optional[str] = None) -> bytes:
        import pdfkit
        config = pdfkit.configuration(wkhtmltopdf=self.ruta_binario)
        # False como destino => devuelve los bytes en memoria (sin archivos temporales propios)
        return pdfkit.from_string(html, False, options=self.opciones, configuration=config)
