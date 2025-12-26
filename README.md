# Drive Organizer

A tool to reorganize Google Drive folders using AI.

## Features
- List Google Drive files
- **AI Organizer**: Uses Google Vertex AI (Gemini 1.5 Flash) to suggest folder structures based on file names and types.

## Setup

### Prerequisites
1.  **Google Cloud Project**: You need a Google Cloud Project with billing enabled (required for Vertex AI).
2.  **Enable APIs**:
    -   Google Drive API
    -   Vertex AI API
3.  **Credentials**:
    -   Create an OAuth 2.0 Client ID for the web application (download as `credentials.json` in `backend/`).

### Backend Setup
1.  Navigate to `backend`:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Vertex AI Configuration**:
    -   Ensure your user account (or service account) has `Vertex AI User` role.
    -   The application uses **Application Default Credentials (ADC)** or the project ID from `credentials.json` to authenticate with Vertex AI.
    -   Run `gcloud auth application-default login` if running locally without a service account, OR ensure `credentials.json` is present and valid.

5.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend Setup
1.  Navigate to `frontend`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## Usage
1.  Open http://localhost:5173
2.  Login with Google.
3.  Go to the **AI Organizer** tab.
4.  Select a folder and click "Analyze".
