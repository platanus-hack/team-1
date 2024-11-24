import os
from flask import current_app
from .aws_service import get_s3_client

def upload_file_to_s3(file_path, file_name):
    """
    Sube un archivo a S3 y retorna su URL
    """
    s3_client = get_s3_client()
    bucket_name = current_app.config['AWS_BUCKET_NAME']
    s3_key = f'audio/{file_name}'
    
    try:
        s3_client.upload_file(file_path, bucket_name, s3_key)
        return f"s3://{bucket_name}/{s3_key}"
    except Exception as e:
        raise Exception(f'Error uploading file to S3: {str(e)}') 