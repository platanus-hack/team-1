import os
import uuid
import logging
import json
import time
import requests
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from ..services.s3_service import upload_file_to_s3
from ..db_connection import supabase
from ..services.aws_service import get_transcribe_client, get_bedrock_client
from openai import OpenAI

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bitacora = Blueprint('bitacora', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'wav', 'mp3'}

def transcribe_with_whisper(audio_path):
    """
    Transcribe audio using OpenAI's Whisper model
    """
    logger.info("🎯 Iniciando proceso de transcripción con Whisper...")
    try:
        client = OpenAI()
        
        with open(audio_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="es",
                response_format="text"
            )
            
        logger.info("✅ Transcripción con Whisper completada")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error en transcripción con Whisper: {str(e)}")
        raise

def transcribe_audio(audio_url, service="aws"):
    """
    Inicia el trabajo de transcripción usando el servicio especificado.
    Args:
        audio_url: URL o path del archivo de audio
        service: 'aws' o 'whisper'
    """
    logger.info(f"🎯 Iniciando proceso de transcripción con {service}...")
    
    if service == "whisper":
        return transcribe_with_whisper(audio_url)
    elif service == "aws":
        # Código existente de AWS Transcribe
        transcribe_client = get_transcribe_client()
        transcripcion_id = f"transcripcion-{uuid.uuid4()}"
        
        try:
            # Intentar iniciar el trabajo de transcripción
            response = transcribe_client.start_transcription_job(
                TranscriptionJobName=transcripcion_id,
                Media={'MediaFileUri': audio_url},
                MediaFormat='wav',
                LanguageCode='es-ES'
            )
            logger.info(f"✅ Trabajo de transcripción iniciado: {transcripcion_id}")
            logger.info(f"Detalles de la respuesta: {response}")

            # Esperar a que la transcripción se complete
            while True:
                status = transcribe_client.get_transcription_job(TranscriptionJobName=transcripcion_id)
                job_status = status['TranscriptionJob']['TranscriptionJobStatus']
                logger.info(f"Estado actual: {job_status}")
                
                if job_status == 'COMPLETED':
                    # Obtener la URL del resultado
                    transcript_url = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
                    logger.info(f"✅ Transcripción completada. URL: {transcript_url}")
                    
                    transcript_response = requests.get(transcript_url)
                    transcript_data = transcript_response.json()
                    
                    # Extraer el texto transcrito
                    transcribed_text = transcript_data['results']['transcripts'][0]['transcript']
                    logger.info(f"📝 Texto transcrito: {transcribed_text}")
                    
                    return transcribed_text
                
                elif job_status == 'FAILED':
                    failure_reason = status['TranscriptionJob'].get('FailureReason', 'No failure reason provided')
                    logger.error(f"❌ La transcripción falló. Razón: {failure_reason}")
                    raise Exception(f'La transcripción falló: {failure_reason}')
                
                logger.info("⏳ Esperando transcripción...")
                time.sleep(5)

        except Exception as e:
            logger.error(f"❌ Error en transcripción: {str(e)}")
            logger.error(f"Tipo de error: {type(e)}")
            if hasattr(e, 'response'):
                logger.error(f"Detalles del error AWS: {e.response}")
            raise
    else:
        raise ValueError(f"Servicio de transcripción no soportado: {service}")

