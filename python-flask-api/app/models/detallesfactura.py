from app import db
from datetime import datetime
from wtforms import Form, StringField
from wtforms.validators import *
from .basemodel import BaseModel

from ..helpers.utils import OptionalButNotEmpty
from ..helpers.utils import OptionalNullable



class DetallesFactura(db.Model):
    __tablename__ = 'detalles_factura'
    __table_args__ = { "schema": "dbo" }
    factura_id = db.Column("factura_id", db.Integer)
    producto_id = db.Column("producto_id", db.Integer)
    cantidad = db.Column("cantidad", db.Float)
    precio_unitario = db.Column("precio_unitario", db.Float)
    descuento = db.Column("descuento", db.Float)
    impuesto_id = db.Column("impuesto_id", db.Integer)
    impuesto_monto = db.Column("impuesto_monto", db.Float)
    total = db.Column("total", db.Float)
    detalle_id = db.Column("detalle_id", db.Integer, primary_key=True, autoincrement=True)
    
    def _asdict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class DetallesFacturaAddForm(Form):
    factura_id = StringField('Factura Id', [InputRequired()])
    producto_id = StringField('Producto Id', [InputRequired()])
    cantidad = StringField('Cantidad', [InputRequired()])
    precio_unitario = StringField('Precio Unitario', [InputRequired()])
    descuento = StringField('Descuento', [OptionalNullable()])
    impuesto_id = StringField('Impuesto Id', [OptionalNullable()])
    impuesto_monto = StringField('Impuesto Monto', [OptionalNullable()])
    total = StringField('Total', [InputRequired()])



class DetallesFacturaEditForm(Form):
    factura_id = StringField('Factura Id', [OptionalButNotEmpty()])
    producto_id = StringField('Producto Id', [OptionalButNotEmpty()])
    cantidad = StringField('Cantidad', [OptionalButNotEmpty()])
    precio_unitario = StringField('Precio Unitario', [OptionalButNotEmpty()])
    descuento = StringField('Descuento', [OptionalNullable()])
    impuesto_id = StringField('Impuesto Id', [OptionalNullable()])
    impuesto_monto = StringField('Impuesto Monto', [OptionalNullable()])
    total = StringField('Total', [OptionalButNotEmpty()])
