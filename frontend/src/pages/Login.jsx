import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/feed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />
      <div style={styles.card} className="card">
        <div style={styles.header}>
          <div style={styles.logoWrap}>
            <Code2 size={28} color="#6c63ff" />
          </div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to CodeForge</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</>
              : <><LogIn size={16} /> Sign In</>
            }
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
        </p>

        <div style={styles.adminHint}>
          <span style={{ color: 'var(--accent)' }}>🔑 Admin login?</span> Use your admin credentials above — no separate page needed.
        </div>
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
  bgBlob1: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)',
    top: '10%', left: '20%', pointerEvents: 'none',
  },
  bgBlob2: {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)',
    bottom: '15%', right: '25%', pointerEvents: 'none',
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
  adminHint: {
    marginTop: '1.25rem', padding: '0.75rem 1rem',
    background: 'rgba(108,99,255,0.06)', borderRadius: 'var(--radius)',
    fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center',
    border: '1px solid rgba(108,99,255,0.12)',
  },
};