def process_with_bedrock(text):
    """
    Procesa el texto con Amazon Bedrock para obtener análisis y emociones
    """
    logger.info("🤖 Procesando texto con Bedrock...")
    logger.info(f"Texto a procesar: {text}")
    bedrock_client = get_bedrock_client()
    
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "text": f"""Tu tarea es procesar una transcripción en la que una persona habla sobre su vida diaria y reflexiones personales. Debes seguir estos pasos:

                    Resumen Ordenado:

                    Lee cuidadosamente la transcripción proporcionada.
                    Genera un resumen ordenado y coherente que capture los puntos clave y reflexiones más importantes.
                    Asegúrate de que el resumen sea claro y facilite la comprensión de las ideas principales expresadas en la transcripción.
                    
                    Clasificación del Estado Emocional:

                    Analiza el tono y contenido emocional de la transcripción.

                    Clasifica el estado emocional general como uno de los siguientes (SOLO COMO UNO DE LOS SIGUIENTES Y NO FUERA DE ELLOS):
                        Felicidad: Una sensación de bienestar, alegría y satisfacción.
                        Tristeza: Un estado de melancolía o aflicción.
                        Ira: Sentimiento intenso de enojo o frustración.
                        Miedo: Estado de alarma o aprehensión ante un peligro percibido.
                        Ansiedad: Preocupación o nerviosismo constante frente a situaciones inciertas.
                        Amor: Sentimiento profundo de afecto o conexión emocional.
                        Sorpresa: Reacción emocional ante algo inesperado o imprevisto.
                        Vergüenza: Sentimiento de incomodidad por haber hecho algo que no cumple con las expectativas sociales o propias.
                        Esperanza: Confianza en que algo deseado o positivo ocurrirá en el futuro.
                        Orgullo: Satisfacción personal por los logros propios o de otros cercanos



                    Generación de una Pregunta de Seguimiento:

                        Crea una pregunta que pueda ser enviada al usuario como notificación horas después, relacionada con los temas o eventos mencionados en la transcripción.

                       La pregunta debe ser personalizada y mostrar interés genuino en el progreso o bienestar del usuario.
                    
                    Realiza un análisis detallado de la transcripción para extraer información que ayude a construir un perfil del usuario.

                        Identifica aspectos como:

                            Intereses y Pasatiempos: Actividades o temas que el usuario disfruta o menciona frecuentemente.
                            Metas y Aspiraciones: Objetivos personales o profesionales que el usuario está tratando de alcanzar.
                            Desafíos y Preocupaciones: Dificultades o inquietudes que el usuario está enfrentando.
                            Valores y Creencias: Principios o convicciones que son importantes para el usuario.
                            Patrones Emocionales: Tendencias en el estado emocional del usuario a lo largo del tiempo.
                            Este análisis debe ser respetuoso y orientado a comprender mejor al usuario para mejorar futuras interacciones.

                    Salida en Formato JSON:

                        title: Un título conciso para la entrada de la bitácora.
                        summary: El resumen que has generado.
                        emotion_state: "Felicidad", "Tristeza", "Ira", "Miedo", "Ansiedad", "Amor", "Sorpresa", "Vergüenza", "Esperanza", "Orgullo"
                        follow_up_question: La pregunta de seguimiento que has creado.
                        analysis: El análisis detallado realizado para el perfil del usuario.



                    Notas Adicionales:

                        Asegúrate de que el resumen sea original y no simplemente una copia de partes de la transcripción.
                        Si la transcripción menciona múltiples emociones, elige la que predomine en el texto.
                        La pregunta de seguimiento debe ser relevante y personalizada según el contenido de la transcripción.
                        El análisis para el perfil debe ser objetivo y basado únicamente en la información proporcionada en la transcripción.

                    Texto: "{text}"

                    Responde en formato JSON con exactamente estas claves: title, summary, emotion_state, follow_up_question, analysis"""
                }
            ]
        }
    ]
    
    try:
        response = bedrock_client.converse(
            modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',
            messages=messages,
        )
        
        response_text = response["output"]["message"]["content"][0]["text"]
        logger.info(f"Respuesta cruda de Bedrock: {response_text}")
        
        # Intentar extraer el JSON de la respuesta
        try:
            result = json.loads(response_text)
        except json.JSONDecodeError:
            # Si la respuesta no es JSON válido, intentamos extraer la parte JSON
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                raise Exception("No se pudo extraer JSON válido de la respuesta")
        
        logger.info("✅ Procesamiento con Bedrock completado")
        logger.info(f"📊 Resultado del análisis: {result}")
        
        # Verificar que todas las claves necesarias estén presentes
        required_keys = ['title', 'summary', 'emotion_state', 'follow_up_question', 'analysis']
        missing_keys = [key for key in required_keys if key not in result]
        if missing_keys:
            raise Exception(f"Faltan las siguientes claves en la respuesta: {missing_keys}")
            
        return result
        
    except Exception as e:
        logger.error(f"❌ Error en Bedrock: {str(e)}")
        logger.error(f"Tipo de error: {type(e)}")
        if hasattr(e, 'response'):
            logger.error(f"Detalles del error: {e.response}")
        raise

