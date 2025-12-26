# Drive Organizer AI

An AI-powered application to reorganize your Google Drive.

## Prerequisites
1. **Google Cloud Project**: You need a project with "Google Drive API" and "Vertex AI API" enabled.
2. **Credentials**:
   - Create an OAuth 2.0 Client ID (Web Application).
   - Add `http://localhost:5173` (or your frontend URL) to **Authorized Javascript Origins**.
   - Add `http://localhost:8000/auth/callback` to **Authorized Redirect URIs**.
   - Download the JSON file and rename it to `credentials.json`.
   - Place `credentials.json` in the `backend/` directory.

## Setup & Run

### 1. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Place credentials.json here!

uvicorn main:app --reload
```
Backend will run at `http://localhost:8000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at `http://localhost:5173`.

## Usage
1. Open the frontend.
2. Click "Sign in with Google".
3. Allow access.
4. Browse your files or go to "AI Organizer" to get suggestions.
