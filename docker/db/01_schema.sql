/* Esquema InvoicePrint adaptado para SQL Server en Linux (Docker).
   Generado desde InvocePrint.sql: se quitaron las rutas de archivos de Windows del CREATE DATABASE.
   Si cambias el esquema original, regenera este archivo. */
USE [master]
GO
/****** Object:  Database [InvoicePrint]    Script Date: 9/11/2026 9:56:07 a. m. ******/
CREATE DATABASE [InvoicePrint]
GO
ALTER DATABASE [InvoicePrint] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [InvoicePrint].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [InvoicePrint] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [InvoicePrint] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [InvoicePrint] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [InvoicePrint] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [InvoicePrint] SET ARITHABORT OFF 
GO
ALTER DATABASE [InvoicePrint] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [InvoicePrint] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [InvoicePrint] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [InvoicePrint] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [InvoicePrint] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [InvoicePrint] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [InvoicePrint] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [InvoicePrint] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [InvoicePrint] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [InvoicePrint] SET  DISABLE_BROKER 
GO
ALTER DATABASE [InvoicePrint] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [InvoicePrint] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [InvoicePrint] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [InvoicePrint] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [InvoicePrint] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [InvoicePrint] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [InvoicePrint] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [InvoicePrint] SET RECOVERY FULL 
GO
ALTER DATABASE [InvoicePrint] SET  MULTI_USER 
GO
ALTER DATABASE [InvoicePrint] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [InvoicePrint] SET DB_CHAINING OFF 
GO
ALTER DATABASE [InvoicePrint] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [InvoicePrint] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [InvoicePrint] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [InvoicePrint] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [InvoicePrint] SET QUERY_STORE = ON
GO
ALTER DATABASE [InvoicePrint] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [InvoicePrint]
GO
/****** Object:  Table [dbo].[clientes]    Script Date: 9/11/2026 9:56:07 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[clientes](
	[cliente_id] [int] IDENTITY(1,1) NOT NULL,
	[title] [nvarchar](10) NULL,
	[first_name] [nvarchar](50) NOT NULL,
	[last_name] [nvarchar](50) NOT NULL,
	[rfc] [nvarchar](13) NULL,
	[email] [nvarchar](100) NULL,
	[phone] [nvarchar](20) NULL,
	[address] [nvarchar](255) NULL,
	[city] [nvarchar](50) NULL,
	[state] [nvarchar](50) NULL,
	[country] [nvarchar](50) NULL,
	[zipcode] [nvarchar](10) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[cliente_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[detalles_factura]    Script Date: 9/11/2026 9:56:07 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[detalles_factura](
	[detalle_id] [int] IDENTITY(1,1) NOT NULL,
	[factura_id] [int] NOT NULL,
	[producto_id] [int] NOT NULL,
	[cantidad] [decimal](10, 2) NOT NULL,
	[precio_unitario] [decimal](10, 2) NOT NULL,
	[descuento] [decimal](10, 2) NULL,
	[impuesto_id] [int] NULL,
	[impuesto_monto] [decimal](10, 2) NULL,
	[total] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[detalle_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[empresa]    Script Date: 9/11/2026 9:56:07 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[empresa](
	[empresa_id] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [nvarchar](100) NOT NULL,
	[rfc] [nvarchar](13) NOT NULL,
	[direccion] [nvarchar](255) NULL,
	[ciudad] [nvarchar](50) NULL,
	[estado] [nvarchar](50) NULL,
	[pais] [nvarchar](50) NULL,
	[codigo_postal] [nvarchar](10) NULL,
	[telefono] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[logo] [nvarchar](255) NULL,
	[regimen_fiscal] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[empresa_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[facturas]    Script Date: 9/11/2026 9:56:07 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[facturas](
	[factura_id] [int] IDENTITY(1,1) NOT NULL,
	[serie_folio_id] [int] NOT NULL,
	[folio] [int] NULL,
	[cliente_id] [int] NOT NULL,
	[empresa_id] [int] NOT NULL,
	[fecha_emision] [date] NOT NULL,
	[fecha_vencimiento] [date] NULL,
	[subtotal] [decimal](10, 2) NOT NULL,
	[impuesto_total] [decimal](10, 2) NOT NULL,
	[total] [decimal](10, 2) NOT NULL,
	[moneda] [nvarchar](3) NOT NULL,
	[forma_pago] [nvarchar](50) NULL,
	[metodo_pago] [nvarchar](50) NULL,
	[uso_cfdi] [nvarchar](100) NULL,
	[estatus] [nvarchar](20) NOT NULL,
	[notas] [nvarchar](255) NULL,
	[uuid] [nvarchar](36) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[factura_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[impuestos]    Script Date: 9/11/2026 9:56:07 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[impuestos](
	[impuesto_id] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [nvarchar](50) NOT NULL,
	[codigo] [nvarchar](10) NOT NULL,
	[tasa] [decimal](5, 2) NOT NULL,
	[activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[impuesto_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[pagos]    Script Date: 9/11/2026 9:56:07 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pagos](
	[pago_id] [int] IDENTITY(1,1) NOT NULL,
	[factura_id] [int] NOT NULL,
	[monto] [decimal](10, 2) NOT NULL,
	[fecha_pago] [date] NOT NULL,
	[forma_pago] [nvarchar](50) NULL,
	[referencia] [nvarchar](100) NULL,
	[notas] [nvarchar](255) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[pago_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[productos]    Script Date: 9/11/2026 9:56:07 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[productos](
	[producto_id] [int] IDENTITY(1,1) NOT NULL,
	[codigo] [nvarchar](20) NOT NULL,
	[nombre] [nvarchar](100) NOT NULL,
	[descripcion] [nvarchar](255) NULL,
	[precio_unitario] [decimal](10, 2) NOT NULL,
	[impuesto_id] [int] NULL,
	[activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[producto_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[series_folios]    Script Date: 9/11/2026 9:56:07 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[series_folios](
	[serie_folio_id] [int] IDENTITY(1,1) NOT NULL,
	[serie] [nvarchar](10) NOT NULL,
	[folio_actual] [int] NOT NULL,
	[folio_inicial] [int] NOT NULL,
	[folio_final] [int] NULL,
	[tipo_comprobante] [nvarchar](20) NOT NULL,
	[activo] [bit] NOT NULL,
	[empresa_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[serie_folio_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[detalles_factura]  WITH CHECK ADD  CONSTRAINT [FK_detalles_factura_factura_id_facturas_factura_id] FOREIGN KEY([factura_id])
REFERENCES [dbo].[facturas] ([factura_id])
GO
ALTER TABLE [dbo].[detalles_factura] CHECK CONSTRAINT [FK_detalles_factura_factura_id_facturas_factura_id]
GO
ALTER TABLE [dbo].[detalles_factura]  WITH CHECK ADD  CONSTRAINT [FK_detalles_factura_impuesto_id_impuestos_impuesto_id] FOREIGN KEY([impuesto_id])
REFERENCES [dbo].[impuestos] ([impuesto_id])
GO
ALTER TABLE [dbo].[detalles_factura] CHECK CONSTRAINT [FK_detalles_factura_impuesto_id_impuestos_impuesto_id]
GO
ALTER TABLE [dbo].[detalles_factura]  WITH CHECK ADD  CONSTRAINT [FK_detalles_factura_producto_id_productos_producto_id] FOREIGN KEY([producto_id])
REFERENCES [dbo].[productos] ([producto_id])
GO
ALTER TABLE [dbo].[detalles_factura] CHECK CONSTRAINT [FK_detalles_factura_producto_id_productos_producto_id]
GO
ALTER TABLE [dbo].[facturas]  WITH CHECK ADD  CONSTRAINT [FK_facturas_cliente_id_clientes_cliente_id] FOREIGN KEY([cliente_id])
REFERENCES [dbo].[clientes] ([cliente_id])
GO
ALTER TABLE [dbo].[facturas] CHECK CONSTRAINT [FK_facturas_cliente_id_clientes_cliente_id]
GO
ALTER TABLE [dbo].[facturas]  WITH CHECK ADD  CONSTRAINT [FK_facturas_empresa_id_empresa_empresa_id] FOREIGN KEY([empresa_id])
REFERENCES [dbo].[empresa] ([empresa_id])
GO
ALTER TABLE [dbo].[facturas] CHECK CONSTRAINT [FK_facturas_empresa_id_empresa_empresa_id]
GO
ALTER TABLE [dbo].[facturas]  WITH CHECK ADD  CONSTRAINT [FK_facturas_serie_folio_id_series_folios_serie_folio_id] FOREIGN KEY([serie_folio_id])
REFERENCES [dbo].[series_folios] ([serie_folio_id])
GO
ALTER TABLE [dbo].[facturas] CHECK CONSTRAINT [FK_facturas_serie_folio_id_series_folios_serie_folio_id]
GO
ALTER TABLE [dbo].[pagos]  WITH CHECK ADD  CONSTRAINT [FK_pagos_factura_id_facturas_factura_id] FOREIGN KEY([factura_id])
REFERENCES [dbo].[facturas] ([factura_id])
GO
ALTER TABLE [dbo].[pagos] CHECK CONSTRAINT [FK_pagos_factura_id_facturas_factura_id]
GO
ALTER TABLE [dbo].[productos]  WITH CHECK ADD  CONSTRAINT [FK_productos_impuesto_id_impuestos_impuesto_id] FOREIGN KEY([impuesto_id])
REFERENCES [dbo].[impuestos] ([impuesto_id])
GO
ALTER TABLE [dbo].[productos] CHECK CONSTRAINT [FK_productos_impuesto_id_impuestos_impuesto_id]
GO
ALTER TABLE [dbo].[series_folios]  WITH CHECK ADD  CONSTRAINT [FK_series_folios_empresa_id_empresa_empresa_id] FOREIGN KEY([empresa_id])
REFERENCES [dbo].[empresa] ([empresa_id])
GO
ALTER TABLE [dbo].[series_folios] CHECK CONSTRAINT [FK_series_folios_empresa_id_empresa_empresa_id]
GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_facturas_serie_folio] ON [dbo].[facturas] ([serie_folio_id], [folio]) WHERE [folio] IS NOT NULL
GO
USE [master]
GO
ALTER DATABASE [InvoicePrint] SET  READ_WRITE 
GO
