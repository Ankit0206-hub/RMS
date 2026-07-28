import os
import shutil
import uuid
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile

# Configure R2 details from environment (they will be None if not set)
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_PUBLIC_URL_PREFIX = os.getenv("R2_PUBLIC_URL_PREFIX")

def get_r2_client():
    if not all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME]):
        return None
        
    endpoint_url = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    return boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto"
    )

async def upload_file_to_r2_or_local(file: UploadFile, directory: str = "profiles") -> str:
    """
    Uploads a file to Cloudflare R2 if configured. Otherwise falls back to local storage.
    Returns the absolute public URL (if R2) or relative URL (if local).
    """
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"{uuid.uuid4()}.{ext}"
    
    r2_client = get_r2_client()
    
    # 1. Attempt R2 Upload
    if r2_client:
        try:
            # Construct object key, e.g., "profiles/1234-abcd.jpg"
            object_key = f"{directory}/{filename}"
            
            # Read file bytes for boto3
            file_bytes = await file.read()
            
            # Reset file pointer in case it needs to be read again (though we won't need to)
            await file.seek(0)
            
            r2_client.put_object(
                Bucket=R2_BUCKET_NAME,
                Key=object_key,
                Body=file_bytes,
                ContentType=file.content_type
            )
            
            # Construct public URL
            # If a custom prefix is provided, use it (e.g., https://pub-xxxx.r2.dev)
            if R2_PUBLIC_URL_PREFIX:
                public_url = f"{R2_PUBLIC_URL_PREFIX.rstrip('/')}/{object_key}"
            else:
                # Fallback to general R2 dev url format if they didn't provide a prefix but provided other creds
                public_url = f"https://{R2_BUCKET_NAME}.{R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{object_key}"
                
            return public_url
            
        except ClientError as e:
            print(f"Failed to upload to R2, falling back to local. Error: {e}")
            # Reset pointer to allow local save fallback
            await file.seek(0)
            
    # 2. Local Upload Fallback
    upload_dir = os.path.join("static", "uploads", directory)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return f"/static/uploads/{directory}/{filename}"

def delete_file_r2_or_local(file_url: str):
    """
    Attempts to delete a file from R2 or local storage based on the URL.
    """
    if not file_url:
        return
        
    # Check if it's a local file
    if file_url.startswith("/static/"):
        old_file = os.path.join(".", file_url.lstrip("/"))
        if os.path.exists(old_file):
            try:
                os.remove(old_file)
            except Exception as e:
                print(f"Error removing local file {old_file}: {e}")
    else:
        # It's an R2 URL
        r2_client = get_r2_client()
        if r2_client and R2_BUCKET_NAME:
            try:
                # Extract object key from URL. 
                # This depends on how the URL is formatted, but usually it's everything after the domain.
                # Assuming R2_PUBLIC_URL_PREFIX is set and the url starts with it:
                if R2_PUBLIC_URL_PREFIX and file_url.startswith(R2_PUBLIC_URL_PREFIX):
                    object_key = file_url[len(R2_PUBLIC_URL_PREFIX):].lstrip("/")
                else:
                    # Generic split, grab the path portion. This is basic and might need refinement based on exact domain.
                    from urllib.parse import urlparse
                    parsed = urlparse(file_url)
                    object_key = parsed.path.lstrip("/")
                    
                if object_key:
                    r2_client.delete_object(Bucket=R2_BUCKET_NAME, Key=object_key)
            except Exception as e:
                print(f"Error removing R2 object {file_url}: {e}")
