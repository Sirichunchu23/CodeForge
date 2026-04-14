import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', bio: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      const data = await register(form);
      toast.success(`Welcome to CodeForge, ${data.user.username}! 🚀`);
      navigate('/feed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgBlob} />
      <div style={styles.card} className="card">
        <div style={styles.header}>
          <div style={styles.logoWrap}>
            <Code2 size={28} color="#6c63ff" />
          </div>
          <h1 style={styles.title}>Join CodeForge</h1>
          <p style={styles.subtitle}>Create your developer account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              className="input-field"
              placeholder="your_username"
              value={form.username}
              onChange={set('username')}
              required minLength={3} maxLength={30}
              autoFocus
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={set('password')}
              required minLength={6}
            />
          </div>
          <div className="input-group">
            <label>
              Bio{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>
                (optional)
              </span>
            </label>
            <input
              className="input-field"
              placeholder="Tell the community about yourself..."
              value={form.bio}
              onChange={set('bio')}
              maxLength={300}
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</>
              : <><UserPlus size={16} /> Create Account</>
            }
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 'calc(100vh - 4rem)', padding: '2rem 1rem',
    position: 'relative', overflow: 'hidden',
  },
  bgBlob: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 70%)',
    top: '0%', right: '10%', pointerEvents: 'none',
  },
  card: { width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: '2rem' },
  logoWrap: {
    width: 56, height: 56, borderRadius: '14px', margin: '0 auto 1rem',
    background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.9rem' },
  footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' },
};
