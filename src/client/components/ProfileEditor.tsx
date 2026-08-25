import { useState } from 'react';
import type { UserProfile, Skill, Education, Experience, Project, Certification } from '../../shared/types';

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onReupload: () => void;
}

function ProfileEditor({ profile: initialProfile, onSave, onReupload }: ProfileEditorProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications'>('overview');

  const handleSave = () => {
    onSave(profile);
  };

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          Last updated: {new Date(profile.updatedAt).toLocaleString()}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onReupload}
            style={{
              padding: '0.5rem 1rem',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Upload New Resume
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #e0e0e0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['overview', 'skills', 'experience', 'education', 'projects', 'certifications'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #007bff' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                color: activeTab === tab ? '#007bff' : '#666',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab profile={profile} updateField={updateField} />}
      {activeTab === 'skills' && <SkillsTab profile={profile} setProfile={setProfile} />}
      {activeTab === 'experience' && <ExperienceTab profile={profile} setProfile={setProfile} />}
      {activeTab === 'education' && <EducationTab profile={profile} setProfile={setProfile} />}
      {activeTab === 'projects' && <ProjectsTab profile={profile} setProfile={setProfile} />}
      {activeTab === 'certifications' && <CertificationsTab profile={profile} setProfile={setProfile} />}
    </div>
  );
}

// ============================================================================
// Overview Tab
// ============================================================================

