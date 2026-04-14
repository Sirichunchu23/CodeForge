import { useState, useEffect } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { postAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['project', 'bug', 'solution', 'update', 'discussion', 'other'];

export default function PostForm({ onSuccess, onCancel, editPost }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'other',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editPost) {
      setForm({
        title: editPost.title || '',
        description: editPost.description || '',
        tags: editPost.tags?.join(', ') || '',
        category: editPost.category || 'other',
      });
    }
  }, [editPost]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3) return toast.error('Title must be at least 3 characters');
    if (form.description.trim().length < 10) return toast.error('Description must be at least 10 characters');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      tags: form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .slice(0, 10),
    };

    setLoading(true);
    try {
      let responsePost;
      if (editPost) {
        const { data } = await postAPI.update(editPost._id, payload);
        responsePost = data.post;
        toast.success('Post updated!');
      } else {
        const { data } = await postAPI.create(payload);
        responsePost = data.post;
        toast.success('Post published!');
      }
      onSuccess?.(responsePost);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Trap scroll behind modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <div style={styles.modal} className="card">
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {editPost ? '✏️ Edit Post' : '✨ Create Post'}
          </h2>
          {onCancel && (
            <button onClick={onCancel} style={styles.closeBtn} aria-label="Close">
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Category</label>
            <select className="input-field" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Title</label>
            <input
              className="input-field"
              placeholder="What's this about? Be specific..."
              value={form.title}
              onChange={set('title')}
              required
              maxLength={150}
              autoFocus={!editPost}
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              className="input-field"
              placeholder="Share your project idea, describe the bug, explain your solution, or start a discussion..."
              value={form.description}
              onChange={set('description')}
              required
              maxLength={5000}
              style={{ minHeight: 160 }}
            />
            <span style={styles.charCount}>{form.description.length}/5000</span>
          </div>

          <div className="input-group">
            <label>
              Tags{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>
                (comma-separated, max 10)
              </span>
            </label>
            <input
              className="input-field"
              placeholder="react, javascript, bug-fix, api..."
              value={form.tags}
              onChange={set('tags')}
            />
          </div>

          <div style={styles.formFooter}>
            {onCancel && (
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving...</>
                : <><Send size={14} /> {editPost ? 'Save Changes' : 'Publish Post'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', backdropFilter: 'blur(6px)',
  },
  modal: {
    width: '100%', maxWidth: '600px', maxHeight: '90vh',
    overflowY: 'auto', position: 'relative',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  modalTitle: { fontSize: '1.2rem', fontWeight: 800 },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-secondary)', padding: '0.25rem',
    borderRadius: '6px', display: 'flex', alignItems: 'center',
    transition: 'color 0.15s',
  },
  charCount: {
    fontSize: '0.72rem', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', textAlign: 'right', marginTop: '0.25rem',
  },
  formFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem',
  },
};
