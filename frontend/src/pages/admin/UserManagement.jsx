import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '123456', full_name: '', phone: '', role: 'teacher' });

  useEffect(() => { loadUsers(); }, [page, search, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAll({ page, limit: 15, search, role: roleFilter || undefined });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, form);
      } else {
        await userAPI.create(form);
      }
      setShowModal(false);
      setEditingUser(null);
      setForm({ username: '', email: '', password: '123456', full_name: '', phone: '', role: 'teacher' });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ username: user.username, email: user.email, full_name: user.full_name, phone: user.phone || '', role: user.role });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn vô hiệu hóa tài khoản này?')) return;
    try {
      await userAPI.delete(id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const handleResetPassword = async (id) => {
    if (!confirm('Reset mật khẩu về 123456?')) return;
    try {
      await userAPI.resetPassword(id);
      alert('Đã reset mật khẩu');
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const roleLabels = { admin: 'Quản trị viên', teacher: 'Giáo viên', parent: 'Phụ huynh' };

  return (
    <div className="animate-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">👥 Quản lý Người dùng ({total})</h3>
          <button className="btn btn-primary" onClick={() => { setEditingUser(null); setForm({ username: '', email: '', password: '123456', full_name: '', phone: '', role: 'teacher' }); setShowModal(true); }}>
            + Thêm mới
          </button>
        </div>
        <div className="card-body">
          <div className="filter-bar">
            <div className="search-bar">
              <span className="search-bar-icon">🔍</span>
              <input placeholder="Tìm kiếm..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-control" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={{ width: 160 }}>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="teacher">Giáo viên</option>
              <option value="parent">Phụ huynh</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.full_name}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || '—'}</td>
                      <td><span className={`badge ${user.role}`}>{roleLabels[user.role]}</span></td>
                      <td>
                        <span className={`badge ${user.is_active ? 'present' : 'absent'}`}>
                          {user.is_active ? 'Hoạt động' : 'Khóa'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-outline btn-sm" onClick={() => handleEdit(user)}>✏️</button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleResetPassword(user.id)} title="Reset mật khẩu">🔑</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <p className="empty-state-title">Chưa có người dùng nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Họ tên *</label>
                    <input className="form-control" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vai trò *</label>
                    <select className="form-control" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="teacher">Giáo viên</option>
                      <option value="parent">Phụ huynh</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                </div>
                {!editingUser && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Username *</label>
                      <input className="form-control" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mật khẩu</label>
                      <input className="form-control" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                    </div>
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingUser ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
