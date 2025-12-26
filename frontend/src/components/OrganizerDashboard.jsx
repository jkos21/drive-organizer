import { useState, useEffect } from 'react';
import FolderSelector from './FolderSelector';

const OrganizerDashboard = ({ token }) => {
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [selectedFolderName, setSelectedFolderName] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Status State
    const [aiStatus, setAiStatus] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

    const handleFolderSelect = (id, name) => {
        setSelectedFolderId(id);
        setSelectedFolderName(name);
        setResult(null);
        setError(null);
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

                {/* Context Selection */}
                {!selectedFolderId ? (
                    <FolderSelector token={token} onSelect={handleFolderSelect} />
                ) : (
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Selected Context</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>📁 {selectedFolderName}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn" onClick={() => setSelectedFolderId(null)}>Change Folder</button>
                            <button
                                className="btn btn-primary"
                                onClick={runAnalysis}
                                disabled={analyzing || aiStatus?.status === 'error'}
                            >
                                {analyzing ? 'Analyzing...' : 'Run Analysis'}
                            </button>
                        </div>
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
        </div>
    );
};

export default OrganizerDashboard;
