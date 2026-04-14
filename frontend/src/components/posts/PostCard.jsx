import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Edit3, Clock, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { postAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CAT_CLASS = {
  project: 'badge-project', bug: 'badge-bug', solution: 'badge-solution',
  update: 'badge-update', discussion: 'badge-discussion', other: 'badge-other',
};

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.some?.((id) => id === user?._id || id?._id === user?._id));
  const [likeLoading, setLikeLoading] = useState(false);

  const isOwner = user?._id === (post.author?._id || post.author);
  const isAdmin = user?.role === 'admin';

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const { data } = await postAPI.toggleLike(post._id);
      setLikes(data.likeCount);
      setLiked(data.liked);
    } catch {
      toast.error('Could not update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this post?')) return;
    try {
      await postAPI.delete(post._id);
      toast.success('Post deleted');
      onDelete?.(post._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete post');
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdate?.(post);
  };

  return (
    <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article style={styles.card} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.meta}>
            <Link
              to={`/profile/${post.author?._id || post.author}`}
              onClick={(e) => e.stopPropagation()}
              style={styles.authorLink}
            >
              <div style={styles.avatar}>
                {(post.author?.username || '?')[0].toUpperCase()}
              </div>
              <span style={styles.authorName}>{post.author?.username || 'Unknown'}</span>
            </Link>
            {post.author?.role === 'admin' && <span className="badge badge-admin">admin</span>}
            <span style={styles.dot}>·</span>
            <span style={styles.time}>
              <Clock size={11} />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          <span className={`badge ${CAT_CLASS[post.category] || 'badge-other'}`}>
            {post.category}
          </span>
        </div>

        {/* Content */}
        <h2 style={styles.title}>{post.title}</h2>
        <p style={styles.desc}>
          {post.description?.length > 200
            ? post.description.slice(0, 200) + '...'
            : post.description}
        </p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={styles.tags}>
            {post.tags.slice(0, 5).map((tag) => (
              <span key={tag} style={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.actions}>
            <button
              onClick={handleLike}
              style={{ ...styles.actionBtn, ...(liked ? styles.likedBtn : {}) }}
              disabled={likeLoading}
            >
              <Heart size={14} fill={liked ? '#ff4757' : 'none'} color={liked ? '#ff4757' : 'currentColor'} />
              {likes}
            </button>
            <span style={styles.actionBtn}>
              <MessageCircle size={14} />
              {post.comments?.length || 0}
            </span>
          </div>
          <div style={styles.postActions}>
            {isOwner && (
              <button onClick={handleEdit} style={styles.iconBtn} title="Edit post">
                <Edit3 size={13} color="var(--text-muted)" />
              </button>
            )}
            {(isOwner || isAdmin) && (
              <button onClick={handleDelete} style={styles.iconBtn} title="Delete post">
                <Trash2 size={13} color="var(--red)" />
              </button>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
    transition: 'border-color 0.2s, transform 0.15s', cursor: 'pointer',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap',
  },
  meta: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  authorLink: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem',
    textDecoration: 'none',
  },
  avatar: {
    width: 26, height: 26, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  authorName: { fontSize: '0.85rem', fontWeight: 600 },
  dot: { color: 'var(--text-muted)', fontSize: '0.8rem' },
  time: {
    display: 'flex', alignItems: 'center', gap: '0.25rem',
    fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
  },
  title: {
    fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem',
    color: 'var(--text-primary)', lineHeight: 1.4,
  },
  desc: {
    fontSize: '0.875rem', color: 'var(--text-secondary)',
    lineHeight: 1.65, marginBottom: '0.75rem',
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' },
  tag: {
    fontSize: '0.72rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)',
    background: 'rgba(108,99,255,0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px',
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: '0.75rem', borderTop: '1px solid var(--border)',
  },
  actions: { display: 'flex', gap: '1rem' },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'none',
    border: 'none', cursor: 'pointer', padding: '0.2rem 0.4rem',
    borderRadius: '4px', fontFamily: 'var(--font-mono)', transition: 'color 0.15s',
  },
  likedBtn: { color: '#ff4757' },
  postActions: { display: 'flex', gap: '0.25rem' },
  iconBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.3rem', borderRadius: '4px', background: 'none', border: 'none',
    cursor: 'pointer', transition: 'background 0.15s',
  },
};
