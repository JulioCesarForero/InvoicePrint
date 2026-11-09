# InvoicePrint en Docker

Ejecuta la aplicación completa (SQL Server + API Flask + Frontend React) en cualquier equipo con Docker, sin instalar Python, Node, SQL Server, drivers ODBC ni wkhtmltopdf.

## Arquitectura

```
Navegador ──► frontend (nginx :8050)
                 ├── /            → SPA React compilada con Vite
                 ├── /api/*       → api:8060  (proxy)
                 └── /static/*    → api:8060  (archivos subidos, reportes)
              api (gunicorn + Flask :8060)
                 ├── ODBC Driver 18 for SQL Server
                 └── wkhtmltopdf (exportación PDF)
              db (SQL Server 2022 Developer :1433)
              db-init (se ejecuta una vez: esquema + datos sintéticos)
```

El frontend llama a la API por el mismo origen (`/api/`), así que funciona igual en `localhost`, por IP de red o detrás de un dominio, sin tocar CORS ni recompilar.

## Requisitos

- Docker Desktop (Windows/Mac) o Docker Engine + Compose v2 (Linux).
- ~4 GB de RAM libres para SQL Server.
- Mac con Apple Silicon: activar *"Use Rosetta for x86_64/amd64 emulation"* en Docker Desktop (SQL Server solo se publica para amd64).

## Puesta en marcha

```bash
# 1. (solo la primera vez en un equipo nuevo) crear el .env
cp .env.example .env          # y cambiar MSSQL_SA_PASSWORD

# 2. construir y levantar
docker compose up -d --build

# 3. ver el progreso de la inicialización de la base
docker compose logs -f db-init
```

Abrir **http://localhost:8050**

| Servicio | URL / conexión |
|---|---|
| Aplicación | http://localhost:8050 |
| API directa | http://localhost:8060/api/facturas/index |
| SQL Server (SSMS / Azure Data Studio) | Servidor `localhost,14333`, usuario `sa`, contraseña del `.env`, marcar *Trust server certificate* |

## Operación diaria

```bash
docker compose ps                     # estado
docker compose logs -f api            # logs de la API
docker compose stop                   # detener (conserva datos)
docker compose up -d                  # volver a iniciar
docker compose up -d --build api      # reconstruir tras cambiar código de la API
docker compose up -d --build frontend # reconstruir tras cambiar código del frontend
```

## Reiniciar la base de datos desde cero

```bash
docker compose down -v      # ⚠ borra los volúmenes: base de datos y archivos subidos
docker compose up -d --build
```

`db-init` solo crea la base si no existe; con el volumen intacto no toca tus datos.
Para crearla vacía, pon `SEED_DATA=false` en `.env` antes de levantarla.

## Variables (`.env`)

| Variable | Defecto | Uso |
|---|---|---|
| `MSSQL_SA_PASSWORD` | — (obligatoria) | Contraseña de `sa`. Solo letras y números, ≥ 8, con mayúsculas, minúsculas y dígitos. |
| `SEED_DATA` | `true` | Carga `docker/db/02_seed.sql` al crear la base. |
| `APP_PORT` / `API_PORT` / `DB_PORT` | `8050` / `8060` / `14333` | Puertos en el equipo anfitrión. |
| `APP_DEBUG` | `false` | `true` muestra el detalle de errores en las respuestas de la API. |
| `SQLALCHEMY_ECHO` | `false` | `true` registra cada SQL en los logs de la API. |
| `MSSQL_COLLATION` | `Modern_Spanish_CI_AS` | Intercalación del servidor (solo aplica al crear el volumen). |

## Archivos añadidos

```
docker-compose.yml
.env.example / .env           (.env no se versiona)
docker/db/init-db.sh          inicialización idempotente
docker/db/01_schema.sql       InvocePrint.sql sin rutas de Windows, en UTF-8
docker/db/02_seed.sql         copia de InvoicePrint_SeedData.sql
python-flask-api/Dockerfile   python 3.11 + msodbcsql18 + wkhtmltopdf + gunicorn
frontend/Dockerfile           build con Vite → nginx
frontend/nginx.conf           SPA + proxy /api y /static
```

`python-flask-api/app/config.py` ahora lee `DATABASE_URL`, `WKHTMLTOPDF_BIN_PATH`, `APP_DEBUG`, `SQLALCHEMY_ECHO`, `SITE_ADDR` y `FRONTEND_ADDR` del entorno; si no existen usa los valores anteriores, así que la ejecución local en Windows sigue funcionando igual.

## Migraciones de base de datos

`docker/db/migrations/*.sql` se aplican en orden en **cada** `docker compose up` (vía `db-init`). Son idempotentes: si ya se aplicaron no hacen nada.

| Migración | Cambio |
|---|---|
| `001_folio_facturas.sql` | Columna `facturas.folio`, folios para facturas existentes (por serie y fecha), ajuste de `series_folios.folio_actual` e índice único `(serie_folio_id, folio)` |

Para una base fuera de Docker (SQL Server local), ejecuta el mismo archivo en SSMS.

## Impresión de facturas

- `GET /api/facturas/imprimir/<id>` → PDF (`factura-<serie>-<folio>.pdf`)
- `GET /api/facturas/imprimir/<id>?format=html` → vista previa en el navegador

## Si cambias el esquema o los datos

- Esquema: regenerar `docker/db/01_schema.sql` a partir de `InvocePrint.sql` (quitar del `CREATE DATABASE` las cláusulas `ON PRIMARY ... LOG ON ...` con rutas `C:\`).
- Datos: `python generar_seed.py docker/db/02_seed.sql` y luego `docker compose down -v && docker compose up -d`.

## Problemas comunes

- **`db` no pasa a *healthy***: contraseña que no cumple la política de SQL Server → `docker compose logs db`.
- **Puerto ocupado**: cambia `APP_PORT`, `API_PORT` o `DB_PORT` en `.env` (por ejemplo, si ya tienes SQL Server local en 1433, por eso el defecto es 14333).
- **Errores 500**: `docker compose logs api`; para ver el detalle en la respuesta, `APP_DEBUG=true` y `docker compose up -d api`.
