import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Edit3, ArrowLeft, Send, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { postAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import PostForm from '../components/posts/PostForm';
import toast from 'react-hot-toast';

const CAT_CLASS = {
  project: 'badge-project', bug: 'badge-bug', solution: 'badge-solution',
  update: 'badge-update', discussion: 'badge-discussion', other: 'badge-other',
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => { fetchPost(); }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data } = await postAPI.getById(id);
      setPost(data.post);
      setLiked(data.post.likes?.some?.((l) => l === user?._id || l?._id === user?._id));
      setLikeCount(data.post.likes?.length || 0);
    } catch {
      toast.error('Post not found');
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await postAPI.toggleLike(id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch { toast.error('Could not update like'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await postAPI.addComment(id, { content: comment.trim() });
      setPost((p) => ({ ...p, comments: [...(p.comments || []), data.comment] }));
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await postAPI.deleteComment(id, commentId);
      setPost((p) => ({ ...p, comments: p.comments.filter((c) => c._id !== commentId) }));
      toast.success('Comment deleted');
    } catch { toast.error('Could not delete comment'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await postAPI.delete(id);
      toast.success('Post deleted');
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete post');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!post) return null;

  const isOwner = user?._id === (post.author?._id || post.author);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '820px' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={14} /> Back
      </button>

      {/* Post */}
      <article className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={styles.postHeader}>
          <div style={styles.postMeta}>
            <Link to={`/profile/${post.author?._id}`} style={styles.authorLink}>
              <div style={styles.avatar}>{(post.author?.username || '?')[0].toUpperCase()}</div>
              <div>
                <div style={styles.authorName}>{post.author?.username}</div>
                <div style={styles.time}>
                  <Clock size={11} />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
              </div>
            </Link>
            <span className={`badge ${CAT_CLASS[post.category] || 'badge-other'}`}>{post.category}</span>
          </div>
          <div style={styles.postActions}>
            {isOwner && (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <Edit3 size={13} /> Edit
              </button>
            )}
            {(isOwner || isAdmin) && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
        </div>

        <h1 style={styles.postTitle}>{post.title}</h1>
        <p style={styles.postDesc}>{post.description}</p>

        {post.tags?.length > 0 && (
          <div style={styles.tags}>
            {post.tags.map((t) => (
              <span key={t} style={styles.tag}>#{t}</span>
            ))}
          </div>
        )}

        <div style={styles.postFooter}>
          <button onClick={handleLike} style={{ ...styles.likeBtn, ...(liked ? styles.likedBtn : {}) }}>
            <Heart size={16} fill={liked ? '#ff4757' : 'none'} color={liked ? '#ff4757' : 'currentColor'} />
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </button>
          <span style={styles.commentMeta}>
            <MessageCircle size={15} />
            {post.comments?.length || 0} Comments
          </span>
        </div>
      </article>

      {/* Comments */}
      <section className="card">
        <h2 style={styles.commentsTitle}>
          Comments ({post.comments?.length || 0})
        </h2>

        <form onSubmit={handleComment} style={styles.commentForm}>
          <input
            className="input-field"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submitting || !comment.trim()}
            style={{ flexShrink: 0 }}
          >
            {submitting
              ? <span className="spinner" style={{ width: 14, height: 14 }} />
              : <Send size={14} />}
          </button>
        </form>

        <div style={styles.commentsList}>
          {(!post.comments || post.comments.length === 0) ? (
            <p style={styles.noComments}>No comments yet. Start the conversation!</p>
          ) : (
            [...post.comments].reverse().map((c) => (
              <div key={c._id} style={styles.comment}>
                <div style={styles.commentHeader}>
                  <div style={styles.commentAuthor}>
                    <div style={styles.commentAvatar}>
                      {(c.author?.username || '?')[0].toUpperCase()}
                    </div>
                    <Link to={`/profile/${c.author?._id}`} style={styles.commentName}>
                      {c.author?.username}
                    </Link>
                    {c.author?.role === 'admin' && (
                      <span className="badge badge-admin" style={{ fontSize: '0.6rem' }}>admin</span>
                    )}
                    <span style={styles.commentTime}>
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {(user?._id === c.author?._id || isAdmin || isOwner) && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      style={styles.deleteComment}
                      title="Delete comment"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p style={styles.commentContent}>{c.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {editing && (
        <PostForm
          editPost={post}
          onSuccess={(updated) => { setPost(updated); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

const styles = {
  postHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap',
  },
  postMeta: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  authorLink: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none' },
  avatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  authorName: { fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.1rem' },
  time: {
    display: 'flex', alignItems: 'center', gap: '0.2rem',
    fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
  },
  postActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  postTitle: { fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.3 },
  postDesc: {
    fontSize: '0.95rem', color: 'var(--text-secondary)',
    lineHeight: 1.85, marginBottom: '1.25rem', whiteSpace: 'pre-wrap',
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' },
  tag: {
    fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)',
    background: 'rgba(108,99,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px',
  },
  postFooter: {
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    paddingTop: '1rem', borderTop: '1px solid var(--border)',
  },
  likeBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none',
    border: '1px solid var(--border-light)', borderRadius: '6px',
    padding: '0.4rem 0.875rem', cursor: 'pointer', color: 'var(--text-secondary)',
    fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600,
    transition: 'all 0.15s',
  },
  likedBtn: {
    color: '#ff4757', borderColor: 'rgba(255,71,87,0.3)',
    background: 'rgba(255,71,87,0.07)',
  },
  commentMeta: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontSize: '0.875rem', color: 'var(--text-secondary)',
  },
  commentsTitle: { fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' },
  commentForm: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' },
  commentsList: { display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  noComments: {
    color: 'var(--text-muted)', fontSize: '0.875rem',
    textAlign: 'center', padding: '2rem 0',
  },
  comment: {
    padding: '1rem', background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
  },
  commentHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '0.5rem',
  },
  commentAuthor: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  commentAvatar: {
    width: 26, height: 26, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  commentName: {
    fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'none',
  },
  commentTime: {
    fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
  },
  deleteComment: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', padding: '0.2rem', borderRadius: '4px',
    display: 'flex', alignItems: 'center', transition: 'color 0.15s',
  },
  commentContent: {
    fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65,
  },
};
