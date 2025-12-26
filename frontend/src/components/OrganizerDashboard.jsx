import { useState } from 'react';

const OrganizerDashboard = () => {
    return (
        <div>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem' }}>AI Assistant</h2>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px dashed rgba(255, 255, 255, 0.2)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        The AI Organization feature is currently disabled for maintenance.
                    </p>
                    <button className="btn btn-secondary" disabled>
                        Feature Not Available
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                        Check back later for updates.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
