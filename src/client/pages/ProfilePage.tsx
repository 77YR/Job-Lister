import { useState, useEffect } from 'react';
import type { UserProfile } from '../../shared/types';
import ResumeUpload from '../components/ResumeUpload';
import ProfileEditor from '../components/ProfileEditor';

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load existing profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      // No profile yet is not an error
    } finally {
      setLoading(false);
    }
  };

  const handleProfileParsed = (parsedProfile: UserProfile) => {
    setProfile(parsedProfile);
  };

  const handleProfileSaved = async (updatedProfile: UserProfile) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updatedProfile }),
      });

      const data = await response.json();
      if (data.success) {
        setProfile(updatedProfile);
        alert('Profile saved successfully!');
      } else {
        throw new Error(data.error || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div>
        <h2>Profile</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <h2>Create Your Profile</h2>
        <p style={{ marginTop: '1rem', color: '#666', lineHeight: '1.6' }}>
          Upload your resume to get started. We'll extract your skills, experience, education, and projects
          automatically. You'll be able to review and edit everything before saving.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <ResumeUpload onProfileParsed={handleProfileParsed} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Profile</h2>
      <ProfileEditor profile={profile} onSave={handleProfileSaved} onReupload={() => setProfile(null)} />
    </div>
  );
}

export default ProfilePage;
