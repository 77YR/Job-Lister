import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';

interface HealthStatus {
  status: string;
  timestamp: string;
  environment: {
    jobsPipeConfigured: boolean;
    databaseConnected: boolean;
  };
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <header style={{ borderBottom: '1px solid #ccc', padding: '1rem 0', marginBottom: '2rem' }}>
          <h1>JobLister</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Local-first job discovery and opportunity-ranking tool
          </p>
          <nav style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <Link to="/">Home</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/search">Search</Link>
            <Link to="/results">Results</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage health={health} error={error} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<PlaceholderPage title="Search" />} />
          <Route path="/results" element={<PlaceholderPage title="Results" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function HomePage({ health, error }: { health: HealthStatus | null; error: string | null }) {
  return (
    <div>
      <h2>Welcome to JobLister</h2>
      <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
        This is a local-first job discovery tool. Upload your resume, set your preferences,
        and find relevant job opportunities ranked by match quality and freshness.
      </p>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', color: '#000' }}>
        <h3>System Status</h3>
        {error && (
          <div style={{ color: 'red', marginTop: '1rem' }}>
            ❌ Failed to connect to backend: {error}
          </div>
        )}
        {health && (
          <div style={{ marginTop: '1rem' }}>
            <p>✅ Backend: {health.status}</p>
            <p>✅ JobsPipe API: {health.environment.jobsPipeConfigured ? 'Configured' : 'Not configured'}</p>
            <p>✅ Database: {health.environment.databaseConnected ? 'Connected' : 'Not connected'}</p>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              Last checked: {new Date(health.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e7f3ff', borderRadius: '8px', color: '#000' }}>
        <h3>🚀 Get Started</h3>
        <p style={{ marginTop: '0.5rem' }}>
          Ready to begin? <Link to="/profile" style={{ fontWeight: 'bold' }}>Upload your resume</Link> to create your profile.
        </p>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', color: '#000' }}>
        <h3>📍 Current Milestone: Milestone 1 - Resume → Profile</h3>
        <p style={{ marginTop: '0.5rem' }}>
          Upcoming milestones:
        </p>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
          <li>Milestone 2: JobsPipe Retrieval</li>
          <li>Milestone 3: Deterministic Matching</li>
          <li>Milestone 4: Opportunity Ranking</li>
        </ul>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        This page will be implemented in a future milestone.
      </p>
    </div>
  );
}

export default App;
