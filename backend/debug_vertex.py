import vertexai
from vertexai.generative_models import GenerativeModel
from google.cloud import aiplatform_v1
import os
import json
from google.oauth2 import service_account

# Try to load credentials explicitly to see if that helps
CREDENTIALS_FILE = "credentials.json"
PROJECT_ID = None

if os.path.exists(CREDENTIALS_FILE):
    try:
        with open(CREDENTIALS_FILE) as f:
            creds = json.load(f)
            if 'web' in creds:
                PROJECT_ID = creds['web']['project_id']
            elif 'installed' in creds:
                PROJECT_ID = creds['installed']['project_id']
        print(f"Found Project ID in credentials.json: {PROJECT_ID}")
    except Exception as e:
        print(f"Error reading credentials.json: {e}")

if not PROJECT_ID:
    PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
    print(f"Using GOOGLE_CLOUD_PROJECT env var: {PROJECT_ID}")

if not PROJECT_ID:
    print("ERROR: No Project ID found.")
    exit(1)

print(f"Initializing Vertex AI for project: {PROJECT_ID} in us-central1")
import google.auth
creds, project = google.auth.default()
print(f"Active Credentials: {creds}")
print(f"Creds Project: {project}")

try:
    vertexai.init(project=PROJECT_ID, location="us-central1", credentials=creds)
    
    print("Listing PUBLISHER models (checking access)...")
    # Publisher models are listed differently
    # We should just try to get the specific model
    from google.cloud import aiplatform
    
    aiplatform.init(project=PROJECT_ID, location="us-central1")
    
    try:
        from vertexai.preview.generative_models import GenerativeModel
        model = GenerativeModel("gemini-1.5-flash-001")
        print("Model object created. Generating content...")
        response = model.generate_content("Hello")
        print("SUCCESS! Response:", response.text)
    except Exception as e:
        print("GenerativeModel failed:", e)

    # Fallback to direct API call to check if it's a library issue
    print("-" * 20)
    print("Checking Model Garden access...")
    # There isn't a simple list_publisher_models in the high level SDK easily accessible without complex setup
    # But we can try to get a model reference
    
except Exception as e:
    print("------------- ERROR -------------")
    print(e)
    print("---------------------------------")
