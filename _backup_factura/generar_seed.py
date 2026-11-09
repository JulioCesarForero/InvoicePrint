# -*- coding: utf-8 -*-
"""
Generador de datos sintéticos para la base InvoicePrint (SQL Server).
Produce un script T-SQL idempotente-controlado con IDs explícitos y totales cuadrados.

Uso:  python generar_seed.py [salida.sql] [--facturas N] [--seed S]
"""
import random, sys, uuid, argparse
from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

ap = argparse.ArgumentParser()
ap.add_argument("salida", nargs="?", default="InvoicePrint_SeedData.sql")
ap.add_argument("--facturas", type=int, default=240)
ap.add_argument("--clientes", type=int, default=45)
ap.add_argument("--seed", type=int, default=20261109)
ap.add_argument("--hoy", default="2026-11-09")
args = ap.parse_args()

rnd = random.Random(args.seed)
HOY = date.fromisoformat(args.hoy)
D2 = Decimal("0.01")
def q(x): return Decimal(x).quantize(D2, rounding=ROUND_HALF_UP)

def s(v):
    if v is None: return "NULL"
    if isinstance(v, bool): return "1" if v else "0"
    if isinstance(v, (int, Decimal)): return str(v)
    if isinstance(v, datetime): return "'" + v.strftime("%Y-%m-%dT%H:%M:%S") + "'"
    if isinstance(v, date): return "'" + v.isoformat() + "'"
    return "N'" + str(v).replace("'", "''") + "'"

# ---------------------------------------------------------------- catálogos
EMPRESAS = [
    dict(nombre="Soluciones Digitales del Bajío S.A. de C.V.", rfc="SDB150312KZ4", direccion="Blvd. Adolfo López Mateos 2105, Col. Jardines del Moral",
         ciudad="León", estado="Guanajuato", pais="México", codigo_postal="37160", telefono="477 712 4580", email="facturacion@sdbajio.example.mx",
         logo="uploads/files/logo_sdbajio.png", regimen_fiscal="601 - General de Ley Personas Morales"),
    dict(nombre="Comercializadora Norteña de Insumos S. de R.L. de C.V.", rfc="CNI180925R31", direccion="Av. Constitución 845 Pte., Centro",
         ciudad="Monterrey", estado="Nuevo León", pais="México", codigo_postal="64000", telefono="81 8340 2211", email="cfdi@cnorinsumos.example.mx",
         logo="uploads/files/logo_cni.png", regimen_fiscal="601 - General de Ley Personas Morales"),
    dict(nombre="Taller Creativo Ñandú S.C.", rfc="TCÑ200514AB7", direccion="Calle Durango 230 Int. 4, Col. Roma Norte",
         ciudad="Ciudad de México", estado="Ciudad de México", pais="México", codigo_postal="06700", telefono="55 5207 9934", email="admin@tallernandu.example.mx",
         logo=None, regimen_fiscal="603 - Personas Morales con Fines no Lucrativos"),
]

# nombre, codigo SAT, tasa, activo
IMPUESTOS = [
    ("IVA 16%", "002", "16.00", True),
    ("IVA 8% Región Fronteriza", "002", "8.00", True),
    ("IVA Tasa 0%", "002", "0.00", True),
    ("IVA Exento", "002-EX", "0.00", True),
    ("IEPS 8%", "003", "8.00", True),
    ("IEPS 26.5%", "003", "26.50", False),   # inactivo: para probar filtros
]

