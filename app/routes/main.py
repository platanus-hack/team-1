from flask import Blueprint, jsonify
from ..db_connection import supabase

main = Blueprint('main', __name__)

@main.route('/health')
def health_check():
    return jsonify({'status': 'ok'})

@main.route('/api/test')
def test_endpoint():
    return jsonify({
        'message': 'API funcionando correctamente',
        'status': 'success'
    }) 

@main.route('/api/ping_db')
def ping_db():
    response = supabase.table('test').select('*').execute()
    return jsonify({"data": response.data})
