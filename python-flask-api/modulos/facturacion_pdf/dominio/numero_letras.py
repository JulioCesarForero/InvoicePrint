"""Importe con letra al estilo de las representaciones impresas de CFDI."""
from decimal import Decimal, ROUND_HALF_UP

_UNIDADES = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ",
             "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO",
             "DIECINUEVE", "VEINTE", "VEINTIÚN", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO",
             "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"]
_DECENAS = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"]
_CENTENAS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
             "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"]

MONEDAS = {
    "MXN": ("PESO", "PESOS", "M.N."),
    "USD": ("DÓLAR", "DÓLARES", "USD"),
    "EUR": ("EURO", "EUROS", "EUR"),
}


def _menor_mil(n):
    if n == 0:
        return ""
    if n == 100:
        return "CIEN"
    c, r = divmod(n, 100)
    partes = [_CENTENAS[c]] if c else []
    if r < 30:
        partes.append(_UNIDADES[r])
    else:
        d, u = divmod(r, 10)
        partes.append(_DECENAS[d] + (" Y " + _UNIDADES[u] if u else ""))
    return " ".join(p for p in partes if p)


def entero_a_letras(n):
    n = int(n)
    if n == 0:
        return "CERO"
    partes = []
    millones, resto = divmod(n, 1_000_000)
    miles, unidades = divmod(resto, 1000)
    if millones:
        partes.append("UN MILLÓN" if millones == 1 else entero_a_letras(millones) + " MILLONES")
    if miles:
        partes.append("MIL" if miles == 1 else _menor_mil(miles) + " MIL")
    if unidades:
        partes.append(_menor_mil(unidades))
    return " ".join(partes)


def importe_con_letra(importe, moneda="MXN"):
    """1160.5, 'MXN' -> 'UN MIL CIENTO SESENTA PESOS 50/100 M.N.'"""
    importe = Decimal(str(importe or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    entero = int(importe)
    centavos = int((importe - entero) * 100)
    singular, plural, sufijo = MONEDAS.get((moneda or "MXN").upper(), (moneda, moneda, moneda))
    texto = entero_a_letras(entero)
    # "UN MIL" es la forma usual en documentos fiscales mexicanos
    if texto.startswith("MIL"):
        texto = "UN " + texto
    nombre = singular if entero == 1 else plural
    if entero >= 1_000_000 and entero % 1_000_000 == 0:
        nombre = "DE " + nombre
    return f"{texto} {nombre} {centavos:02d}/100 {sufijo}"
