from googleapiclient.discovery import build
from auth import get_credentials
from fastapi import HTTPException

def get_drive_service(creds=None):
    if not creds:
        creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="User not authenticated")
    return build('drive', 'v3', credentials=creds)

def list_files(page_size=10, folder_id=None):
    service = get_drive_service()
    query = "trashed = false"
    if folder_id:
        query += f" and '{folder_id}' in parents"
    
    results = service.files().list(
        pageSize=page_size, 
        fields="nextPageToken, files(id, name, mimeType, parents, owners, shared, iconLink, size, createdTime)",
        q=query
    ).execute()
    return results.get('files', [])

def get_folder_preview(folder_id, limit=25):
    """
    Fetches the top 'limit' files and a count of total items (up to 1000).
    """
    service = get_drive_service()
    query = f"trashed = false and '{folder_id}' in parents"
    
    # improved fields to include iconLink and size
    results = service.files().list(
        pageSize=1000, 
        fields="nextPageToken, files(id, name, mimeType, iconLink, size, createdTime)",
        q=query
    ).execute()
    
    files = results.get('files', [])
    total_count = len(files)
    has_more = 'nextPageToken' in results
    
    return {
        "preview": files[:limit],
        "total_count": total_count,
        "has_more": has_more
    }

def move_file(file_id, new_parent_id):
    service = get_drive_service()
    # Retrieve the existing parents to remove
    file = service.files().get(fileId=file_id, fields='parents').execute()
    previous_parents = ",".join(file.get('parents'))
    
    # Move the file to the new folder
    file = service.files().update(
        fileId=file_id,
        addParents=new_parent_id,
        removeParents=previous_parents,
        fields='id, parents'
    ).execute()
    return file

def create_folder(name, parent_id=None):
    service = get_drive_service()
    file_metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    if parent_id:
        file_metadata['parents'] = [parent_id]
        
    file = service.files().create(body=file_metadata, fields='id').execute()
    return file
