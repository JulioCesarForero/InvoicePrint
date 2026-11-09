from functools import wraps
from app import db, current_user, request
from .http_errors import AccessForbidden
from sqlalchemy import text


# not implemented
class Rbac:
    def get_page_access(self, path):
        return True


# This is a custom decorator that verifies that this user has access to the page
def rbac_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        rbac = Rbac()
        user_role_id = current_user.get_role()
        path = request.path
        path = path.replace('/api/', '')
        if not rbac.get_page_access(user_role_id, path):
            return AccessForbidden(f"You are not allowed to access this page '{path}'")
        return fn(*args, **kwargs)
    return wrapper
