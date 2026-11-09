from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy import inspect
from app import db
from ..helpers.softdelete import QueryWithSoftDelete
from datetime import datetime

class BaseModel(db.Model):
    """Base model class that includes soft delete functionality"""
    __abstract__ = True
    
    # Configuración para soft delete
    __delete_column__ = "date_deleted"
    query_class = QueryWithSoftDelete
    
    # Columna para soft delete
    date_deleted = db.Column("date_deleted", db.DateTime, nullable=True)

    def __iter__(self):
        return self._asdict().iteritems()

    def _asdict(self, backref=None):
        res = {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
        for attr, relation in self.__mapper__.relationships.items():
            # Avoid recursive loop between two tables.
            if backref == self.__table__:
                continue
            value = getattr(self, attr)
            if value is None:
                res[relation.key] = None
            elif isinstance(value.__class__, DeclarativeMeta):
                res[relation.key] = value._asdict(backref=self.__table__)
            else:
                res[relation.key] = [(row._asdict(backref=self.__table__)) for row in value]
        return res
