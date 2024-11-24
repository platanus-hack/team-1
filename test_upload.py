import requests
import uuid
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Inicializar cliente de Supabase
supabase = create_client(
    os.getenv('SUPABASE_PROJECT_URL'),
    os.getenv('SUPABASE_API_KEY')
)

def create_test_user():
    """Crea un usuario de prueba y retorna su ID"""
    user_data = {
        'id': str(uuid.uuid4()),
        'name': 'Usuario de Prueba',
        'email': f'test_{uuid.uuid4()}@test.com'
    }
    
    try:
        result = supabase.table('usuarios').insert(user_data).execute()
        return result.data[0]['id']
    except Exception as e:
        print(f"Error creando usuario: {str(e)}")
        # Si falla, intentamos obtener un usuario existente
        result = supabase.table('usuarios').select('id').limit(1).execute()
        if result.data:
            return result.data[0]['id']
        raise

def test_upload():
    # Obtener un ID de usuario válido
    user_id = create_test_user()
    print(f"🧑 Usuario ID: {user_id}")
    
    # URL del endpoint
    url = 'http://localhost:5000/api/bitacora'
    
    # Ruta al archivo de audio de prueba
    audio_path = '/Users/sat/Downloads/test-ght-audio.wav'
    
    # Datos del formulario
    form_data = {
        'user_id': user_id,
        'title': 'Bitácora de prueba'
    }
    
    # Archivo de audio
    files = {
        'audio': ('test.wav', open(audio_path, 'rb'))
    }
    
    print("🚀 Enviando solicitud...")
    response = requests.post(url, data=form_data, files=files)
    print(f"📬 Código de respuesta: {response.status_code}")
    print("📝 Respuesta:")
    print(response.json())

if __name__ == '__main__':
    test_upload() 