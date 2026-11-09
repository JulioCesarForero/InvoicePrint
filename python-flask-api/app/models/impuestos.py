from app import db
from datetime import datetime
from wtforms import Form, StringField
from wtforms.validators import *
from .basemodel import BaseModel

from ..helpers.utils import OptionalButNotEmpty


class Impuestos(db.Model):
    __tablename__ = 'impuestos'
    __table_args__ = { "schema": "dbo" }
    nombre = db.Column("nombre", db.String)
    codigo = db.Column("codigo", db.String)
    tasa = db.Column("tasa", db.Float)
    activo = db.Column("activo", db.String)
    impuesto_id = db.Column("impuesto_id", db.Integer, primary_key=True, autoincrement=True)
    
    def _asdict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class ImpuestosAddForm(Form):
    nombre = StringField('Nombre', [InputRequired()])
    codigo = StringField('Codigo', [InputRequired()])
    tasa = StringField('Tasa', [InputRequired()])
    activo = StringField('Activo', [InputRequired()])



class ImpuestosEditForm(Form):
    nombre = StringField('Nombre', [OptionalButNotEmpty()])
    codigo = StringField('Codigo', [OptionalButNotEmpty()])
    tasa = StringField('Tasa', [OptionalButNotEmpty()])
    activo = StringField('Activo', [OptionalButNotEmpty()])
