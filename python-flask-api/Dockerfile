# API Flask de InvoicePrint
# Debian 12 (bookworm): trae wkhtmltopdf en sus repositorios y Microsoft publica msodbcsql18 para esta versión.
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    QT_QPA_PLATFORM=offscreen

# Driver ODBC 18 de SQL Server + wkhtmltopdf (exportación a PDF) + fuentes
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl gnupg ca-certificates \
 && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
 && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list -o /etc/apt/sources.list.d/mssql-release.list \
 && apt-get update \
 && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 unixodbc wkhtmltopdf fonts-dejavu-core \
 && apt-get purge -y gnupg && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn==23.0.0

COPY . .
RUN mkdir -p app/static/reports app/static/uploads/temp app/static/uploads/files app/static/uploads/photos

EXPOSE 8060

# Servidor de producción (run.py usa el servidor de desarrollo de Flask y solo escucha en 127.0.0.1)
CMD ["gunicorn", "--bind", "0.0.0.0:8060", "--workers", "3", "--timeout", "120", "--access-logfile", "-", "run:app"]