# codigo, nombre, descripcion, precio, impuesto_idx(1-based), activo
PRODUCTOS = [
    ("SRV-CONS-001", "Consultoría TI (hora)", "Hora de consultoría en arquitectura de software", "1250.00", 1, True),
    ("SRV-DEV-002", "Desarrollo a la medida (hora)", "Hora de desarrollo de software a la medida", "950.00", 1, True),
    ("SRV-SOP-003", "Póliza de soporte mensual", "Soporte técnico remoto 8x5, hasta 20 tickets", "6500.00", 1, True),
    ("SRV-CAP-004", "Capacitación presencial (día)", "Curso presencial de 8 horas, hasta 15 participantes", "18500.00", 1, True),
    ("SRV-HOST-005", "Hosting administrado", "Servidor virtual administrado, 4 vCPU / 8 GB", "2890.00", 1, True),
    ("LIC-ERP-006", "Licencia ERP usuario anual", "Licencia anual por usuario nombrado", "8400.00", 1, True),
    ("LIC-ANT-007", "Antivirus empresarial (equipo)", "Suscripción anual por equipo", "689.00", 1, True),
    ("HW-LAP-008", "Laptop 14\" Core i7 16GB", "Equipo portátil para oficina, garantía 1 año", "24999.00", 1, True),
    ("HW-MON-009", "Monitor 27\" QHD", "Monitor IPS 2560x1440", "6299.00", 1, True),
    ("HW-TEC-010", "Teclado y mouse inalámbrico", "Combo inalámbrico ergonómico", "849.50", 1, True),
    ("HW-UPS-011", "No-break 1500 VA", "UPS interactivo 1500 VA / 900 W", "3450.00", 1, True),
    ("HW-SW-012", "Switch 24 puertos PoE", "Switch administrable capa 2", "11780.00", 1, True),
    ("HW-CBL-013", "Cable UTP Cat6 (bobina 305 m)", "Bobina de cable UTP categoría 6", "2150.00", 1, True),
    ("PAP-HOJ-014", "Papel bond carta (caja 5000)", "Caja con 10 paquetes de 500 hojas", "1180.00", 1, True),
    ("PAP-TON-015", "Tóner láser negro", "Tóner compatible alto rendimiento", "1590.00", 1, True),
    ("ALM-AGU-016", "Garrafón de agua 20 L", "Agua purificada para oficina", "58.00", 3, True),
    ("ALM-CAF-017", "Café en grano 1 kg", "Café de altura de Chiapas", "389.00", 3, True),
    ("ALM-GAL-018", "Galletas surtidas (caja)", "Caja de 24 paquetes", "412.00", 5, True),
    ("ALM-BEB-019", "Bebida energética (paquete 12)", "Paquete de 12 latas 473 ml", "540.00", 5, True),
    ("MED-LIB-020", "Libro técnico impreso", "Libro de texto especializado", "720.00", 3, True),
    ("SRV-ARR-021", "Arrendamiento de equipo (mes)", "Renta mensual de equipo de cómputo", "1450.00", 2, True),
    ("SRV-FLE-022", "Flete local", "Servicio de entrega en zona metropolitana", "450.00", 2, True),
    ("SRV-INS-023", "Instalación de red (punto)", "Instalación y certificación por nodo", "980.00", 1, True),
    ("SRV-AUD-024", "Auditoría de seguridad", "Pentest externo, reporte ejecutivo y técnico", "45000.00", 1, True),
    ("SRV-DON-025", "Servicio educativo exento", "Colegiatura de diplomado (exento de IVA)", "7800.00", 4, True),
    ("HW-IMP-026", "Impresora multifuncional láser", "Impresión, copiado y escaneo dúplex", "9890.00", 1, True),
    ("LIC-OFI-027", "Suite ofimática (usuario/año)", "Suscripción anual de ofimática", "2399.00", 1, True),
    ("HW-DIS-028", "Disco SSD 1 TB", "Unidad de estado sólido NVMe", "1749.00", 1, True),
    ("OBS-FAX-029", "Fax térmico (descontinuado)", "Producto descontinuado", "1999.00", 1, False),
    ("OBS-ZIP-030", "Unidad Zip 100MB (descontinuado)", None, "350.00", 6, False),  # nunca vendido + inactivo + impuesto inactivo
]

TITULOS = ["Sr.", "Sra.", "Lic.", "Ing.", "Dr.", "Dra.", "C.P.", "Mtro.", "Mtra.", "Arq."]
NOMBRES_H = ["José", "Juan", "Luis", "Carlos", "Miguel", "Jorge", "Alejandro", "Fernando", "Ricardo", "Raúl", "Andrés", "Héctor", "Óscar", "Sergio", "Iván"]
NOMBRES_M = ["María", "Guadalupe", "Ana", "Sofía", "Verónica", "Lucía", "Mónica", "Daniela", "Paola", "Adriana", "Ximena", "Itzel", "Brenda", "Rocío", "Begoña"]
APELLIDOS = ["Hernández", "García", "Martínez", "López", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Cruz", "Flores", "Gómez", "Morales",
             "Vázquez", "Jiménez", "Reyes", "Díaz", "Torres", "Gutiérrez", "Ruiz", "Mendoza", "Aguilar", "Ortiz", "Castillo", "Peña", "Núñez", "O'Farrill", "Ibáñez"]
