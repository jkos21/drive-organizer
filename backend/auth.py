from fastapi import APIRouter, HTTPException, Request
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import os
import json

router = APIRouter(prefix="/auth", tags=["auth"])

# Allow OAuth over HTTP for local dev
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
]

CREDENTIALS_FILE = "credentials.json"
TOKEN_FILE = "token.json"

@router.get("/login")
def login():
    if not os.path.exists(CREDENTIALS_FILE):
        raise HTTPException(status_code=500, detail="credentials.json not found")
    
    flow = Flow.from_client_secrets_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
        redirect_uri="http://localhost:5173" 
    )
    
    auth_url, _ = flow.authorization_url(prompt='consent')
    return {"auth_url": auth_url}

@router.get("/callback")
def callback(code: str):
    if not os.path.exists(CREDENTIALS_FILE):
        raise HTTPException(status_code=500, detail="credentials.json not found")

    flow = Flow.from_client_secrets_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
        redirect_uri="http://localhost:5173"
    )
    
    flow.fetch_token(code=code)
    creds = flow.credentials
    
    # Save the credentials for the next run
    with open(TOKEN_FILE, 'w') as token:
        token.write(creds.to_json())
        
    return {"message": "Login successful", "token": json.loads(creds.to_json())}

def get_credentials():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    return creds
