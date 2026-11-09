from app import  db
class QueryWithSoftDelete(db.Query):
    _with_deleted = False

    def __new__(cls, *args, **kwargs):
        obj = super(QueryWithSoftDelete, cls).__new__(cls)
        obj._with_deleted = kwargs.pop('_with_deleted', False)
        if len(args) > 0:
            super(QueryWithSoftDelete, obj).__init__(*args, **kwargs)
            
            modelclass = args[0]
            column_name = getattr(modelclass, "__delete_column__") # get column name for date deleted
            delete_field = getattr(modelclass, column_name)

            # filtra donde date_deleted es null
            return obj.filter(delete_field == None) if not obj._with_deleted else obj
        return obj

    def __init__(self, *args, **kwargs):
        pass

    def with_deleted(self):
        # Para incluir registros eliminados en la consulta
        return self.__class__(db.class_mapper(self._mapper_zero().class_), 
                            session=db.session(), 
                            _with_deleted=True)

    def _get(self, *args, **kwargs):
        return super(QueryWithSoftDelete, self).get(*args, **kwargs)

    def get(self, *args, **kwargs):
        obj = self.with_deleted()._get(*args, **kwargs)
        return obj if obj is None or self._with_deleted or not obj.deleted else None
