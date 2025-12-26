# Drive Organizer - Implementation Plan & Status

## Project Overview
A web application to organize Google Drive files. The core file browsing and management features are implemented.

## ⚠️ Known Issues & Shelved Features
### AI Auto-Organization (Shelved)
**Status:** Disabled / Not Implemented
**Date:** 2025-12-26

**Context:**
We attempted to integrate Google Vertex AI (Gemini 1.5 Flash/Pro) to automatically suggest folder structures. 
However, we encountered persistent friction:
1.  **Vertex AI Access:** Repeated 404 errors accessing models in `us-central1` despite billing/API enablement.
2.  **Authentication:** Complexity with Service Accounts vs User OAuth for AI scope.
3.  **Frontend/Backend Stability:** Debugging the integration caused frequent regressions in the main application flow (CORS, crashes).

**Decision:**
We have decided to **remove the AI module** for now to preserve the stability of the core file browser. The "Analyze My Drive" button remains in the UI but displays a "Not Available" message.

**Future Work:**
- Re-evaluate using a simpler API Key approach (Google AI Studio) once the project is stable.
- Focus on manual bulk-organizing features first.

## Current Architecture
- **Backend:** FastAPI (Python)
- **Frontend:** React + Vite
- **Auth:** Google OAuth 2.0 (Drive Scope only)
