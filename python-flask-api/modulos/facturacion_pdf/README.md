# facturacion_pdf

Módulo reutilizable para generar la representación impresa de facturas en PDF, con **dos motores intercambiables**: **WeasyPrint** y **wkhtmltopdf**. Está diseñado como un módulo de *monolito modular*: vive dentro de la aplicación, pero no conoce Flask, la base de datos ni el motor PDF salvo a través de interfaces.

## Arquitectura

```
modulos/facturacion_pdf/
├── __init__.py              API pública + crear_servicio()
├── puertos.py               Interfaces: RepositorioFacturas, MotorPdf, ResolutorRecursos
├── dominio/                 Núcleo: Python puro, sin dependencias
│   ├── modelos.py           DatosFactura (entrada) → FacturaImpresa (salida)
│   ├── calculos.py          construir_factura_impresa(): importes, impuestos, totales, saldo
│   └── numero_letras.py     importe con letra (MXN, USD, EUR)
├── aplicacion/
│   ├── servicio.py          ServicioImpresionFacturas: repositorio → cálculo → plantilla → motor
│   └── presentacion.py      Entorno Jinja propio + filtros money / qty / fecha
├── adaptadores/
│   ├── motor_weasyprint.py
│   ├── motor_wkhtmltopdf.py
│   ├── recursos.py          logo → data URI
│   └── repositorio_sqlalchemy.py   ← ÚNICO archivo que conoce el esquema de InvoicePrint
├── web/flask.py             crear_blueprint(servicio)
├── plantillas/
│   ├── weasyprint/factura.html     CSS de impresión moderno
│   ├── wkhtmltopdf/factura.html    tablas + CSS 2.1 + paginación en servidor
│   └── compartidas/comparar.html   página de comparación de motores
└── tests/test_facturacion_pdf.py   16 pruebas (dominio, servicio y ambos motores)
```

Flujo de una petición:

```
GET /api/facturas/imprimir/12?motor=weasyprint
 └─ web/flask.py ─► ServicioImpresionFacturas.pdf(12, "weasyprint")
                     ├─ RepositorioFacturas.obtener(12)          → DatosFactura   (adaptador SQL)
                     ├─ construir_factura_impresa(datos)          → FacturaImpresa (dominio)
                     ├─ ResolutorRecursos.imagen_data_uri(logo)   → logo incrustado
                     ├─ Jinja: plantillas/weasyprint/factura.html → HTML
                     └─ MotorPdf.generar(html)                    → bytes PDF     (adaptador motor)
```

Las dependencias apuntan hacia el dominio. El dominio no importa nada del resto; los adaptadores implementan los puertos. Por eso cambiar de base de datos, de framework web o de motor PDF no toca los cálculos.

## Endpoints (adaptador Flask)

| Ruta | Respuesta |
|---|---|
| `GET <prefijo>/motores` | JSON con el estado y la versión de cada motor |
| `GET <prefijo>/<id>?format=pdf&motor=weasyprint` | PDF como descarga (`&inline=1` para verlo en el navegador) |
| `GET <prefijo>/<id>?format=html&motor=wkhtmltopdf` | HTML exacto que recibe el motor (depuración) |
| `GET <prefijo>/<id>/comparar` | Página con métricas y ambos PDF lado a lado |

Si se omite `motor`, se usa el de `PDF_MOTOR` (por defecto `weasyprint`). Errores: `404` si la factura no existe y `503` si el motor no está disponible, ambos con `{"error": "..."}`.

Cabeceras útiles del PDF: `Content-Disposition` (nombre `factura-<serie>-<folio>.pdf`), `X-Pdf-Motor`, `X-Pdf-Milisegundos` y `X-Pdf-Paginas`.

## Reutilizarlo en otro proyecto

**1. Copiar** la carpeta `modulos/facturacion_pdf` e instalar dependencias:

```
pip install jinja2 weasyprint          # y/o: pdfkit + binario wkhtmltopdf
pip install flask sqlalchemy           # solo si usas esos adaptadores
```

**2. Escribir el repositorio** para tu esquema. Es la única pieza específica de cada proyecto: devuelve un `DatosFactura`.

```python
from decimal import Decimal
from modulos.facturacion_pdf import DatosFactura, DatosEmisor, DatosReceptor, DatosLinea

class RepositorioFacturasDjango:                    # cualquier origen: ORM, API REST, CSV...
    def obtener(self, factura_id):
        f = Factura.objects.select_related("cliente", "empresa").filter(pk=factura_id).first()
        if not f:
            return None
        return DatosFactura(
            id=f.pk, serie=f.serie, folio=f.folio, fecha_emision=f.creada, total=f.total,
            moneda=f.moneda, estatus=f.estatus,
            emisor=DatosEmisor(nombre=f.empresa.razon_social, rfc=f.empresa.rfc, logo=f.empresa.logo.name),
            receptor=DatosReceptor(nombre=f.cliente.nombre, rfc=f.cliente.rfc),
            lineas=[DatosLinea(cantidad=l.cantidad, precio_unitario=l.precio, codigo=l.sku, producto=l.nombre,
                               impuesto_nombre="IVA", impuesto_tasa=Decimal("16")) for l in f.lineas.all()],
        )
```