CIUDADES = [  # ciudad, estado, prefijo CP
    ("Guadalajara", "Jalisco", "44"), ("Zapopan", "Jalisco", "45"), ("Monterrey", "Nuevo León", "64"), ("San Pedro Garza García", "Nuevo León", "66"),
    ("Ciudad de México", "Ciudad de México", "03"), ("Puebla", "Puebla", "72"), ("Querétaro", "Querétaro", "76"), ("Mérida", "Yucatán", "97"),
    ("Tijuana", "Baja California", "22"), ("León", "Guanajuato", "37"), ("Aguascalientes", "Aguascalientes", "20"), ("Morelia", "Michoacán", "58"),
    ("Hermosillo", "Sonora", "83"), ("Oaxaca de Juárez", "Oaxaca", "68"), ("Cancún", "Quintana Roo", "77"),
]
CALLES = ["Av. Juárez", "Calle Hidalgo", "Av. Insurgentes Sur", "Calle Morelos", "Blvd. Kukulcán", "Av. Vallarta", "Calle 60", "Av. Revolución",
          "Calzada de Tlalpan", "Av. Chapultepec", "Calle Allende", "Paseo de la Reforma", "Av. Universidad", "Calle Zaragoza"]
COLONIAS = ["Centro", "Del Valle", "Providencia", "Americana", "Cumbres", "Roma Sur", "Polanco", "Chapultepec", "Las Ánimas", "Jardines"]

FORMAS = ["01 - Efectivo", "02 - Cheque nominativo", "03 - Transferencia electrónica de fondos", "04 - Tarjeta de crédito", "28 - Tarjeta de débito"]
PESOS_FORMAS = [1, 1, 6, 2, 2]
USOS = ["G01 - Adquisición de mercancías", "G03 - Gastos en general", "I04 - Equipo de cómputo y accesorios",
        "I08 - Otra maquinaria y equipo", "D10 - Pagos por servicios educativos", "S01 - Sin efectos fiscales"]
PUE = "PUE - Pago en una sola exhibición"
PPD = "PPD - Pago en parcialidades o diferido"

def rfc_fisica(nombre, ap1, ap2, nac):
    import unicodedata
    def norm(t): return "".join(c for c in unicodedata.normalize("NFD", t.upper()) if c.isalpha() and unicodedata.category(c) != "Mn")
    a1, a2, n = norm(ap1), norm(ap2), norm(nombre)
    vocal = next((c for c in a1[1:] if c in "AEIOU"), "X")
    base = a1[0] + vocal + a2[0] + n[0]
    homo = "".join(rnd.choice("ABCDEFGHJKLMNPQRSTUVWXYZ0123456789") for _ in range(3))
    return base + nac.strftime("%y%m%d") + homo

def rand_dt(d):
    return datetime(d.year, d.month, d.day, rnd.randint(8, 19), rnd.randint(0, 59), rnd.randint(0, 59))

# ---------------------------------------------------------------- clientes
clientes = []
for i in range(1, args.clientes + 1):
    mujer = rnd.random() < 0.5
    nombre = rnd.choice(NOMBRES_M if mujer else NOMBRES_H)
    ap1, ap2 = rnd.sample(APELLIDOS, 2)
    titulo = rnd.choice(["Sra.", "Lic.", "Ing.", "Dra.", "C.P.", "Mtra.", "Arq."] if mujer else ["Sr.", "Lic.", "Ing.", "Dr.", "C.P.", "Mtro.", "Arq."])
    ciudad, estado, cp = rnd.choice(CIUDADES)
    nac = date(rnd.randint(1960, 1998), rnd.randint(1, 12), rnd.randint(1, 28))
    import unicodedata
    mail_user = "".join(c for c in unicodedata.normalize("NFD", f"{nombre}.{ap1}".lower()) if unicodedata.category(c) != "Mn").replace("'", "").replace(" ", "")
    c = dict(cliente_id=i, title=titulo, first_name=nombre, last_name=f"{ap1} {ap2}",
             rfc=rfc_fisica(nombre, ap1, ap2, nac), email=f"{mail_user}{i}@correo.example.mx",
             phone=f"{rnd.choice(['33','55','81','222','442','999','664','477'])} {rnd.randint(100,999)} {rnd.randint(1000,9999)}",
             address=f"{rnd.choice(CALLES)} {rnd.randint(1, 3500)}, Col. {rnd.choice(COLONIAS)}",
             city=ciudad, state=estado, country="México", zipcode=f"{cp}{rnd.randint(100, 999)}",
             created_at=rand_dt(HOY - timedelta(days=rnd.randint(380, 900))))
    clientes.append(c)
