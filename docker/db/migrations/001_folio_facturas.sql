/* =====================================================================
   Migración 001 - Folio consecutivo por serie en facturas
   - Agrega facturas.folio (INT NULL)
   - Asigna folio a las facturas existentes que no lo tengan, por serie,
     en orden de fecha_emision y factura_id, a partir de folio_inicial
   - Ajusta series_folios.folio_actual al último folio usado
   - Crea índice único (serie_folio_id, folio)
   Idempotente: puede ejecutarse varias veces sin efecto adicional.
   Ejecutar en SSMS sobre la base InvoicePrint (o lo aplica db-init en Docker).
   ===================================================================== */
USE [InvoicePrint];
GO
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
IF COL_LENGTH('dbo.facturas', 'folio') IS NULL
BEGIN
    ALTER TABLE dbo.facturas ADD [folio] INT NULL;
    PRINT N'Columna facturas.folio agregada.';
END
GO

BEGIN TRANSACTION;

;WITH maximos AS (
    SELECT serie_folio_id, MAX(folio) AS max_folio
    FROM dbo.facturas WHERE folio IS NOT NULL GROUP BY serie_folio_id
),
pendientes AS (
    SELECT f.factura_id,
           COALESCE(m.max_folio, s.folio_inicial - 1)
             + ROW_NUMBER() OVER (PARTITION BY f.serie_folio_id ORDER BY f.fecha_emision, f.factura_id) AS nuevo_folio
    FROM dbo.facturas f
    JOIN dbo.series_folios s ON s.serie_folio_id = f.serie_folio_id
    LEFT JOIN maximos m ON m.serie_folio_id = f.serie_folio_id
    WHERE f.folio IS NULL
)
UPDATE f SET f.folio = p.nuevo_folio
FROM dbo.facturas f JOIN pendientes p ON p.factura_id = f.factura_id;

PRINT CONCAT(N'Facturas con folio asignado: ', @@ROWCOUNT);

UPDATE s SET s.folio_actual = x.max_folio
FROM dbo.series_folios s
JOIN (SELECT serie_folio_id, MAX(folio) AS max_folio FROM dbo.facturas GROUP BY serie_folio_id) x
  ON x.serie_folio_id = s.serie_folio_id
WHERE x.max_folio > s.folio_actual;

COMMIT TRANSACTION;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_facturas_serie_folio' AND object_id = OBJECT_ID('dbo.facturas'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UX_facturas_serie_folio]
        ON dbo.facturas ([serie_folio_id], [folio]) WHERE [folio] IS NOT NULL;
    PRINT N'Índice UX_facturas_serie_folio creado.';
END
GO
