import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Github, Globe, Edit3, Save, X, User } from 'lucide-react';
import { userAPI, postAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import PostCard from '../components/posts/PostCard';
import toast from 'react-hot-toast';

export default function Profile() {
  const { id } = useParams();
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const isOwn = user?._id === id;

  useEffect(() => {
    setEditing(false);
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        userAPI.getProfile(id),
        postAPI.getUserPosts(id, { limit: 50 }),
      ]);
      const p = profileRes.data.user;
      setProfile(p);
      setForm({
        bio: p.bio || '',
        github: p.github || '',
        website: p.website || '',
        skills: p.skills?.join(', ') || '',
      });
      setPosts(postsRes.data.posts);
    } catch {
      toast.error('Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        bio: form.bio,
        github: form.github,
        website: form.website,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await userAPI.updateProfile(payload);
      setProfile(data.user);
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!profile) return null;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '900px' }}>
      {/* Profile card */}
      <div className="card" style={styles.profileCard}>
        <div style={styles.avatarLg}>
          {profile.username?.[0]?.toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.profileTop}>
            <div>
              <h1 style={styles.profileName}>{profile.username}</h1>
              <p style={styles.profileEmail}>{profile.email}</p>
            </div>
            <div style={styles.profileActions}>
              <span className={`badge badge-${profile.role}`}>{profile.role}</span>
              {isOwn && !editing && (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  <Edit3 size={13} /> Edit Profile
                </button>
              )}
              {isOwn && editing && (
                <>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                    <X size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div style={{ marginTop: '1.25rem' }}>
              <div className="input-group">
                <label>Bio</label>
                <textarea
                  className="input-field"
                  value={form.bio}
                  onChange={set('bio')}
                  maxLength={300}
                  style={{ minHeight: 80 }}
                  placeholder="Tell the community about yourself..."
                />
              </div>
              <div className="input-group">
                <label>Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(comma-separated)</span></label>
                <input
                  className="input-field"
                  value={form.skills}
                  onChange={set('skills')}
                  placeholder="React, Node.js, Python, MongoDB..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
                  <label>GitHub URL</label>
                  <input
                    className="input-field"
                    value={form.github}
                    onChange={set('github')}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
                  <label>Website</label>
                  <input
                    className="input-field"
                    value={form.website}
                    onChange={set('website')}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '0.875rem' }}>
              {profile.bio ? (
                <p style={styles.bio}>{profile.bio}</p>
              ) : isOwn ? (
                <p style={styles.noBio}>Add a bio to tell others about yourself →</p>
              ) : null}

              {profile.skills?.length > 0 && (
                <div style={styles.skills}>
                  {profile.skills.map((s) => (
                    <span key={s} style={styles.skill}>{s}</span>
                  ))}
                </div>
              )}

              {(profile.github || profile.website) && (
                <div style={styles.links}>
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer" style={styles.link}>
                      <Github size={14} /> GitHub
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" style={styles.link}>
                      <Globe size={14} /> Website
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Posts section */}
      <div style={styles.postsSectionHeader}>
        <h2 style={styles.postsSectionTitle}>
          Posts by {profile.username}
        </h2>
        <span style={styles.postsCount}>{posts.length}</span>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <User size={48} />
          <h3>No posts yet</h3>
          {isOwn && <p>Go to your dashboard to create your first post!</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {posts.map((p) => (
            <PostCard
              key={p._id}
              post={p}
              onDelete={(id) => setPosts((prev) => prev.filter((x) => x._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  profileCard: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' },
  avatarLg: {
    width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', fontWeight: 800, color: '#fff',
    boxShadow: '0 0 0 3px rgba(108,99,255,0.25)',
  },
  profileTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap',
  },
  profileName: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.2rem' },
  profileEmail: { fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  profileActions: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  bio: { color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '0.875rem' },
  noBio: { color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.75rem', cursor: 'pointer' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.875rem' },
  skill: {
    fontSize: '0.75rem', background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)', color: 'var(--text-secondary)',
    padding: '0.2rem 0.65rem', borderRadius: '4px', fontFamily: 'var(--font-mono)',
  },
  links: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  link: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600,
    textDecoration: 'none', transition: 'opacity 0.15s',
  },
  postsSectionHeader: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    margin: '2rem 0 1rem',
  },
  postsSectionTitle: { fontSize: '1.1rem', fontWeight: 700 },
  postsCount: {
    fontSize: '0.75rem', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)',
    padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)',
  },
};