# casos borde
clientes[0].update(title=None, first_name="Público", last_name="En General", rfc="XAXX010101000", email=None, phone=None,
                   address=None, city=None, state=None, zipcode=None)                       # público en general, solo obligatorios
clientes[1].update(first_name="John", last_name="Smith Walker", rfc="XEXX010101000", city="Austin", state="Texas",
                   country="Estados Unidos", zipcode="73301", phone="+1 512 555 0147", address="1200 Congress Ave",
                   title="Mr.", email="john.smith@company.example.com")  # extranjero
clientes[2].update(title="Dra.", first_name="María de los Ángeles", last_name="Fernández-Villaseñor O'Connor",
                   rfc=rfc_fisica("María", "Fernández", "Villaseñor", date(1979, 4, 12)), email="mangeles.fernandez@correo.example.mx")  # nombre largo con acentos/apóstrofo
SIN_FACTURAS = {clientes[-1]["cliente_id"], clientes[-2]["cliente_id"]}               # clientes sin facturas

# ---------------------------------------------------------------- series
# serie, folio_inicial, folio_final, tipo, activo, empresa
series_def = [
    ("A", 1, None, "Ingreso", True, 1), ("NC", 1, 500, "Egreso", True, 1), ("B", 1001, 2000, "Ingreso", False, 1),
    ("F", 1, None, "Ingreso", True, 2), ("FX", 5001, 9999, "Ingreso", True, 2),
    ("T", 1, 1000, "Ingreso", True, 3),
]
series = []
for i, (se, fi, ff, tipo, act, emp) in enumerate(series_def, 1):
    series.append(dict(serie_folio_id=i, serie=se, folio_actual=fi - 1, folio_inicial=fi, folio_final=ff, tipo_comprobante=tipo, activo=act, empresa_id=emp))
series_ingreso = {1: [1], 2: [4, 5], 3: [6]}   # series de ingreso activas por empresa
serie_egreso = {1: 2}

# ---------------------------------------------------------------- facturas / detalles / pagos
tasas = {i: Decimal(t[2]) for i, t in enumerate(IMPUESTOS, 1)}
prod_activos = [i for i, p in enumerate(PRODUCTOS, 1) if p[5]]
prod_inactivos = [i for i, p in enumerate(PRODUCTOS, 1) if not p[5]]
clientes_fact = [c["cliente_id"] for c in clientes if c["cliente_id"] not in SIN_FACTURAS]
peso_cli = {cid: rnd.choice([1, 1, 1, 2, 3, 6]) for cid in clientes_fact}  # algunos clientes con muchas facturas

facturas, detalles, pagos = [], [], []
inicio = HOY - timedelta(days=365)
fechas = sorted((inicio + timedelta(days=rnd.randint(0, 364))) if rnd.random() < 0.75 else (HOY - timedelta(days=rnd.randint(0, 45))) for _ in range(args.facturas))
did = pid = 0

