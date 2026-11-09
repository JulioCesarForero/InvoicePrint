from app import db
from datetime import datetime
from wtforms import Form, StringField
from wtforms.validators import *
from .basemodel import BaseModel

from ..helpers.utils import OptionalButNotEmpty
from ..helpers.utils import OptionalNullable



class Facturas(db.Model):
    __tablename__ = 'facturas'
    __table_args__ = { "schema": "dbo" }
    serie_folio_id = db.Column("serie_folio_id", db.Integer)
    cliente_id = db.Column("cliente_id", db.Integer)
    empresa_id = db.Column("empresa_id", db.Integer)
    fecha_emision = db.Column("fecha_emision", db.DateTime)
    fecha_vencimiento = db.Column("fecha_vencimiento", db.DateTime)
    subtotal = db.Column("subtotal", db.Float)
    impuesto_total = db.Column("impuesto_total", db.Float)
    total = db.Column("total", db.Float)
    moneda = db.Column("moneda", db.String)
    forma_pago = db.Column("forma_pago", db.String)
    metodo_pago = db.Column("metodo_pago", db.String)
    uso_cfdi = db.Column("uso_cfdi", db.String)
    estatus = db.Column("estatus", db.String)
    notas = db.Column("notas", db.String)
    uuid = db.Column("uuid", db.String)
    created_at = db.Column("created_at", db.DateTime)
    factura_id = db.Column("factura_id", db.Integer, primary_key=True, autoincrement=True)
    
    def _asdict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class FacturasAddForm(Form):
    serie_folio_id = StringField('Serie Folio Id', [InputRequired()])
    cliente_id = StringField('Cliente Id', [InputRequired()])
    empresa_id = StringField('Empresa Id', [InputRequired()])
    fecha_emision = StringField('Fecha Emision', [InputRequired()])
    fecha_vencimiento = StringField('Fecha Vencimiento', [OptionalNullable()])
    subtotal = StringField('Subtotal', [InputRequired()])
    impuesto_total = StringField('Impuesto Total', [InputRequired()])
    total = StringField('Total', [InputRequired()])
    moneda = StringField('Moneda', [InputRequired()])
    forma_pago = StringField('Forma Pago', [OptionalNullable()])
    metodo_pago = StringField('Metodo Pago', [OptionalNullable()])
    uso_cfdi = StringField('Uso Cfdi', [OptionalNullable()])
    estatus = StringField('Estatus', [InputRequired()])
    notas = StringField('Notas', [OptionalNullable()])
    uuid = StringField('Uuid', [OptionalNullable()])



class FacturasEditForm(Form):
    serie_folio_id = StringField('Serie Folio Id', [OptionalButNotEmpty()])
    cliente_id = StringField('Cliente Id', [OptionalButNotEmpty()])
    empresa_id = StringField('Empresa Id', [OptionalButNotEmpty()])
    fecha_emision = StringField('Fecha Emision', [OptionalButNotEmpty()])
    fecha_vencimiento = StringField('Fecha Vencimiento', [OptionalNullable()])
    subtotal = StringField('Subtotal', [OptionalButNotEmpty()])
    impuesto_total = StringField('Impuesto Total', [OptionalButNotEmpty()])
    total = StringField('Total', [OptionalButNotEmpty()])
    moneda = StringField('Moneda', [OptionalButNotEmpty()])
    forma_pago = StringField('Forma Pago', [OptionalNullable()])
    metodo_pago = StringField('Metodo Pago', [OptionalNullable()])
    uso_cfdi = StringField('Uso Cfdi', [OptionalNullable()])
    estatus = StringField('Estatus', [OptionalButNotEmpty()])
    notas = StringField('Notas', [OptionalNullable()])
    uuid = StringField('Uuid', [OptionalNullable()])
