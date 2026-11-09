"""Resolución de imágenes (logo) a data URI, buscando en una lista de directorios."""
from __future__ import annotations

import base64
import mimetypes
import os
from typing import Optional, Sequence


class ResolutorArchivosLocales:
    """
    Busca la referencia (p. ej. 'uploads/files/logo.png' o 'static/uploads/...') en los
    directorios dados y la devuelve como data URI. Incrustar la imagen evita depender de
    URLs o de permisos de acceso a archivos del motor PDF.
    """

    def __init__(self, directorios: Sequence[str], prefijos_ignorados: Sequence[str] = ("static/",)):
        self.directorios = [d for d in directorios if d]
        self.prefijos_ignorados = prefijos_ignorados

    def _candidatos(self, ref: str):
        rel = ref.lstrip("/\\")
        variantes = [rel] + [rel[len(p):] for p in self.prefijos_ignorados if rel.startswith(p)]
        for d in self.directorios:
            for v in variantes:
                yield os.path.join(d, v)

    def imagen_data_uri(self, referencia: Optional[str]) -> Optional[str]:
        if not referencia or referencia.startswith(("http://", "https://", "data:")):
            return referencia if referencia and referencia.startswith("data:") else None
        for ruta in self._candidatos(referencia):
            if os.path.isfile(ruta):
                mime = mimetypes.guess_type(ruta)[0] or "image/png"
                with open(ruta, "rb") as fh:
                    return f"data:{mime};base64,{base64.b64encode(fh.read()).decode()}"
        return None
