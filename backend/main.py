from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router, CREDENTIALS_FILE
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Try to set GOOGLE_CLOUD_PROJECT from credentials if not set
if not os.getenv("GOOGLE_CLOUD_PROJECT") and os.path.exists(CREDENTIALS_FILE):
    try:
        with open(CREDENTIALS_FILE) as f:
            creds = json.load(f)
            # creds might be nested under 'web' or 'installed'
            if 'web' in creds:
                os.environ["GOOGLE_CLOUD_PROJECT"] = creds['web']['project_id']
            elif 'installed' in creds:
                os.environ["GOOGLE_CLOUD_PROJECT"] = creds['installed']['project_id']
    except Exception as e:
        print(f"Failed to load project_id: {e}")

app = FastAPI(title="Drive Organizer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Drive Organizer API is running"}

from drive_service import list_files

@app.get("/drive/files")
def get_files(folder_id: str = None):
    files = list_files(folder_id=folder_id)
    return {"files": files}

