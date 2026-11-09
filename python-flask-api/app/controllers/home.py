


from flask import Blueprint, render_template

from app import db, jsonify
from ..helpers.http_errors import InternalServerError








Home_blueprint = Blueprint('Home', __name__)


@Home_blueprint.route('/')
@Home_blueprint.route('/index')
def home():
    return render_template('pages/home/index.html')
