import { useState, useEffect } from 'react';
import { Plus, FileText, Heart, MessageCircle, LayoutDashboard } from 'lucide-react';
import { postAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);

  useEffect(() => { fetchMyPosts(); }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const { data } = await postAPI.getUserPosts(user._id, { limit: 50 });
      setPosts(data.posts);
    } catch {
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const totalLikes = posts.reduce((s, p) => s + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.length || 0), 0);

  const handleCreated = (p) => { setPosts((prev) => [p, ...prev]); setShowForm(false); };
  const handleUpdated = (p) => { setPosts((prev) => prev.map((x) => x._id === p._id ? p : x)); setEditPost(null); };
  const handleDeleted = (id) => setPosts((prev) => prev.filter((x) => x._id !== id));

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={styles.topBar}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            <LayoutDashboard size={20} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent)', verticalAlign: 'middle' }} />
            My Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user.username}</strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ flexShrink: 0 }}>
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={<FileText size={22} />}
          label="Total Posts"
          value={posts.length}
          color="var(--accent)"
          bg="rgba(108,99,255,0.08)"
        />
        <StatCard
          icon={<Heart size={22} />}
          label="Total Likes"
          value={totalLikes}
          color="var(--red)"
          bg="rgba(255,71,87,0.08)"
        />
        <StatCard
          icon={<MessageCircle size={22} />}
          label="Total Comments"
          value={totalComments}
          color="var(--green)"
          bg="rgba(0,212,170,0.08)"
        />
      </div>

      {/* Posts */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>My Posts</h2>
        <span style={styles.postCount}>{posts.length} total</span>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No posts yet</h3>
          <p>Share your first project, bug, or solution with the community</p>
          <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setShowForm(true)}>
            <Plus size={16} /> Create Your First Post
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handleDeleted}
              onUpdate={setEditPost}
            />
          ))}
        </div>
      )}

      {(showForm || editPost) && (
        <PostForm
          editPost={editPost}
          onSuccess={editPost ? handleUpdated : handleCreated}
          onCancel={() => { setShowForm(false); setEditPost(null); }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ ...styles.statCard, background: bg, borderColor: color + '22' }}>
      <div style={{ color }}>{icon}</div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  topBar: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem', marginBottom: '2.5rem',
  },
  statCard: {
    padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '0.4rem', textAlign: 'center',
  },
  statValue: { fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' },
  statLabel: {
    fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem',
  },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700 },
  postCount: {
    fontSize: '0.75rem', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)',
    padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)',
  },
};
