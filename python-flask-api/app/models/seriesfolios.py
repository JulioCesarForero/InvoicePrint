from app import db
from datetime import datetime
from wtforms import Form, StringField
from wtforms.validators import *
from .basemodel import BaseModel

from ..helpers.utils import OptionalButNotEmpty
from ..helpers.utils import OptionalNullable



class SeriesFolios(db.Model):
    __tablename__ = 'series_folios'
    __table_args__ = { "schema": "dbo" }
    serie = db.Column("serie", db.String)
    folio_actual = db.Column("folio_actual", db.Integer)
    folio_inicial = db.Column("folio_inicial", db.Integer)
    folio_final = db.Column("folio_final", db.Integer)
    tipo_comprobante = db.Column("tipo_comprobante", db.String)
    activo = db.Column("activo", db.String)
    empresa_id = db.Column("empresa_id", db.Integer)
    serie_folio_id = db.Column("serie_folio_id", db.Integer, primary_key=True, autoincrement=True)
    
    def _asdict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class SeriesFoliosAddForm(Form):
    serie = StringField('Serie', [InputRequired()])
    folio_actual = StringField('Folio Actual', [InputRequired()])
    folio_inicial = StringField('Folio Inicial', [InputRequired()])
    folio_final = StringField('Folio Final', [OptionalNullable()])
    tipo_comprobante = StringField('Tipo Comprobante', [InputRequired()])
    activo = StringField('Activo', [InputRequired()])
    empresa_id = StringField('Empresa Id', [InputRequired()])



class SeriesFoliosEditForm(Form):
    serie = StringField('Serie', [OptionalButNotEmpty()])
    folio_actual = StringField('Folio Actual', [OptionalButNotEmpty()])
    folio_inicial = StringField('Folio Inicial', [OptionalButNotEmpty()])
    folio_final = StringField('Folio Final', [OptionalNullable()])
    tipo_comprobante = StringField('Tipo Comprobante', [OptionalButNotEmpty()])
    activo = StringField('Activo', [OptionalButNotEmpty()])
    empresa_id = StringField('Empresa Id', [OptionalButNotEmpty()])
