import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Shield, ChevronRight, TrendingUp, Activity } from 'lucide-react';
import { adminAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => { setStats(data.stats); setLoading(false); })
      .catch(() => { toast.error('Failed to load stats'); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
          <Shield size={22} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent)', verticalAlign: 'middle' }} />
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Platform overview and management tools
        </p>
      </div>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        <StatCard icon={<Users size={22} />} label="Total Users" value={stats?.totalUsers} color="var(--accent)" />
        <StatCard icon={<Activity size={22} />} label="Students" value={stats?.totalStudents} color="var(--green)" />
        <StatCard icon={<FileText size={22} />} label="Total Posts" value={stats?.totalPosts} color="var(--yellow)" />
        <StatCard icon={<Shield size={22} />} label="Admins" value={stats?.totalAdmins} color="var(--red)" />
      </div>

      {/* Quick actions */}
      <div style={styles.quickActions}>
        <Link to="/admin/users" style={styles.quickAction}>
          <Users size={18} color="var(--accent)" />
          <span>Manage Users</span>
          <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </Link>
        <Link to="/admin/posts" style={styles.quickAction}>
          <FileText size={18} color="var(--accent)" />
          <span>Manage Posts</span>
          <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </Link>
      </div>

      {/* Two column section */}
      <div style={styles.grid}>
        {/* Recent Users */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Users</h2>
            <Link to="/admin/users" style={styles.viewAll}>
              View All <ChevronRight size={13} />
            </Link>
          </div>
          {stats?.recentUsers?.length === 0
            ? <p style={styles.empty}>No users yet</p>
            : stats?.recentUsers?.map((u) => (
              <div key={u._id} style={styles.listItem}>
                <div style={styles.itemAvatar}>{u.username?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.itemName}>{u.username}</div>
                  <div style={styles.itemSub}>{u.email}</div>
                </div>
                <span className={`badge badge-${u.role}`}>{u.role}</span>
              </div>
            ))}
        </div>

        {/* Recent Posts */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Posts</h2>
            <Link to="/admin/posts" style={styles.viewAll}>
              View All <ChevronRight size={13} />
            </Link>
          </div>
          {stats?.recentPosts?.length === 0
            ? <p style={styles.empty}>No posts yet</p>
            : stats?.recentPosts?.map((p) => (
              <div key={p._id} style={styles.listItem}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.itemName} title={p.title}>
                    {p.title?.length > 45 ? p.title.slice(0, 45) + '...' : p.title}
                  </div>
                  <div style={styles.itemSub}>
                    by {p.author?.username} · {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <span style={styles.likeCount}>♥ {p.likes?.length || 0}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Category breakdown */}
      {stats?.categoryStats?.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.4rem', color: 'var(--accent)', verticalAlign: 'middle' }} />
              Posts by Category
            </h2>
          </div>
          <div style={styles.catGrid}>
            {stats.categoryStats
              .sort((a, b) => b.count - a.count)
              .map((c) => {
                const max = Math.max(...stats.categoryStats.map((x) => x.count));
                const pct = Math.round((c.count / max) * 100);
                return (
                  <div key={c._id} style={styles.catItem}>
                    <div style={styles.catTop}>
                      <span style={styles.catName}>{c._id}</span>
                      <span style={styles.catCount}>{c.count}</span>
                    </div>
                    <div style={styles.catBar}>
                      <div style={{ ...styles.catBarFill, width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderColor: color + '30' }}>
      <div style={{ color, background: color + '15', padding: '0.6rem', borderRadius: '8px', display: 'inline-flex' }}>
        {icon}
      </div>
      <div style={{ ...styles.statValue, color }}>{value ?? '—'}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '1rem', marginBottom: '1.5rem',
  },
  statCard: {
    background: 'var(--bg-card)', border: '1px solid', borderRadius: 'var(--radius-lg)',
    padding: '1.5rem', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '0.5rem', textAlign: 'center',
  },
  statValue: { fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1 },
  statLabel: {
    fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  quickActions: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  quickAction: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 200,
    padding: '0.85rem 1.25rem', background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem',
    transition: 'border-color 0.15s', textDecoration: 'none',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem',
  },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700 },
  viewAll: {
    display: 'flex', alignItems: 'center', gap: '0.2rem',
    fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none',
  },
  listItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.65rem 0', borderBottom: '1px solid var(--border)',
  },
  itemAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  itemName: { fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemSub: { fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' },
  likeCount: { fontSize: '0.72rem', color: 'var(--red)', fontFamily: 'var(--font-mono)', flexShrink: 0 },
  empty: { color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' },
  catGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' },
  catItem: {},
  catTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' },
  catName: { fontSize: '0.8rem', textTransform: 'capitalize', fontWeight: 600 },
  catCount: { fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)' },
  catBar: { height: 5, background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' },
  catBarFill: { height: '100%', background: 'linear-gradient(90deg, #6c63ff, #00d4aa)', borderRadius: '3px', transition: 'width 0.5s ease' },
};