@bitacora.route('/api/bitacora', methods=['POST'])
def procesar_bitacora():
    logger.info("📝 Iniciando procesamiento de bitácora")
    
    if 'audio' not in request.files:
        logger.error("❌ No se encontró archivo de audio en la petición")
        return jsonify({'error': 'No audio file provided'}), 400
    
    user_id = request.form.get('user_id')
    transcription_service = request.form.get('transcription_service', 'aws')
    
    if not user_id:
        logger.error("❌ No se proporcionó user_id")
        return jsonify({'error': 'user_id is required'}), 400
        
    audio_file = request.files['audio']
    if audio_file.filename == '':
        logger.error("❌ Nombre de archivo vacío")
        return jsonify({'error': 'No selected file'}), 400
        
    if not allowed_file(audio_file.filename):
        logger.error(f"❌ Tipo de archivo no permitido: {audio_file.filename}")
        return jsonify({'error': 'File type not allowed'}), 400

    try:
        # Crear directorio de uploads si no existe
        logger.info(f"📁 Creando directorio temporal: {current_app.config['UPLOAD_FOLDER']}")
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Guardar archivo temporalmente
        filename = secure_filename(f"{uuid.uuid4()}.wav")
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        logger.info(f"💾 Guardando archivo temporal: {filepath}")
        audio_file.save(filepath)
        
        # Procesar según el servicio seleccionado
        if transcription_service == 'whisper':
            # Para Whisper usamos directamente el archivo temporal
            transcribed_text = transcribe_audio(filepath, service='whisper')
        else:
            # Para AWS necesitamos subir a S3 primero
            logger.info("☁️ Iniciando subida a S3...")
            s3_url = upload_file_to_s3(filepath, filename)
            logger.info(f"✅ Archivo subido exitosamente a S3: {s3_url}")
            transcribed_text = transcribe_audio(s3_url, service='aws')
        
        # Procesar con Bedrock
        bedrock_response = process_with_bedrock(transcribed_text)
        
        try:
            # Guardar registro en Supabase
            logger.info("📦 Guardando registro en Supabase...")
            data = {
                'user_id': user_id,
                'title': bedrock_response['title'],
                'transcription': transcribed_text,
                'summary': bedrock_response['summary'],
                'emotion_state': bedrock_response['emotion_state'],
                'follow_up_question': bedrock_response['follow_up_question'],
                'analysis': bedrock_response['analysis'],
            }
            
            result = supabase.table('bitacoras').insert(data).execute()
            logger.info("✅ Registro guardado en Supabase")
            
            # Limpiar archivo temporal
            logger.info("🧹 Limpiando archivo temporal...")
            os.remove(filepath)
            
            return jsonify({
                'message': 'Bitácora procesada exitosamente',
                'data': result.data[0] if result.data else None
            })
            
        except Exception as db_error:
            logger.error(f"⚠️ Error al guardar en Supabase: {str(db_error)}")
            return jsonify({
                'error': 'Error al guardar en base de datos',
                'details': str(db_error)
            }), 500
        
    except Exception as e:
        error_message = str(e)
        logger.error(f"❌ Error procesando bitácora: {error_message}")
        return jsonify({'error': error_message}), 500

@bitacora.route('/api/bitacora', methods=['GET'])
def obtener_bitacoras():
    logger.info("📖 Iniciando obtención de bitácoras")
    
    # Obtener user_id de los parámetros de query
    user_id = request.args.get('user_id')
    
    if not user_id:
        logger.error("❌ No se proporcionó user_id")
        return jsonify({'error': 'user_id is required'}), 400
        
    try:
        # Consultar bitácoras en Supabase
        logger.info(f"🔍 Buscando bitácoras para user_id: {user_id}")
        result = supabase.table('bitacoras')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
            
        logger.info(f"✅ Se encontraron {len(result.data)} bitácoras")
        
        return jsonify({
            'message': 'Bitácoras obtenidas exitosamente',
            'data': result.data
        })
        
    except Exception as e:
        error_message = str(e)
        logger.error(f"❌ Error obteniendo bitácoras: {error_message}")
        return jsonify({
            'error': 'Error al obtener bitácoras',
            'details': error_message
        }), 500