`impuesto_monto` es opcional: si no viene, el dominio lo calcula como base × tasa.

**3. Crear el servicio y exponerlo**:

```python
from modulos.facturacion_pdf import crear_servicio
from modulos.facturacion_pdf.web.flask import crear_blueprint

servicio = crear_servicio(
    repositorio=RepositorioFacturasDjango(),
    motor_por_defecto="weasyprint",
    directorios_recursos=["/ruta/media"],                  # dónde buscar el logo
    directorios_plantillas=["/ruta/mis_plantillas"],       # opcional: sobrescribir el diseño
)
app.register_blueprint(crear_blueprint(servicio), url_prefix="/api/facturas/imprimir")
```

Sin web (tareas, CLI, envío por correo):

```python
r = servicio.pdf(12, "weasyprint")
open(r.nombre_archivo, "wb").write(r.contenido)
```

**Personalizar el diseño** sin tocar el módulo: crea `mis_plantillas/weasyprint/factura.html` y pasa la carpeta en `directorios_plantillas`; tiene prioridad sobre la del módulo. La plantilla recibe `f` (`FacturaImpresa`) y `motor`.

**Agregar otro motor** (por ejemplo Playwright/Chromium): crea una clase con `nombre`, `descripcion`, `plantilla`, `disponible()` y `generar(html, base_url)` y pásala en `crear_servicio(..., motores=[...])`. La página de comparación lo incluye automáticamente.

## Pruebas

```
cd python-flask-api
python -m pytest modulos/facturacion_pdf/tests -v
```

Las pruebas de cada motor se omiten solas si ese motor no está instalado. En Docker:

```
docker compose exec api python -m pytest modulos/facturacion_pdf/tests -v
```

## WeasyPrint vs. wkhtmltopdf

Medido con las mismas 8 facturas de los datos sintéticos (Linux, Python 3.11, WeasyPrint 66.0, wkhtmltopdf 0.12.6):

| | WeasyPrint | wkhtmltopdf |
|---|---|---|
| Tiempo por factura | 180–350 ms | 275–295 ms |
| Tamaño del PDF | 21–29 KB | 41–86 KB (con marca de agua sube a ~85 KB) |
| Versión de PDF | 1.7, fuentes en subconjunto | 1.4, fuentes completas |
| Mantenimiento | Activo | Archivado desde 2023 |
| Instalación | `pip` + Pango del sistema | binario externo + `pdfkit` |
| Windows nativo | Requiere instalar GTK/Pango (o usar Docker) | Instalador oficial |

Capacidades de maquetado:

| Necesidad | WeasyPrint | wkhtmltopdf |
|---|---|---|
| Repetir encabezado de tabla en cada página | Automático (`thead`) | No en Linux: se pagina en el servidor (`f.paginar(15, 26)`) |
| No partir filas entre páginas | `break-inside: avoid` | No en Linux: se pagina en el servidor |
| "Página X de Y" | `@page { @bottom-right { content: counter(page) " de " counter(pages) } }` | Solo con Qt parcheado (no en Debian/Docker) |
| Encabezado en páginas 2+ | `position: running(encabezado)` + `@top-left { content: element(encabezado) }` | Manual (línea de "continuación") |
| Flexbox / grid / variables CSS | Sí | No fiable |
| Unidades reales | Sí: 1pt = 1/72 in | Reduce todo ~80% ("smart shrinking"): los tamaños no son reales |
| Metadatos y marcadores PDF | `<title>`, `<meta name="author">`, `bookmark-level` | Limitado |
| JavaScript | No | Sí (WebKit) |

Cuándo elegir cada uno:
- **WeasyPrint**: documentos nuevos, paginación compleja, numeración de páginas, PDF más ligeros y un proyecto mantenido. Es el motor por defecto de este módulo.
- **wkhtmltopdf**: si la plantilla depende de JavaScript, o en Windows sin Docker cuando no puedes instalar Pango.

Lección práctica: por el *smart shrinking*, una plantilla diseñada para wkhtmltopdf se ve más grande en WeasyPrint. La plantilla de WeasyPrint usa tamaños menores y anchos en `mm` para lograr una densidad equivalente.

## WeasyPrint en Windows (sin Docker)

`pip install weasyprint` funciona, pero necesita las bibliotecas de Pango. Instala MSYS2, ejecuta `pacman -S mingw-w64-x86_64-pango` y agrega `C:\msys64\mingw64\bin` al `PATH`. Si faltan, `GET /motores` lo indica (`disponible: false`) y puedes usar `PDF_MOTOR=wkhtmltopdf` mientras tanto.
