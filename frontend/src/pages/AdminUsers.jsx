import { useState, useEffect } from 'react';
import { Search, Trash2, ToggleLeft, ToggleRight, Shield, Users } from 'lucide-react';
import { adminAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 20, search });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: data.user.isActive } : u));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id, username) => {
    if (!confirm(`Deactivate user "${username}"?\n\nThis will also hide all their posts.`)) return;
    try {
      const { data } = await adminAPI.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={styles.topBar}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            <Users size={20} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent)', verticalAlign: 'middle' }} />
            Manage Users
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {pagination.total ?? users.length} total users
          </p>
        </div>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon} />
          <input
            className="input-field"
            placeholder="Search by name or email..."
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
      ) : users.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No users found</h3>
          {search && <p>Try a different search term</p>}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Desktop table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>{u.username?.[0]?.toUpperCase()}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={styles.uname}>{u.username}</div>
                          <div style={styles.uemail}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.timeText}>
                        {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: u.isActive ? 'rgba(0,212,170,0.12)' : 'rgba(255,71,87,0.12)',
                        color: u.isActive ? 'var(--green)' : 'var(--red)',
                      }}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {u.role !== 'admin' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleToggle(u._id)}
                            className="btn btn-secondary btn-sm"
                            title={u.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {u.isActive
                              ? <ToggleRight size={15} color="var(--green)" />
                              : <ToggleLeft size={15} color="var(--text-muted)" />}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id, u.username)}
                            className="btn btn-danger btn-sm"
                            title="Remove user"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          <Shield size={13} color="var(--accent)" /> Protected
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <span style={styles.pageInfo}>Page {page} of {pagination.pages}</span>
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
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 600 },
  th: {
    padding: '0.85rem 1.1rem', textAlign: 'left',
    fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
  },
  tr: { borderBottom: '1px solid var(--border)', transition: 'background 0.1s' },
  td: { padding: '0.85rem 1.1rem', fontSize: '0.875rem', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'center', gap: '0.65rem' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700, color: '#fff',
  },
  uname: { fontWeight: 600, fontSize: '0.875rem' },
  uemail: { fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' },
  timeText: { fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  statusBadge: {
    fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem',
    borderRadius: '999px', fontFamily: 'var(--font-mono)',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '1rem', marginTop: '2rem',
  },
  pageInfo: { fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' },
};
