import logging
from flask import Blueprint, jsonify, request
from ..db_connection import supabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

user_profile = Blueprint('user_profile', __name__)

@user_profile.route('/api/user_profile/<user_id>', methods=['GET'])
def get_user(user_id):
    logger.info(f"Fetching user data for ID: {user_id}")
    
    try:
        # Query user data from Supabase
        result = supabase.table('bitacoras')\
            .select('emotion_state', 'created_at')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
            
        if not result.data:
            logger.warning(f"No emotion data found for user ID: {user_id}")
            return jsonify({
                'error': 'No emotion data found for user',
                'data': {
                    'emotions': [],
                    'summary': {
                        'total_entries': 0
                    }
                }
            }), 404
        
        emotions = result.data;

        emotion_summary = {
            'emotions': emotions,
            'summary': {
                'total_entries': len(emotions),
                'latest_emotion': emotions[0]['emotion_state'] if emotions else None,
                'latest_date': emotions[0]['created_at'] if emotions else None
            }
        }
            
        logger.info(f"✅ Found {len(emotions)} emotion entries for user")
        
        return jsonify({
            'message': 'Emotion data retrieved successfully',
            'data': emotion_summary
        })
        
    except Exception as e:
        error_message = str(e)
        logger.error(f"❌ Error fetching emotion data: {error_message}")
        return jsonify({
            'error': 'Error fetching emotion data',
            'details': error_message
        }), 500