function OverviewTab({ profile, updateField }: {
  profile: UserProfile;
  updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
}) {
  return (
    <div>
      <h3>Contact Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Full Name</label>
          <input
            type="text"
            value={profile.fullName || ''}
            onChange={(e) => updateField('fullName', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Email</label>
          <input
            type="email"
            value={profile.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Phone</label>
          <input
            type="tel"
            value={profile.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Location</label>
          <input
            type="text"
            value={profile.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      </div>

      <h3 style={{ marginTop: '2rem' }}>Career Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Candidate Level</label>
          <select
            value={profile.candidateLevel}
            onChange={(e) => updateField('candidateLevel', e.target.value as any)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="unknown">Unknown</option>
            <option value="student">Student</option>
            <option value="recent-graduate">Recent Graduate</option>
            <option value="entry-level">Entry Level</option>
            <option value="mid-level">Mid Level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Graduation Date</label>
          <input
            type="text"
            placeholder="YYYY or YYYY-MM"
            value={profile.graduationDate || ''}
            onChange={(e) => updateField('graduationDate', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      </div>

      {profile.resumeFileName && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
          <p><strong>Resume File:</strong> {profile.resumeFileName}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Skills Tab
// ============================================================================

function SkillsTab({ profile, setProfile }: {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const skill: Skill = {
      id: crypto.randomUUID(),
      name: newSkill.trim(),
      normalizedName: newSkill.trim(),
    };
    setProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    setNewSkill('');
  };

  const removeSkill = (id: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
  };

  return (
    <div>
      <h3>Skills</h3>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Add a skill"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button
          onClick={addSkill}
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {profile.skills.map(skill => (
          <div
            key={skill.id}
            style={{
              padding: '0.5rem 1rem',
              background: '#e7f3ff',
              border: '1px solid #007bff',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{skill.name}</span>
            {skill.category && (
              <span style={{ fontSize: '0.75rem', color: '#666' }}>({skill.category})</span>
            )}
            <button
              onClick={() => removeSkill(skill.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#c00',
                fontWeight: 'bold',
                padding: '0 0.25rem',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {profile.skills.length === 0 && (
        <p style={{ marginTop: '1rem', color: '#666', fontStyle: 'italic' }}>
          No skills added yet. Add your technical and soft skills above.
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Experience Tab
// ============================================================================

function ExperienceTab({ profile, setProfile }: {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) {
  return (
    <div>
      <h3>Experience</h3>
      {profile.experience.length === 0 ? (
        <p style={{ marginTop: '1rem', color: '#666', fontStyle: 'italic' }}>
          No experience entries found in your resume.
        </p>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {profile.experience.map((exp, idx) => (
            <div
              key={exp.id}
              style={{
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{exp.title}</h4>
                  <p style={{ color: '#666', margin: '0.25rem 0' }}>{exp.company}</p>
                  {exp.location && <p style={{ fontSize: '0.875rem', color: '#999', margin: '0.25rem 0' }}>{exp.location}</p>}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#666' }}>
                  {exp.startDate && <div>{exp.startDate}</div>}
                  {exp.endDate && <div>to {exp.endDate}</div>}
                  {exp.isCurrent && <div style={{ fontStyle: 'italic' }}>Present</div>}
                </div>
              </div>
              {exp.description && (
                <p style={{ marginTop: '0.75rem', lineHeight: '1.6' }}>{exp.description}</p>
              )}
              {exp.achievements.length > 0 && (
                <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem' }}>
                  {exp.achievements.map((achievement, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Education Tab
// ============================================================================

function EducationTab({ profile, setProfile }: {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) {
  return (
    <div>
      <h3>Education</h3>
      {profile.education.length === 0 ? (
        <p style={{ marginTop: '1rem', color: '#666', fontStyle: 'italic' }}>
          No education entries found in your resume.
        </p>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {profile.education.map(edu => (
            <div
              key={edu.id}
              style={{
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{edu.institution}</h4>
                  <p style={{ color: '#666', margin: '0.25rem 0' }}>{edu.degree}</p>
                  {edu.field && <p style={{ fontSize: '0.875rem', color: '#999', margin: '0.25rem 0' }}>{edu.field}</p>}
                  {edu.gpa && <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0' }}>GPA: {edu.gpa}</p>}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#666' }}>
                  {edu.startDate && <div>{edu.startDate}</div>}
                  {edu.endDate && <div>to {edu.endDate}</div>}
                  <div style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>
                    {edu.graduated ? '✓ Graduated' : 'In Progress'}
                  </div>
                </div>
              </div>
              {edu.achievements && edu.achievements.length > 0 && (
                <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem' }}>
                  {edu.achievements.map((achievement, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Projects Tab
// ============================================================================

function ProjectsTab({ profile, setProfile }: {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) {
  return (
    <div>
      <h3>Projects</h3>
      {profile.projects.length === 0 ? (
        <p style={{ marginTop: '1rem', color: '#666', fontStyle: 'italic' }}>
          No projects found in your resume.
        </p>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {profile.projects.map(project => (
            <div
              key={project.id}
              style={{
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <h4 style={{ margin: 0 }}>{project.name}</h4>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.875rem', color: '#007bff' }}
                >
                  {project.url}
                </a>
              )}
              <p style={{ marginTop: '0.75rem', lineHeight: '1.6' }}>{project.description}</p>
              {project.technologies.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#f0f0f0',
                        border: '1px solid #ccc',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Certifications Tab
// ============================================================================

function CertificationsTab({ profile, setProfile }: {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) {
  return (
    <div>
      <h3>Certifications</h3>
      {profile.certifications.length === 0 ? (
        <p style={{ marginTop: '1rem', color: '#666', fontStyle: 'italic' }}>
          No certifications found in your resume.
        </p>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {profile.certifications.map(cert => (
            <div
              key={cert.id}
              style={{
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{cert.name}</h4>
                  <p style={{ color: '#666', margin: '0.25rem 0' }}>{cert.issuer}</p>
                  {cert.credentialId && (
                    <p style={{ fontSize: '0.875rem', color: '#999', margin: '0.25rem 0' }}>
                      ID: {cert.credentialId}
                    </p>
                  )}
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.875rem', color: '#007bff' }}
                    >
                      View Certificate
                    </a>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#666' }}>
                  {cert.dateObtained && <div>Obtained: {cert.dateObtained}</div>}
                  {cert.expirationDate && <div>Expires: {cert.expirationDate}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfileEditor;