for fid, f_em in enumerate(fechas, 1):
    emp = rnd.choices([1, 2, 3], [6, 3, 1])[0]
    es_nc = emp == 1 and rnd.random() < 0.04
    sid = serie_egreso[1] if es_nc else rnd.choice(series_ingreso[emp])
    ser = series[sid - 1]; ser["folio_actual"] += 1
    cid = rnd.choices(clientes_fact, [peso_cli[c] for c in clientes_fact])[0]
    moneda = "USD" if (sid == 5 or cid == 2) else ("USD" if rnd.random() < 0.03 else "MXN")
    fx = Decimal("1") if moneda == "MXN" else Decimal("0.054")
    ppd = rnd.random() < 0.40 and not es_nc
    plazo = rnd.choice([15, 30, 30, 45, 60]) if ppd else rnd.choice([0, 0, 7])
    f_ven = f_em + timedelta(days=plazo)

    # detalles
    n_lin = rnd.choices([1, 2, 3, 4, 5, 8, 15], [20, 25, 20, 15, 10, 6, 4])[0]
    prods = rnd.sample(prod_activos, min(n_lin, len(prod_activos)))
    if fid == 3: prods[0] = prod_inactivos[0]   # factura histórica con producto hoy descontinuado
    sub = imp = Decimal(0); lineas = []
    for p in prods:
        cod, nom, desc, precio, imp_id, act = PRODUCTOS[p - 1]
        precio = q(Decimal(precio) * fx)
        if rnd.random() < 0.15: precio = q(precio * Decimal(rnd.choice(["0.95", "1.05", "0.90"])))  # precio negociado
        cant = q(rnd.choice([1, 1, 1, 2, 3, 5, 10, 12, 24]) if not cod.startswith("SRV-C") and not cod.startswith("SRV-D")
                 else Decimal(rnd.choice([2, 4, 6.5, 8, 12.5, 20, 40])))
        bruto = q(cant * precio)
        descu = q(bruto * Decimal(rnd.choice(["0.05", "0.10", "0.15"]))) if rnd.random() < 0.2 else (Decimal("0.00") if rnd.random() < 0.7 else None)
        base = bruto - (descu or 0)
        imp_m = q(base * tasas[imp_id] / 100)
        did += 1
        lineas.append(dict(detalle_id=did, factura_id=fid, producto_id=p, cantidad=cant, precio_unitario=precio, descuento=descu,
                           impuesto_id=imp_id, impuesto_monto=imp_m, total=q(base + imp_m)))
        sub += base; imp += imp_m
    detalles.extend(lineas)
    total = q(sub + imp)

    # estatus
    dias = (HOY - f_em).days
    r = rnd.random()
    if es_nc:                       est = "Timbrada"
    elif dias <= 12 and r < 0.4:    est = "Borrador"
    elif r < 0.06:                  est = "Cancelada"
    elif not ppd:
        if dias <= 30:              est = rnd.choices(["Pagada", "Pendiente"], [6, 4])[0]
        else:                       est = rnd.choices(["Pagada", "Vencida"], [9, 1])[0]
    else:
        if f_ven < HOY:             est = rnd.choices(["Pagada", "Parcial", "Vencida"], [5, 2, 3])[0]
        else:                       est = rnd.choices(["Pendiente", "Parcial", "Pagada"], [5, 3, 2])[0]
    if est == "Pendiente" and f_ven < HOY: est = "Vencida"

    forma = "99 - Por definir" if ppd else rnd.choices(FORMAS, PESOS_FORMAS)[0]
    uso = "G02 - Devoluciones, descuentos o bonificaciones" if es_nc else ("S01 - Sin efectos fiscales" if cid == 1 else rnd.choice(USOS))
    notas = None
    if est == "Cancelada": notas = rnd.choice(["Cancelada por error en RFC del receptor (motivo 02).", "Sustituida por nueva factura (motivo 01)."])
    elif es_nc:            notas = "Nota de crédito por devolución parcial de mercancía."
    elif rnd.random() < 0.15: notas = rnd.choice(["Entrega en almacén principal.", "OC del cliente adjunta por correo.", "Precio especial autorizado por gerencia.",
                                                  "Pago a la cuenta CLABE indicada en el portal de proveedores."])
    if fid == 7: notas = ("Nota extensa para probar el límite de 255 caracteres en pantalla y en la impresión: incluye condiciones de entrega, "
                          "referencia de orden de compra OC-2026-00981, contacto de almacén y horario de recepción de lunes a viernes de 9 a 14 h.")[:255]
    facturas.append(dict(factura_id=fid, serie_folio_id=sid, cliente_id=cid, empresa_id=emp, fecha_emision=f_em,
                         fecha_vencimiento=None if (fid % 23 == 0 and not ppd) else f_ven,
                         subtotal=q(sub), impuesto_total=q(imp), total=total, moneda=moneda, forma_pago=forma,
                         metodo_pago=PPD if ppd else PUE, uso_cfdi=uso, estatus=est, notas=notas,
                         uuid=None if est == "Borrador" else str(uuid.UUID(int=rnd.getrandbits(128), version=4)).upper(),
                         created_at=rand_dt(f_em)))

    # pagos
    def pago(monto, fecha, forma_p):
        global pid
        pid += 1
        fecha = min(fecha, HOY)
        ref = {"03 - Transferencia electrónica de fondos": f"SPEI-{rnd.randint(10**9, 10**10-1)}",
               "02 - Cheque nominativo": f"CHQ-{rnd.randint(1000, 99999)}",
               "04 - Tarjeta de crédito": f"AUT-{rnd.randint(100000, 999999)}",
               "28 - Tarjeta de débito": f"AUT-{rnd.randint(100000, 999999)}"}.get(forma_p)
        pagos.append(dict(pago_id=pid, factura_id=fid, monto=q(monto), fecha_pago=fecha, forma_pago=forma_p, referencia=ref,
                          notas=None if rnd.random() < 0.8 else "Complemento de pago emitido.", created_at=rand_dt(fecha)))
    if est == "Pagada":
        if ppd and rnd.random() < 0.4:
            p1 = q(total * Decimal(rnd.choice(["0.3", "0.5", "0.6"])))
            pago(p1, f_em + timedelta(days=rnd.randint(1, plazo // 2 or 1)), "03 - Transferencia electrónica de fondos")
            pago(total - p1, f_em + timedelta(days=rnd.randint(plazo // 2 or 1, plazo + 10)), "03 - Transferencia electrónica de fondos")
        else:
            f_p = f_em if not ppd else f_em + timedelta(days=rnd.randint(1, plazo + 10))
            pago(total, f_p, forma if not ppd else rnd.choices(FORMAS, PESOS_FORMAS)[0])
    elif est == "Parcial":
        n = rnd.choice([1, 1, 2])
        pagado = Decimal(0)
        for k in range(n):
            m = q(total * Decimal(rnd.choice(["0.2", "0.25", "0.3"])))
            pago(m, f_em + timedelta(days=rnd.randint(1, max(2, dias))), "03 - Transferencia electrónica de fondos")

# ---------------------------------------------------------------- emisión SQL
TABLAS = [
    ("empresa", "empresa_id", ["nombre", "rfc", "direccion", "ciudad", "estado", "pais", "codigo_postal", "telefono", "email", "logo", "regimen_fiscal"],
     [dict(empresa_id=i, **e) for i, e in enumerate(EMPRESAS, 1)]),
    ("impuestos", "impuesto_id", ["nombre", "codigo", "tasa", "activo"],
     [dict(impuesto_id=i, nombre=n, codigo=c, tasa=Decimal(t), activo=a) for i, (n, c, t, a) in enumerate(IMPUESTOS, 1)]),
    ("series_folios", "serie_folio_id", ["serie", "folio_actual", "folio_inicial", "folio_final", "tipo_comprobante", "activo", "empresa_id"], series),
    ("clientes", "cliente_id", ["title", "first_name", "last_name", "rfc", "email", "phone", "address", "city", "state", "country", "zipcode", "created_at"], clientes),
    ("productos", "producto_id", ["codigo", "nombre", "descripcion", "precio_unitario", "impuesto_id", "activo"],
     [dict(producto_id=i, codigo=c, nombre=n, descripcion=d, precio_unitario=Decimal(p), impuesto_id=im, activo=a)
      for i, (c, n, d, p, im, a) in enumerate(PRODUCTOS, 1)]),
    ("facturas", "factura_id", ["serie_folio_id", "cliente_id", "empresa_id", "fecha_emision", "fecha_vencimiento", "subtotal", "impuesto_total", "total",
                                "moneda", "forma_pago", "metodo_pago", "uso_cfdi", "estatus", "notas", "uuid", "created_at"], facturas),
    ("detalles_factura", "detalle_id", ["factura_id", "producto_id", "cantidad", "precio_unitario", "descuento", "impuesto_id", "impuesto_monto", "total"], detalles),
    ("pagos", "pago_id", ["factura_id", "monto", "fecha_pago", "forma_pago", "referencia", "notas", "created_at"], pagos),
]

L = []
w = L.append
w("/* =====================================================================")
w("   InvoicePrint - Datos sintéticos de prueba")
w(f"   Generado por generar_seed.py  (seed={args.seed}, fecha de referencia={HOY})")
w("   Requiere haber ejecutado antes InvocePrint.sql (estructura).")
w("")
w("   Volumen: " + ", ".join(f"{t}={len(rows)}" for t, _, _, rows in TABLAS))
w("")
w("   Convenciones de datos:")
w("   - detalles_factura.total = (cantidad*precio_unitario - descuento) + impuesto_monto")
w("   - facturas.subtotal = SUM(base), impuesto_total = SUM(impuesto_monto), total = subtotal + impuesto_total")
w("   - estatus: Borrador | Pendiente | Parcial | Pagada | Vencida | Cancelada | Timbrada (nota de crédito)")
w("   - Pagada => SUM(pagos) = total; Parcial => 0 < SUM(pagos) < total; resto sin pagos")
w("   - Borrador => uuid NULL. PPD => forma_pago '99 - Por definir'.")
w("   - series_folios.folio_actual = último folio consumido por las facturas de esa serie.")
w("")
w("   @limpiar = 1 BORRA todos los datos de las 8 tablas y reinicia identidades.")
w("   ===================================================================== */")
w("USE [InvoicePrint];")
w("GO")
w("SET NOCOUNT ON;")
w("SET XACT_ABORT ON;")
w("")
w("DECLARE @limpiar BIT = 0;   -- <<< cambiar a 1 para vaciar las tablas antes de cargar")
w("")
w("IF @limpiar = 0 AND (EXISTS (SELECT 1 FROM dbo.empresa) OR EXISTS (SELECT 1 FROM dbo.facturas) OR EXISTS (SELECT 1 FROM dbo.clientes)")
w("    OR EXISTS (SELECT 1 FROM dbo.productos) OR EXISTS (SELECT 1 FROM dbo.impuestos) OR EXISTS (SELECT 1 FROM dbo.series_folios))")
w("BEGIN")
w("    ;THROW 50001, N'Las tablas ya contienen datos. Cambie @limpiar a 1 para reemplazarlos.', 1;")
w("END")
w("")
w("BEGIN TRANSACTION;")
w("")
w("IF @limpiar = 1")
w("BEGIN")
for t in ["pagos", "detalles_factura", "facturas", "productos", "clientes", "series_folios", "impuestos", "empresa"]:
    w(f"    DELETE FROM dbo.{t};")
for t in ["pagos", "detalles_factura", "facturas", "productos", "clientes", "series_folios", "impuestos", "empresa"]:
    w(f"    DBCC CHECKIDENT ('dbo.{t}', RESEED, 0) WITH NO_INFOMSGS;")
w("END")
w("")

CHUNK = 400
for tabla, pk, cols, rows in TABLAS:
    allc = [pk] + cols
    w(f"/* ---------- {tabla} ({len(rows)}) ---------- */")
    w(f"SET IDENTITY_INSERT dbo.{tabla} ON;")
    for i in range(0, len(rows), CHUNK):
        w(f"INSERT INTO dbo.{tabla} (" + ", ".join(f"[{c}]" for c in allc) + ") VALUES")
        chunk = rows[i:i + CHUNK]
        for j, r in enumerate(chunk):
            w("  (" + ", ".join(s(r[c]) for c in allc) + ")" + ("," if j < len(chunk) - 1 else ";"))
    w(f"SET IDENTITY_INSERT dbo.{tabla} OFF;")
    w(f"DBCC CHECKIDENT ('dbo.{tabla}', RESEED) WITH NO_INFOMSGS;")
    w("")

w("COMMIT TRANSACTION;")
w("PRINT N'Datos sintéticos cargados correctamente.';")
w("GO")
w("")
w("/* ---------- Verificaciones (deben devolver 0 filas en las consultas de inconsistencias) ---------- */")
w("SELECT 'empresa' tabla, COUNT(*) filas FROM dbo.empresa UNION ALL SELECT 'impuestos', COUNT(*) FROM dbo.impuestos")
w("UNION ALL SELECT 'series_folios', COUNT(*) FROM dbo.series_folios UNION ALL SELECT 'clientes', COUNT(*) FROM dbo.clientes")
w("UNION ALL SELECT 'productos', COUNT(*) FROM dbo.productos UNION ALL SELECT 'facturas', COUNT(*) FROM dbo.facturas")
w("UNION ALL SELECT 'detalles_factura', COUNT(*) FROM dbo.detalles_factura UNION ALL SELECT 'pagos', COUNT(*) FROM dbo.pagos;")
w("")
w("-- Facturas cuyo encabezado no cuadra con sus detalles")
w("SELECT f.factura_id, f.total, SUM(d.total) suma_detalles")
w("FROM dbo.facturas f JOIN dbo.detalles_factura d ON d.factura_id = f.factura_id")
w("GROUP BY f.factura_id, f.total, f.impuesto_total")
w("HAVING f.total <> SUM(d.total) OR f.impuesto_total <> SUM(d.impuesto_monto);")
w("")
w("-- Estatus de pago incoherente con los pagos registrados")
w("SELECT f.factura_id, f.estatus, f.total, ISNULL(p.pagado,0) pagado")
w("FROM dbo.facturas f LEFT JOIN (SELECT factura_id, SUM(monto) pagado FROM dbo.pagos GROUP BY factura_id) p ON p.factura_id = f.factura_id")
w("WHERE (f.estatus = N'Pagada' AND ISNULL(p.pagado,0) <> f.total)")
w("   OR (f.estatus = N'Parcial' AND NOT (ISNULL(p.pagado,0) > 0 AND p.pagado < f.total))")
w("   OR (f.estatus NOT IN (N'Pagada', N'Parcial') AND ISNULL(p.pagado,0) <> 0);")
w("")
w("-- Resumen por estatus")
w("SELECT estatus, moneda, COUNT(*) facturas, SUM(total) total FROM dbo.facturas GROUP BY estatus, moneda ORDER BY estatus, moneda;")
w("GO")

with open(args.salida, "w", encoding="utf-8-sig", newline="\r\n") as fh:
    fh.write("\n".join(L) + "\n")

# autoverificación
from collections import defaultdict
pag = defaultdict(Decimal)
for p in pagos: pag[p["factura_id"]] += p["monto"]
det = defaultdict(Decimal)
for d in detalles: det[d["factura_id"]] += d["total"]
errs = 0
for f in facturas:
    if det[f["factura_id"]] != f["total"]: errs += 1
    if f["estatus"] == "Pagada" and pag[f["factura_id"]] != f["total"]: errs += 1
    if f["estatus"] == "Parcial" and not (0 < pag[f["factura_id"]] < f["total"]): errs += 1
    if f["estatus"] not in ("Pagada", "Parcial") and pag[f["factura_id"]] != 0: errs += 1
    if f["total"] >= Decimal("100000000"): errs += 1     # decimal(10,2)
for se in series:
    if se["folio_final"] and se["folio_actual"] > se["folio_final"]: errs += 1
MAXLEN = dict(title=10, first_name=50, last_name=50, rfc=13, email=100, phone=20, address=255, city=50, state=50, country=50, zipcode=10,
              nombre=100, direccion=255, ciudad=50, estado=50, pais=50, codigo_postal=10, telefono=20, logo=255, regimen_fiscal=100,
              moneda=3, forma_pago=50, metodo_pago=50, uso_cfdi=100, estatus=20, notas=255, uuid=36, codigo=20, descripcion=255,
              serie=10, tipo_comprobante=20, referencia=100)
for t, _, cols, rows in TABLAS:
    for r in rows:
        for c in cols:
            v = r[c]
            lim = 50 if (t == "impuestos" and c == "nombre") else (10 if (t == "impuestos" and c == "codigo") else MAXLEN.get(c))
            if isinstance(v, str) and lim and len(v) > lim:
                print("LONGITUD", t, c, len(v), v); errs += 1
from collections import Counter
print("filas:", {t: len(r) for t, _, _, r in TABLAS})
print("estatus:", Counter(f["estatus"] for f in facturas))
print("max total:", max(f["total"] for f in facturas), "errores:", errs)
