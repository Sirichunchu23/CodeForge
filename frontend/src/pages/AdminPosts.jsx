import { useState, useEffect } from 'react';
import { Search, Trash2, FileText, Heart, MessageCircle } from 'lucide-react';
import { adminAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const CAT_CLASS = {
  project: 'badge-project', bug: 'badge-bug', solution: 'badge-solution',
  update: 'badge-update', discussion: 'badge-discussion', other: 'badge-other',
};

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { fetchPosts(); }, [page, search]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getPosts({ page, limit: 20, search });
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Remove post:\n"${title}"\n\nThis action cannot be undone.`)) return;
    try {
      await adminAPI.deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Post removed from platform');
    } catch {
      toast.error('Failed to remove post');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={styles.topBar}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            <FileText size={20} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent)', verticalAlign: 'middle' }} />
            Manage Posts
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {pagination.total ?? posts.length} total active posts
          </p>
        </div>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon} />
          <input
            className="input-field"
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ paddingLeft: '2.4rem', width: 280 }}
          />
        </div>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No posts found</h3>
          {search && <p>Try adjusting your search</p>}
        </div>
      ) : (
        <div style={styles.postList}>
          {posts.map((p) => (
            <div key={p._id} className="card" style={styles.postRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Top row */}
                <div style={styles.postTop}>
                  <span className={`badge ${CAT_CLASS[p.category] || 'badge-other'}`}>
                    {p.category}
                  </span>
                  <span style={styles.authorTag}>
                    @{p.author?.username}
                  </span>
                  {p.author?.role === 'admin' && (
                    <span className="badge badge-admin" style={{ fontSize: '0.6rem' }}>admin</span>
                  )}
                  <span style={styles.timeTag}>
                    {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {/* Title */}
                <h3 style={styles.postTitle}>{p.title}</h3>

                {/* Description snippet */}
                <p style={styles.postSnippet}>
                  {p.description?.length > 120
                    ? p.description.slice(0, 120) + '...'
                    : p.description}
                </p>

                {/* Tags */}
                {p.tags?.length > 0 && (
                  <div style={styles.tags}>
                    {p.tags.slice(0, 4).map((t) => (
                      <span key={t} style={styles.tag}>#{t}</span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div style={styles.postStats}>
                  <span style={styles.statItem}>
                    <Heart size={12} color="var(--red)" /> {p.likes?.length || 0}
                  </span>
                  <span style={styles.statItem}>
                    <MessageCircle size={12} color="var(--text-muted)" /> {p.comments?.length || 0}
                  </span>
                </div>
              </div>

              {/* Delete button */}
              <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                <button
                  onClick={() => handleDelete(p._id, p.title)}
                  className="btn btn-danger btn-sm"
                  title="Remove post"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div style={styles.pagination}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span style={styles.pageInfo}>
            Page {page} of {pagination.pages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.pages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  topBar: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap',
  },
  searchWrap: { position: 'relative' },
  searchIcon: {
    position: 'absolute', left: '0.85rem', top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
  },
  postList: { display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  postRow: {
    display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
    padding: '1.1rem 1.25rem',
  },
  postTop: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    marginBottom: '0.45rem', flexWrap: 'wrap',
  },
  authorTag: {
    fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  },
  timeTag: {
    fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
  },
  postTitle: {
    fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem',
    color: 'var(--text-primary)', lineHeight: 1.4,
  },
  postSnippet: {
    fontSize: '0.8rem', color: 'var(--text-secondary)',
    lineHeight: 1.6, marginBottom: '0.6rem',
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem' },
  tag: {
    fontSize: '0.7rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)',
    background: 'rgba(108,99,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: '3px',
  },
  postStats: { display: 'flex', gap: '1rem' },
  statItem: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '1rem', marginTop: '2rem',
  },
  pageInfo: { fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' },
};
