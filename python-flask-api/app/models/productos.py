from app import db
from datetime import datetime
from wtforms import Form, StringField
from wtforms.validators import *
from .basemodel import BaseModel

from ..helpers.utils import OptionalButNotEmpty
from ..helpers.utils import OptionalNullable



class Productos(db.Model):
    __tablename__ = 'productos'
    __table_args__ = { "schema": "dbo" }
    codigo = db.Column("codigo", db.String)
    nombre = db.Column("nombre", db.String)
    descripcion = db.Column("descripcion", db.String)
    precio_unitario = db.Column("precio_unitario", db.Float)
    impuesto_id = db.Column("impuesto_id", db.Integer)
    activo = db.Column("activo", db.String)
    producto_id = db.Column("producto_id", db.Integer, primary_key=True, autoincrement=True)
    
    def _asdict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class ProductosAddForm(Form):
    codigo = StringField('Codigo', [InputRequired()])
    nombre = StringField('Nombre', [InputRequired()])
    descripcion = StringField('Descripcion', [OptionalNullable()])
    precio_unitario = StringField('Precio Unitario', [InputRequired()])
    impuesto_id = StringField('Impuesto Id', [OptionalNullable()])
    activo = StringField('Activo', [InputRequired()])



class ProductosEditForm(Form):
    codigo = StringField('Codigo', [OptionalButNotEmpty()])
    nombre = StringField('Nombre', [OptionalButNotEmpty()])
    descripcion = StringField('Descripcion', [OptionalNullable()])
    precio_unitario = StringField('Precio Unitario', [OptionalButNotEmpty()])
    impuesto_id = StringField('Impuesto Id', [OptionalNullable()])
    activo = StringField('Activo', [OptionalButNotEmpty()])
