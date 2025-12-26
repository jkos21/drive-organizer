import { useState, useEffect } from 'react';
import FileExplorer from './components/FileExplorer';
import OrganizerDashboard from './components/OrganizerDashboard';

function App() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState('explorer'); // 'explorer' or 'organize'

  useEffect(() => {
    // Check for token in URL hash or query (if passed from backend)
    // Or check localStorage
    const savedToken = localStorage.getItem('drive_token');
    if (savedToken) {
      setToken(JSON.parse(savedToken));
    }

    // Simple callback handling (in a real app, use React Router)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      // Exchange code for token
      fetch(`http://localhost:8000/auth/callback?code=${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            setToken(data.token);
            localStorage.setItem('drive_token', JSON.stringify(data.token));
            window.history.replaceState({}, document.title, "/");
          }
        })
        .catch(err => console.error(err));
    }
  }, []);

  const handleLogin = async () => {
    const res = await fetch('http://localhost:8000/auth/login');
    const data = await res.json();
    if (data.auth_url) {
      window.location.href = data.auth_url;
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('drive_token');
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h1 className="logo" style={{ marginBottom: '1.5rem' }}>Drive Organizer AI</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Reorganize your Google Drive with the power of AI.
          </p>
          <button className="btn btn-primary" onClick={handleLogin}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="header glass-panel" style={{ margin: '1rem', borderRadius: '16px' }}>
        <div className="logo">Drive Organizer</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className={`btn ${view === 'explorer' ? 'btn-primary' : ''}`}
            onClick={() => setView('explorer')}
            style={{ background: view === 'explorer' ? undefined : 'transparent', color: view === 'explorer' ? undefined : 'var(--text-secondary)' }}
          >
            Explorer
          </button>
          <button
            className={`btn ${view === 'organize' ? 'btn-primary' : ''}`}
            onClick={() => setView('organize')}
            style={{ background: view === 'organize' ? undefined : 'transparent', color: view === 'organize' ? undefined : 'var(--text-secondary)' }}
          >
            AI Organizer
          </button>
          <button className="btn" onClick={handleLogout} style={{ color: 'var(--danger)', marginLeft: '1rem' }}>
            Logout
          </button>
        </div>
      </header>

      <main className="container">
        {view === 'explorer' && <FileExplorer token={token} />}
        {view === 'organize' && <OrganizerDashboard token={token} />}
      </main>
    </div>
  );
}

export default App;
