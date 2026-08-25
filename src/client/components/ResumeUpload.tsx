import { useState } from 'react';
import type { UserProfile } from '../../shared/types';

interface ResumeUploadProps {
  onProfileParsed: (profile: UserProfile) => void;
}

function ResumeUpload({ onProfileParsed }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.profile) {
        onProfileParsed(data.profile);
      } else {
        throw new Error(data.error || 'Failed to parse resume');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        style={{
          border: dragActive ? '2px dashed #007bff' : '2px dashed #ccc',
          borderRadius: '8px',
          padding: '3rem',
          textAlign: 'center',
          background: dragActive ? '#f0f8ff' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {uploading ? (
          <div>
            <p style={{ fontSize: '1.2rem' }}>⏳ Processing resume...</p>
            <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Extracting text and parsing structure
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📄 Drop your resume here</p>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>or</p>
            <label
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#007bff',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Choose File
              <input
                type="file"
                accept=".pdf"
                onChange={handleChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem' }}>
              PDF only • Max 5MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00',
        }}>
          ❌ {error}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>ℹ️ What happens next?</h3>
        <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>We extract text from your PDF locally</li>
          <li>We parse your resume deterministically (no AI)</li>
          <li>You review and edit the extracted information</li>
          <li>Your profile is saved to your local database</li>
        </ol>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem' }}>
          🔒 Your resume never leaves your computer except during this upload to your local server.
        </p>
      </div>
    </div>
  );
}

export default ResumeUpload;
