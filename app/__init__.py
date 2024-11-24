from flask import Flask
from flask_cors import CORS
from .config import config

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Inicializar CORS
    CORS(app)
    
    # Registrar blueprints
    from .routes.main import main as main_blueprint
    from .routes.bitacora import bitacora as bitacora_blueprint
    from .routes.user_profile import user_profile as user_profile_blueprint
    
    app.register_blueprint(main_blueprint)
    app.register_blueprint(bitacora_blueprint)
    app.register_blueprint(user_profile_blueprint)
    
    # Manejador básico de errores
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
        
    return app 