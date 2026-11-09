from app import db
from datetime import datetime
from wtforms import Form, StringField
from wtforms.validators import *
from .basemodel import BaseModel

from ..helpers.utils import OptionalButNotEmpty
from ..helpers.utils import OptionalNullable



class Empresa(db.Model):
    __tablename__ = 'empresa'
    __table_args__ = { "schema": "dbo" }
    nombre = db.Column("nombre", db.String)
    rfc = db.Column("rfc", db.String)
    direccion = db.Column("direccion", db.String)
    ciudad = db.Column("ciudad", db.String)
    estado = db.Column("estado", db.String)
    pais = db.Column("pais", db.String)
    codigo_postal = db.Column("codigo_postal", db.String)
    telefono = db.Column("telefono", db.String)
    email = db.Column("email", db.String)
    logo = db.Column("logo", db.String)
    regimen_fiscal = db.Column("regimen_fiscal", db.String)
    empresa_id = db.Column("empresa_id", db.Integer, primary_key=True, autoincrement=True)
    
    def _asdict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class EmpresaAddForm(Form):
    nombre = StringField('Nombre', [InputRequired()])
    rfc = StringField('Rfc', [InputRequired()])
    direccion = StringField('Direccion', [OptionalNullable()])
    ciudad = StringField('Ciudad', [OptionalNullable()])
    estado = StringField('Estado', [OptionalNullable()])
    pais = StringField('Pais', [OptionalNullable()])
    codigo_postal = StringField('Codigo Postal', [OptionalNullable()])
    telefono = StringField('Telefono', [OptionalNullable()])
    email = StringField('Email', [OptionalNullable(),Email()])
    logo = StringField('Logo', [OptionalNullable()])
    regimen_fiscal = StringField('Regimen Fiscal', [OptionalNullable()])



class EmpresaEditForm(Form):
    nombre = StringField('Nombre', [OptionalButNotEmpty()])
    rfc = StringField('Rfc', [OptionalButNotEmpty()])
    direccion = StringField('Direccion', [OptionalNullable()])
    ciudad = StringField('Ciudad', [OptionalNullable()])
    estado = StringField('Estado', [OptionalNullable()])
    pais = StringField('Pais', [OptionalNullable()])
    codigo_postal = StringField('Codigo Postal', [OptionalNullable()])
    telefono = StringField('Telefono', [OptionalNullable()])
    email = StringField('Email', [OptionalNullable(),Email()])
    logo = StringField('Logo', [OptionalNullable()])
    regimen_fiscal = StringField('Regimen Fiscal', [OptionalNullable()])
