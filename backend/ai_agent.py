import os
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
from drive_service import get_drive_service
import json

# Try to load project ID from service account file if env var is missing
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
KEY_FILE = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if not PROJECT_ID and KEY_FILE and os.path.exists(KEY_FILE):
    try:
        with open(KEY_FILE) as f:
            data = json.load(f)
            PROJECT_ID = data.get("project_id")
            print(f"Loaded Project ID from key file: {PROJECT_ID}")
    except Exception as e:
        print(f"Error reading key file: {e}")

LOCATION = "us-central1"
# Updated to 2.0 based on user feedback/availability
MODEL_ID = "gemini-2.0-flash-001" 

def init_vertex():
    if not PROJECT_ID:
        print("Warning: GOOGLE_CLOUD_PROJECT not set")
    vertexai.init(project=PROJECT_ID, location=LOCATION)

def check_vertex_status():
    """
    Checks connection and lists available generative models.
    """
    try:
        init_vertex()
        
        status = {
            "project_id": PROJECT_ID,
            "location": LOCATION,
            "target_model": MODEL_ID,
            "status": "unknown",
            "message": "",
            "available_models": []
        }

        # 1. Verify Target Model
        try:
            model = GenerativeModel(MODEL_ID)
            status["status"] = "configured"
            status["message"] = f"Ready to use {MODEL_ID}"
        except Exception as e:
            status["status"] = "error"
            status["message"] = f"Failed to init {MODEL_ID}: {e}"

        # 2. Try to Discovery/List Models
        # Since standard listing is complex, we'll check a known list of candidates
        candidates = [
            "gemini-2.0-flash-001",
            "gemini-2.5-flash",
            "gemini-1.5-flash-001",
            "gemini-2.0-pro",
            "gemini-2.5-pro"
        ]
        
        found_models = []
        for m_id in candidates:
            try:
                # Lightweight check: just instantiate
                GenerativeModel(m_id)
                found_models.append(m_id)
            except:
                pass
        
        status["available_models"] = found_models
        
        return status
    except Exception as e:
        return {
            "project_id": PROJECT_ID,
            "location": LOCATION,
            "status": "error",
            "message": str(e),
            "available_models": []
        }


def scan_folder_structure(service, folder_id, depth=2, current_depth=0):
    """
    Recursively scans a folder up to a certain depth to get file context.
    Returns a simplified list of files/folders with metadata.
    """
    if current_depth >= depth:
        return []

    query = f"'{folder_id}' in parents and trashed = false"
    try:
        results = service.files().list(
            pageSize=50,  # Limit per folder to avoid huge payloads
            fields="files(id, name, mimeType)",
            q=query
        ).execute()
        
        items = results.get('files', [])
        structure = []
        
        for item in items:
            node = {
                "name": item['name'],
                "type": "folder" if item['mimeType'] == 'application/vnd.google-apps.folder' else "file",
                "mimeType": item['mimeType']
            }
            
            # Recurse if it's a folder
            if node["type"] == "folder":
                node["children"] = scan_folder_structure(service, item['id'], depth, current_depth + 1)
            
            structure.append(node)
            
        return structure
    except Exception as e:
        print(f"Error scanning folder {folder_id}: {e}")
        return []

def analyze_folder(folder_id: str, depth: int = 2):
    """
    Main entry point. Scans a folder and asks AI for organization suggestions.
    """
    try:
        init_vertex()
        service = get_drive_service()
        
        # 1. Scan the folder
        print(f"Scanning folder {folder_id}...")
        structure = scan_folder_structure(service, folder_id, depth=depth)
        
        # 2. Construct Prompt
        # We start with a simple text representation of the file tree
        structure_json = json.dumps(structure, indent=2)
        
        prompt = f"""
You are an intelligent file organization assistant.
I will provide you with a list of files and folders from a Google Drive folder.
Your goal is to suggest a better organization structure based on the content (inferred from file names) and file types.

Here is the current folder structure (JSON):
{structure_json}

INSTRUCTIONS:
1. Analyze the file names and types to determine their likely category (e.g., specific projects, finance, personal, travel, active vs archive).
2. Suggest a set of top-level folders that would improve organization.
3. For each existing file/folder, suggest which NEW top-level folder it should be moved to.
4. If a file is already in a good place, you can suggest keeping it there or moving it to a simplified structure.

OUTPUT FORMAT:
Return ONLY a valid JSON object with the following structure:
{{
  "suggested_folders": ["Folder A", "Folder B", ...],
  "moves": [
    {{ "file_name": "example.pdf", "current_path": "...", "suggested_folder": "Folder A", "reason": "It appears to be an invoice" }}
  ],
  "summary": "Brief explanation of the reorganization strategy."
}}
Do not include markdown formatting (like ```json), just the raw JSON string.
"""
        
        # 3. Call Vertex AI
        print("Calling Vertex AI...")
        model = GenerativeModel(MODEL_ID)
        
        # Configure for JSON response if possible, or just strict text
        generation_config = GenerationConfig(
            temperature=0.2,
            max_output_tokens=8192,
        )
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        # 4. Parse Response
        raw_text = response.text.strip()
        # Clean up markdown if model adds it despite instructions
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        try:
            parsed_response = json.loads(raw_text)
        except json.JSONDecodeError:
            parsed_response = {"error": "Failed to parse AI response", "raw_text": raw_text}

        return {
            "debug": {
                "prompt_preview": prompt[:500] + "...(truncated)",
                "full_prompt_structure": structure,
                "raw_response": raw_text
            },
            "suggestions": parsed_response
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
