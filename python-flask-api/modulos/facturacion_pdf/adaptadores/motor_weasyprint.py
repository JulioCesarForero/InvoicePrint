"""
Motor WeasyPrint.

+ Mantenido activamente. Implementa CSS de impresión (CSS Paged Media):
  @page con márgenes y cajas de margen, counter(page)/counter(pages), elementos corridos
  (position: running), <thead> repetido, break-inside: avoid, flexbox, variables CSS.
+ Puro Python (+ Pango del sistema), sin procesos externos.
- No ejecuta JavaScript. En Windows requiere instalar Pango (GTK); en Linux/Docker es trivial.
"""
from __future__ import annotations

from typing import Optional


class MotorWeasyPrint:
    nombre = "weasyprint"
    descripcion = "WeasyPrint (CSS Paged Media)"
    plantilla = "weasyprint/factura.html"

    def __init__(self, hojas_estilo_extra: Optional[list[str]] = None, pdf_variant: Optional[str] = None):
        self.hojas_estilo_extra = hojas_estilo_extra or []
        self.pdf_variant = pdf_variant     # p. ej. "pdf/a-3b" para archivado

    def disponible(self) -> tuple[bool, str]:
        try:
            import weasyprint
            return True, f"WeasyPrint {weasyprint.__version__}"
        except ImportError:
            return False, "Falta el paquete Python 'weasyprint'."
        except OSError as ex:
            # típico en Windows sin Pango/GTK instalado
            return False, f"WeasyPrint instalado pero faltan bibliotecas del sistema (Pango): {ex}"

    def generar(self, html: str, base_url: Optional[str] = None) -> bytes:
        from weasyprint import CSS, HTML
        estilos = [CSS(string=css) for css in self.hojas_estilo_extra]
        opciones = {"pdf_variant": self.pdf_variant} if self.pdf_variant else {}
        # base_url permite resolver rutas relativas (imágenes, CSS) del HTML
        return HTML(string=html, base_url=base_url).write_pdf(stylesheets=estilos, **opciones)
