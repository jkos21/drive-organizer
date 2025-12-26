import { useState, useEffect } from 'react';
import FolderSelector from './FolderSelector';

const OrganizerDashboard = ({ token }) => {
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [selectedFolderName, setSelectedFolderName] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Session Cost Tracking
    const [sessionUsage, setSessionUsage] = useState({ total_tokens: 0, total_cost: 0 });

    // Status State
    const [aiStatus, setAiStatus] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

    const handleFolderSelect = async (id, name) => {
        setSelectedFolderId(id);
        setSelectedFolderName(name);
        setResult(null);
        setError(null);
        setPreviewData(null);

        // Fetch Preview immediately
        setLoadingPreview(true);
        try {
            const res = await fetch(`http://localhost:8000/drive/preview?folder_id=${id}`);
            const data = await res.json();
            setPreviewData(data);
        } catch (err) {
            console.error("Preview fetch error:", err);
            // Non-blocking error for preview? Or show error?
            // Already handled by rendering "Failed to load preview" if previewData is null and not loading
        } finally {
            setLoadingPreview(false);
        }
    };

    // 1. Load Status on Mount
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('http://localhost:8000/ai/status');
                const data = await res.json();
                setAiStatus(data);
            } catch (err) {
                console.error("Failed to check AI status:", err);
                setAiStatus({ status: 'error', message: 'Failed to connect to backend' });
            } finally {
                setLoadingStatus(false);
            }
        };
        fetchStatus();
    }, []);

    const runAnalysis = async () => {
        if (!selectedFolderId) return;

        setAnalyzing(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:8000/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ folder_id: selectedFolderId })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);

            // Update Session Usage if present
            if (data.usage) {
                setSessionUsage(prev => ({
                    total_tokens: prev.total_tokens + data.usage.total_tokens,
                    total_cost: prev.total_cost + data.usage.estimated_cost_usd
                }));
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

            {/* LEFT COLUMN: Main Interaction */}
            <div>
                <h2 style={{ marginBottom: '1.5rem' }}>AI Organizer</h2>

                {/* Welcome / Status Message */}
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
                    <h4 style={{ marginTop: 0 }}>Welcome!</h4>
                    {loadingStatus ? (
                        <p>Checking Vertex AI connection...</p>
                    ) : (
                        <div>
                            <p style={{ marginBottom: '0.5rem' }}>
                                <strong>Active Project:</strong> {aiStatus?.project_id || 'Unknown'} <br />
                                <strong>Target Model:</strong> {aiStatus?.target_model || 'Unknown'}
                            </p>

                            {aiStatus?.available_models && aiStatus.available_models.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Detected Models:</strong>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                        {aiStatus.available_models.map(m => (
                                            <span key={m} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {aiStatus?.status === 'error' ? (
                                <div style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                                    ⚠️ <strong>Configuration Error:</strong> {aiStatus.message}
                                </div>
                            ) : (
                                <div style={{ color: '#4caf50' }}>
                                    ✅ <strong>Ready:</strong> System is connected to Vertex AI.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Context Selection and Preview */}
                {!selectedFolderId ? (
                    <FolderSelector token={token} onSelect={handleFolderSelect} />
                ) : (
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Selected Context</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>📁 {selectedFolderName}</div>
                            </div>
                            <button className="btn" onClick={() => { setSelectedFolderId(null); setPreviewData(null); }} disabled={analyzing}>
                                Change Folder
                            </button>
                        </div>

                        {/* Preview Section */}
                        {loadingPreview ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                                Fetching folder metadata...
                            </div>
                        ) : previewData ? (
                            <div className="fade-in">
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '1.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '1rem',
                                    borderRadius: '8px'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Total Items</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                            {previewData.total_count}{previewData.has_more ? '+' : ''}
                                        </div>
                                    </div>
                                </div>

                                <h5 style={{ marginBottom: '0.5rem', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    Folder Content Preview ({previewData.preview.length} items)
                                </h5>
                                <div style={{
                                    maxHeight: '250px',
                                    overflowY: 'auto',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem'
                                }}>
                                    {previewData.preview.map(file => (
                                        <div key={file.id} style={{
                                            padding: '0.5rem 1rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '0.9rem'
                                        }}>
                                            <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>
                                                {file.mimeType.includes('folder') ? '📁' :
                                                    file.mimeType.includes('image') ? '🖼️' :
                                                        file.mimeType.includes('pdf') ? '📄' :
                                                            file.mimeType.includes('text') ? '📝' : '📎'}
                                            </span>
                                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {file.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#666', marginLeft: '1rem' }}>
                                                {file.mimeType.split('.').pop().split('/').pop()}
                                            </div>
                                        </div>
                                    ))}
                                    {previewData.has_more && (
                                        <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                                            ...and {previewData.total_count - previewData.preview.length}+ more items
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                                        onClick={runAnalysis}
                                        disabled={analyzing || aiStatus?.status === 'error'}
                                    >
                                        {analyzing ? (
                                            <>
                                                <span className="spinner-small" style={{ marginRight: '0.5rem' }}></span>
                                                Analyzing with Gemini...
                                            </>
                                        ) : 'Start Organization Analysis'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#ff6b6b' }}>Failed to load preview.</div>
                        )}
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(255, 0, 0, 0.1)', color: '#ff6b6b', borderRadius: '8px', marginBottom: '1rem' }}>
                        Error: {error}
                    </div>
                )}

                {/* Results - Suggestions */}
                {result?.suggestions && (
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Suggestions</h3>
                        {result.suggestions.summary && (
                            <div style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                "{result.suggestions.summary}"
                            </div>
                        )}

                        <h4 style={{ marginBottom: '0.5rem' }}>Proposed Folders</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            {result.suggestions.suggested_folders?.map(f => (
                                <span key={f} style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    fontSize: '0.9rem'
                                }}>
                                    {f}
                                </span>
                            ))}
                        </div>

                        <h4 style={{ marginBottom: '0.5rem' }}>Proposed Moves</h4>
                        <ul style={{ fontSize: '0.9rem', paddingLeft: '1rem' }}>
                            {result.suggestions.moves?.map((move, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>
                                    <strong>{move.file_name}</strong> &rarr; {move.suggested_folder}
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{move.reason}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: Persistent Debug Panel */}
            <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Debug Panel</h3>

                <div style={{ fontSize: '0.8rem', marginBottom: '1rem', opacity: 0.8 }}>
                    Visible for Troubleshooting
                </div>

                {/* AI Request Info */}
                <div style={{ marginBottom: '1rem' }}>
                    <strong>Last Action:</strong> <br />
                    {analyzing ? 'Running Analysis...' : result ? 'Analysis Complete' : 'Idle'}
                </div>

                <details open style={{ marginBottom: '1rem' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold' }}>AI Response Payload</summary>
                    {result ? (
                        <pre style={{
                            marginTop: '0.5rem',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {JSON.stringify(result.suggestions, null, 2)}
                        </pre>
                    ) : (
                        <div style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic', padding: '0.5rem' }}>
                            No response data yet.
                        </div>
                    )}
                </details>

                <details style={{ marginBottom: '1rem' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold' }}>Raw Prompt Sent</summary>
                    {result?.debug?.full_prompt_structure ? (
                        <pre style={{
                            marginTop: '0.5rem',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {JSON.stringify(result.debug.full_prompt_structure, null, 2)}
                        </pre>
                    ) : (
                        <div style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic', padding: '0.5rem' }}>
                            No prompt data yet.
                        </div>
                    )}
                </details>
            </div>

            {/* Session Cost Footer */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: '0.75rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100
            }}>
                <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
                    <span style={{ marginRight: '1rem' }}>Session Usage</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
                    <div>
                        <span style={{ color: '#888', marginRight: '0.5rem' }}>Tokens:</span>
                        <span style={{ fontFamily: 'monospace' }}>{sessionUsage.total_tokens.toLocaleString()}</span>
                    </div>
                    <div>
                        <span style={{ color: '#888', marginRight: '0.5rem' }}>Est. Cost:</span>
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>${sessionUsage.total_cost.toFixed(6)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
