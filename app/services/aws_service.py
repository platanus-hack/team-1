import boto3
from flask import current_app

def get_aws_client(service_name):
    return boto3.client(
        service_name,
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
        region_name=current_app.config['AWS_REGION']
    )

def get_s3_client():
    return get_aws_client('s3')

def get_transcribe_client():
    return get_aws_client('transcribe')

def get_bedrock_client():
    return get_aws_client('bedrock-runtime') 