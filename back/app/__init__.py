from flask import Flask, render_template
from .config.config import Config
from .endpoints import app as homeViews
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.register_blueprint(homeViews)
    
    CORS(app)
    return app