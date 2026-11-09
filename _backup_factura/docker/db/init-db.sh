#!/bin/bash
# Inicializa la base InvoicePrint la primera vez que se levanta el stack.
# Si la base ya existe (volumen con datos), no hace nada.
set -euo pipefail

SQLCMD=/opt/mssql-tools18/bin/sqlcmd
ARGS=(-S "${DB_HOST:-db}" -U sa -P "$MSSQL_SA_PASSWORD" -C -b)

echo "[db-init] Esperando a SQL Server en ${DB_HOST:-db}..."
for i in $(seq 1 60); do
  if $SQLCMD "${ARGS[@]}" -Q "SELECT 1" >/dev/null 2>&1; then break; fi
  sleep 2
done

EXISTE=$($SQLCMD "${ARGS[@]}" -h -1 -W -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.databases WHERE name = 'InvoicePrint'" | tr -d '[:space:]')

if [ "$EXISTE" = "1" ]; then
  echo "[db-init] La base InvoicePrint ya existe. No se modifica."
  exit 0
fi

echo "[db-init] Creando esquema..."
$SQLCMD "${ARGS[@]}" -f 65001 -i /init/01_schema.sql

if [ "${SEED_DATA:-true}" = "true" ]; then
  echo "[db-init] Cargando datos sintéticos..."
  $SQLCMD "${ARGS[@]}" -f 65001 -i /init/02_seed.sql
else
  echo "[db-init] SEED_DATA=false: base creada vacía."
fi

echo "[db-init] Listo."
