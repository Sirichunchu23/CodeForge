import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Rss } from 'lucide-react';
import { postAPI } from '../services/api';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'project', 'bug', 'solution', 'update', 'discussion', 'other'];

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const { data } = await postAPI.getAll(params);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategory = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowForm(false);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
    setEditPost(null);
  };

  const handlePostDeleted = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            <Rss size={20} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent)', verticalAlign: 'middle' }} />
            Developer Feed
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Latest projects, bugs, and solutions from the community
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ flexShrink: 0 }}>
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon} />
          <input
            className="input-field"
            placeholder="Search posts, tags..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ paddingLeft: '2.4rem', maxWidth: 380 }}
          />
        </div>
        <div style={styles.catFilters}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              style={{ ...styles.catBtn, ...(category === cat ? styles.catBtnActive : {}) }}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      {!loading && (
        <p style={styles.resultCount}>
          {pagination.total ?? posts.length} post{(pagination.total ?? posts.length) !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* Posts */}
      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 36, height: 36 }} />
          <span>Loading posts...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <Filter size={48} />
          <h3>No posts found</h3>
          <p>
            {search || category !== 'all'
              ? 'Try adjusting your filters or search.'
              : 'Be the first to post something!'}
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setShowForm(true)}>
            <Plus size={16} /> Create First Post
          </button>
        </div>
      ) : (
        <>
          <div style={styles.postGrid}>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDeleted}
                onUpdate={setEditPost}
              />
            ))}
          </div>

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
        </>
      )}

      {(showForm || editPost) && (
        <PostForm
          editPost={editPost}
          onSuccess={editPost ? handlePostUpdated : handlePostCreated}
          onCancel={() => { setShowForm(false); setEditPost(null); }}
        />
      )}
    </div>
  );
}

const styles = {
  topBar: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap',
  },
  filters: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' },
  searchWrap: { position: 'relative' },
  searchIcon: {
    position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-muted)', pointerEvents: 'none',
  },
  catFilters: { display: 'flex', gap: '0.35rem', flexWrap: 'wrap' },
  catBtn: {
    padding: '0.3rem 0.8rem', borderRadius: '999px', border: '1px solid var(--border-light)',
    background: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
  },
  catBtnActive: {
    background: 'rgba(108,99,255,0.15)', color: 'var(--accent)', borderColor: 'var(--accent)',
  },
  resultCount: {
    fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
    marginBottom: '1rem',
  },
  postGrid: { display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '1rem', marginTop: '2.5rem',
  },
  pageInfo: { fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' },
};
