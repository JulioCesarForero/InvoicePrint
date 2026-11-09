#!/bin/bash
# Crea la base InvoicePrint (esquema + datos sintéticos) si no existe
# y aplica las migraciones idempotentes de /init/migrations en cada arranque.
set -euo pipefail

SQLCMD=/opt/mssql-tools18/bin/sqlcmd
ARGS=(-S "${DB_HOST:-db}" -U sa -P "$MSSQL_SA_PASSWORD" -C -b -I)

echo "[db-init] Esperando a SQL Server en ${DB_HOST:-db}..."
for i in $(seq 1 60); do
  if $SQLCMD "${ARGS[@]}" -Q "SELECT 1" >/dev/null 2>&1; then break; fi
  sleep 2
done

EXISTE=$($SQLCMD "${ARGS[@]}" -h -1 -W -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.databases WHERE name = 'InvoicePrint'" | tr -d '[:space:]')

if [ "$EXISTE" = "1" ]; then
  echo "[db-init] La base InvoicePrint ya existe: no se recrea."
else
  echo "[db-init] Creando esquema..."
  $SQLCMD "${ARGS[@]}" -f 65001 -i /init/01_schema.sql

  if [ "${SEED_DATA:-true}" = "true" ]; then
    echo "[db-init] Cargando datos sintéticos..."
    $SQLCMD "${ARGS[@]}" -f 65001 -i /init/02_seed.sql
  else
    echo "[db-init] SEED_DATA=false: base creada vacía."
  fi
fi

# Migraciones idempotentes: se aplican en orden en cada arranque
for m in $(ls /init/migrations/*.sql 2>/dev/null | sort); do
  echo "[db-init] Migración $(basename "$m")"
  $SQLCMD "${ARGS[@]}" -f 65001 -i "$m"
done

echo "[db-init] Listo."
