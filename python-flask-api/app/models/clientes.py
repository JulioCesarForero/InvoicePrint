from app import db
from datetime import datetime
from wtforms import Form, StringField
from wtforms.validators import *
from .basemodel import BaseModel

from ..helpers.utils import OptionalButNotEmpty
from ..helpers.utils import OptionalNullable



class Clientes(db.Model):
    __tablename__ = 'clientes'
    __table_args__ = { "schema": "dbo" }
    title = db.Column("title", db.String)
    first_name = db.Column("first_name", db.String)
    last_name = db.Column("last_name", db.String)
    rfc = db.Column("rfc", db.String)
    email = db.Column("email", db.String)
    phone = db.Column("phone", db.String)
    address = db.Column("address", db.String)
    city = db.Column("city", db.String)
    state = db.Column("state", db.String)
    country = db.Column("country", db.String)
    zipcode = db.Column("zipcode", db.String)
    created_at = db.Column("created_at", db.DateTime)
    cliente_id = db.Column("cliente_id", db.Integer, primary_key=True, autoincrement=True)
    
    def _asdict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class ClientesAddForm(Form):
    title = StringField('Title', [OptionalNullable()])
    first_name = StringField('First Name', [InputRequired()])
    last_name = StringField('Last Name', [InputRequired()])
    rfc = StringField('Rfc', [OptionalNullable()])
    email = StringField('Email', [OptionalNullable(),Email()])
    phone = StringField('Phone', [OptionalNullable()])
    address = StringField('Address', [OptionalNullable()])
    city = StringField('City', [OptionalNullable()])
    state = StringField('State', [OptionalNullable()])
    country = StringField('Country', [OptionalNullable()])
    zipcode = StringField('Zipcode', [OptionalNullable()])



class ClientesEditForm(Form):
    title = StringField('Title', [OptionalNullable()])
    first_name = StringField('First Name', [OptionalButNotEmpty()])
    last_name = StringField('Last Name', [OptionalButNotEmpty()])
    rfc = StringField('Rfc', [OptionalNullable()])
    email = StringField('Email', [OptionalNullable(),Email()])
    phone = StringField('Phone', [OptionalNullable()])
    address = StringField('Address', [OptionalNullable()])
    city = StringField('City', [OptionalNullable()])
    state = StringField('State', [OptionalNullable()])
    country = StringField('Country', [OptionalNullable()])
    zipcode = StringField('Zipcode', [OptionalNullable()])
