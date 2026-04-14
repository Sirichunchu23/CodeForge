import { Link } from 'react-router-dom';
import { Code2, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function NotFound() {
  const { user } = useAuthStore();
  const home = user ? (user.role === 'admin' ? '/admin' : '/feed') : '/login';

  return (
    <div style={styles.page}>
      <div style={styles.glowBg} />
      <div style={styles.content}>
        <div style={styles.codeBlock}>
          <span style={styles.lineNum}>1</span>
          <span style={styles.keyword}>throw</span>{' '}
          <span style={styles.cls}>Error</span>
          <span style={styles.paren}>(</span>
          <span style={styles.str}>"404: Page not found"</span>
          <span style={styles.paren}>)</span>
          <span style={styles.semi}>;</span>
        </div>

        <div style={styles.errorNum}>404</div>
        <h1 style={styles.title}>Lost in the codebase</h1>
        <p style={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to={home} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 'calc(100vh - 4rem)', padding: '2rem', textAlign: 'center',
    position: 'relative', overflow: 'hidden',
  },
  glowBg: {
    position: 'absolute', width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 65%)',
    top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    pointerEvents: 'none',
  },
  content: { position: 'relative', zIndex: 1, maxWidth: 480 },
  codeBlock: {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap',
    padding: '0.75rem 1.25rem', background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-mono)', fontSize: '0.875rem', marginBottom: '2rem',
    justifyContent: 'center',
  },
  lineNum: { color: 'var(--text-muted)', marginRight: '0.5rem', userSelect: 'none' },
  keyword: { color: '#ff79c6' },
  cls: { color: '#8be9fd' },
  paren: { color: 'var(--text-secondary)' },
  str: { color: '#f1fa8c' },
  semi: { color: 'var(--text-secondary)' },
  errorNum: {
    fontSize: '7rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
    color: 'var(--accent)', opacity: 0.15, lineHeight: 1, marginBottom: '0.5rem',
  },
  title: { fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' },
  subtitle: { color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 },
};
