import { useState, useEffect } from 'react';

const FolderSelector = ({ token, onSelect }) => {
    const [currentFolder, setCurrentFolder] = useState(null); // null = root
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Drive' }]);

    const fetchFiles = async (folderId) => {
        setLoading(true);
        try {
            const url = folderId
                ? `http://localhost:8000/drive/files?folder_id=${folderId}`
                : `http://localhost:8000/drive/files`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            // Filter only folders for the selection navigation
            // (Unless we want to show files too, but for context selection folders are key)
            const folders = data.files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
            setItems(folders);
        } catch (error) {
            console.error("Error loading folders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentFolder);
    }, [currentFolder, token]);

    const handleNavigate = (folder) => {
        setCurrentFolder(folder.id);
        setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
    };

    const handleBreadcrumbClick = (index) => {
        const target = breadcrumbs[index];
        setCurrentFolder(target.id);
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Select Context Folder</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => onSelect(currentFolder, breadcrumbs[breadcrumbs.length - 1].name)}
                >
                    Select "{breadcrumbs[breadcrumbs.length - 1].name}"
                </button>
            </div>

            {/* Breadcrumbs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.id || 'root'} style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                            onClick={() => handleBreadcrumbClick(index)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: index === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--primary)',
                                cursor: 'pointer',
                                fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal',
                                padding: '2px 5px'
                            }}
                        >
                            {crumb.name}
                        </button>
                        {index < breadcrumbs.length - 1 && <span style={{ color: '#666' }}>/</span>}
                    </span>
                ))}
            </div>

            {/* Folder List */}
            <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
            }}>
                {loading ? (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>Loading folders...</div>
                ) : items.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>No subfolders found</div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {items.map(folder => (
                            <li key={folder.id}>
                                <button
                                    onClick={() => handleNavigate(folder)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        color: 'var(--text-primary)',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                    className="folder-item"
                                >
                                    <span style={{ marginRight: '0.5rem' }}>📁</span>
                                    {folder.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default FolderSelector;
