from sqlalchemy import text
from app import db


class FolioError(Exception):
    """La serie no permite asignar un folio (inexistente, inactiva o agotada)."""


def asignar_folio(serie_folio_id):
    """
    Reserva el siguiente folio de la serie y lo devuelve.

    El UPDATE incrementa folio_actual y bloquea la fila de la serie hasta el
    commit de la transacción en curso, así dos altas simultáneas nunca reciben
    el mismo folio. Si el alta falla y se hace rollback, el folio se libera.
    Debe llamarse dentro de la misma sesión/transacción que inserta la factura.
    """
    if serie_folio_id in (None, ''):
        raise FolioError('Debe indicar la serie de la factura.')

    row = db.session.execute(
        text("""
            UPDATE dbo.series_folios
               SET folio_actual = folio_actual + 1
            OUTPUT inserted.folio_actual, inserted.folio_final, inserted.activo, inserted.serie
             WHERE serie_folio_id = :id
        """),
        {"id": int(serie_folio_id)},
    ).first()

    if row is None:
        raise FolioError(f'La serie {serie_folio_id} no existe.')
    if not row.activo:
        raise FolioError(f'La serie {row.serie} está inactiva.')
    if row.folio_final is not None and row.folio_actual > row.folio_final:
        raise FolioError(f'La serie {row.serie} agotó sus folios (folio final {row.folio_final}).')

    return row.folio_actual
