"""
Servicio de aplicación: orquesta repositorio → cálculo → plantilla → motor PDF.
Es la API que usan los adaptadores de entrada (blueprint Flask, CLI, tareas, pruebas).
"""
from __future__ import annotations

import re
import zlib
import time
from typing import Optional, Sequence

from ..dominio import FacturaImpresa, ResultadoPdf, construir_factura_impresa
from ..puertos import MotorPdf, RepositorioFacturas, ResolutorRecursos
from .presentacion import crear_entorno


class FacturaNoEncontrada(LookupError):
    pass


class MotorNoDisponible(RuntimeError):
    pass


_PAGINA = re.compile(rb"/Type\s*/Page(?![a-zA-Z])")


def contar_paginas(pdf: bytes) -> int:
    """
    Cuenta los objetos /Type /Page sin dependencias externas.
    PDF 1.5+ (WeasyPrint) puede guardar esos objetos dentro de streams comprimidos
    (object streams), así que también se buscan en los streams FlateDecode.
    """
    total = len(_PAGINA.findall(pdf))
    if total:
        return total
    for m in re.finditer(rb"stream\r?\n(.*?)endstream", pdf, re.S):
        try:
            total += len(_PAGINA.findall(zlib.decompressobj().decompress(m.group(1))))
        except zlib.error:
            continue
    return total


class ServicioImpresionFacturas:

    def __init__(self, repositorio: RepositorioFacturas, motores: Sequence[MotorPdf],
                 motor_por_defecto: Optional[str] = None, resolutor: Optional[ResolutorRecursos] = None,
                 directorios_plantillas: Optional[Sequence[str]] = None, base_url: Optional[str] = None):
        if not motores:
            raise ValueError("Se requiere al menos un motor PDF.")
        self.repositorio = repositorio
        self.motores = {m.nombre: m for m in motores}
        self.motor_por_defecto = motor_por_defecto if motor_por_defecto in self.motores else motores[0].nombre
        self.resolutor = resolutor
        self.base_url = base_url
        self.env = crear_entorno(directorios_plantillas)

    # ---------------------------------------------------------------- consultas
    def motor(self, nombre: Optional[str] = None) -> MotorPdf:
        nombre = nombre or self.motor_por_defecto
        if nombre not in self.motores:
            raise MotorNoDisponible(f"Motor '{nombre}' no registrado. Opciones: {', '.join(self.motores)}")
        return self.motores[nombre]

    def estado_motores(self) -> list[dict]:
        estado = []
        for m in self.motores.values():
            ok, detalle = m.disponible()
            estado.append({"nombre": m.nombre, "descripcion": m.descripcion, "disponible": ok,
                           "detalle": detalle, "por_defecto": m.nombre == self.motor_por_defecto})
        return estado

    def factura(self, factura_id: int) -> FacturaImpresa:
        datos = self.repositorio.obtener(factura_id)
        if datos is None:
            raise FacturaNoEncontrada(f"La factura {factura_id} no existe.")
        f = construir_factura_impresa(datos)
        if self.resolutor:
            f.logo_uri = self.resolutor.imagen_data_uri(datos.emisor.logo)
        return f

    # ---------------------------------------------------------------- generación
    def html(self, factura_id: int, motor: Optional[str] = None) -> str:
        m = self.motor(motor)
        return self.env.get_template(m.plantilla).render(f=self.factura(factura_id), motor=m)

    def pdf(self, factura_id: int, motor: Optional[str] = None) -> ResultadoPdf:
        m = self.motor(motor)
        ok, detalle = m.disponible()
        if not ok:
            raise MotorNoDisponible(detalle)
        f = self.factura(factura_id)
        html = self.env.get_template(m.plantilla).render(f=f, motor=m)
        inicio = time.perf_counter()
        contenido = m.generar(html, base_url=self.base_url)
        ms = int((time.perf_counter() - inicio) * 1000)
        return ResultadoPdf(contenido=contenido, nombre_archivo=f"factura-{f.serie_folio}.pdf",
                            motor=m.nombre, milisegundos=ms, paginas=contar_paginas(contenido))

    def comparar(self, factura_id: int) -> dict:
        """Genera la factura con todos los motores disponibles y devuelve métricas."""
        f = self.factura(factura_id)
        resultados = []
        for estado in self.estado_motores():
            fila = dict(estado)
            if estado["disponible"]:
                try:
                    r = self.pdf(factura_id, estado["nombre"])
                    fila.update(milisegundos=r.milisegundos, kb=r.kb, paginas=r.paginas, error=None)
                except Exception as ex:  # se reporta en la página de comparación
                    fila.update(error=str(ex))
            resultados.append(fila)
        return {"factura": f, "resultados": resultados}

    def html_comparacion(self, factura_id: int, url_pdf) -> str:
        """url_pdf(motor) -> URL para incrustar cada PDF (la construye el adaptador web)."""
        datos = self.comparar(factura_id)
        return self.env.get_template("compartidas/comparar.html").render(url_pdf=url_pdf, **datos)
