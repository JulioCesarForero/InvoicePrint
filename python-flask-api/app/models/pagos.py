from app import db
from datetime import datetime
from wtforms import Form, StringField
from wtforms.validators import *
from .basemodel import BaseModel

from ..helpers.utils import OptionalButNotEmpty
from ..helpers.utils import OptionalNullable



class Pagos(db.Model):
    __tablename__ = 'pagos'
    __table_args__ = { "schema": "dbo" }
    factura_id = db.Column("factura_id", db.Integer)
    monto = db.Column("monto", db.Float)
    fecha_pago = db.Column("fecha_pago", db.DateTime)
    forma_pago = db.Column("forma_pago", db.String)
    referencia = db.Column("referencia", db.String)
    notas = db.Column("notas", db.String)
    created_at = db.Column("created_at", db.DateTime)
    pago_id = db.Column("pago_id", db.Integer, primary_key=True, autoincrement=True)
    
    def _asdict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class PagosAddForm(Form):
    factura_id = StringField('Factura Id', [InputRequired()])
    monto = StringField('Monto', [InputRequired()])
    fecha_pago = StringField('Fecha Pago', [InputRequired()])
    forma_pago = StringField('Forma Pago', [OptionalNullable()])
    referencia = StringField('Referencia', [OptionalNullable()])
    notas = StringField('Notas', [OptionalNullable()])



class PagosEditForm(Form):
    factura_id = StringField('Factura Id', [OptionalButNotEmpty()])
    monto = StringField('Monto', [OptionalButNotEmpty()])
    fecha_pago = StringField('Fecha Pago', [OptionalButNotEmpty()])
    forma_pago = StringField('Forma Pago', [OptionalNullable()])
    referencia = StringField('Referencia', [OptionalNullable()])
    notas = StringField('Notas', [OptionalNullable()])
