import { useState, useEffect } from 'react';

const FileExplorer = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentFolder, setCurrentFolder] = useState(null); // ID of current folder

    const fetchFiles = async (folderId = null) => {
        setLoading(true);
        try {
            let url = 'http://localhost:8000/drive/files';
            if (folderId) {
                url += `?folder_id=${folderId}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setFiles(data.files || []);
            setCurrentFolder(folderId);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleFolderClick = (id) => {
        fetchFiles(id);
    };

    const handleBack = () => {
        // In a real app we'd track history. For now just go to root.
        if (currentFolder) {
            fetchFiles(null);
        }
    };

    const getIcon = (mimeType) => {
        if (mimeType === 'application/vnd.google-apps.folder') return '📁';
        if (mimeType.includes('image')) return '🖼️';
        if (mimeType.includes('pdf')) return '📄';
        return '📃';
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>My Drive</h2>
                {currentFolder && (
                    <button className="btn" onClick={handleBack} style={{ background: 'rgba(255,255,255,0.1)' }}>
                        ⬅ Back to Root
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading files...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="glass-panel"
                            style={{
                                padding: '1rem',
                                cursor: file.mimeType === 'application/vnd.google-apps.folder' ? 'pointer' : 'default',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid transparent',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => file.mimeType === 'application/vnd.google-apps.folder' && handleFolderClick(file.id)}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                {getIcon(file.mimeType)}
                            </div>
                            <div style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                                {file.name}
                            </div>
                        </div>
                    ))}
                    {files.length === 0 && <p>No files found.</p>}
                </div>
            )}
        </div>
    );
};

export default FileExplorer;
