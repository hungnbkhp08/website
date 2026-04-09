import { useState, useEffect } from 'react';
import { classAPI, userAPI } from '../../services/api';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', grade: 10, academic_year: '2025-2026', teacher_id: '', room: '' });

  useEffect(() => { loadClasses(); loadTeachers(); }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await classAPI.getAll();
      setClasses(res.data.classes || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadTeachers = async () => {
    try {
      const res = await userAPI.getAll({ role: 'teacher', limit: 100 });
      setTeachers(res.data.users || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await classAPI.update(editingClass.id, form);
      } else {
        await classAPI.create(form);
      }
      setShowModal(false);
      loadClasses();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleEdit = (c) => {
    setEditingClass(c);
    setForm({ name: c.name, grade: c.grade, academic_year: c.academic_year, teacher_id: c.teacher_id || '', room: c.room || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa lớp này?')) return;
    try {
      await classAPI.delete(id);
      loadClasses();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  return (
    <div className="animate-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🏫 Quản lý Lớp học ({classes.length})</h3>
          <button className="btn btn-primary" onClick={() => { setEditingClass(null); setForm({ name: '', grade: 10, academic_year: '2025-2026', teacher_id: '', room: '' }); setShowModal(true); }}>
            + Thêm lớp
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {classes.map(c => (
                <div key={c.id} className="card" style={{ cursor: 'default' }}>
                  <div className="card-body" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</h4>
                        <span className="badge info" style={{ marginTop: 4 }}>Khối {c.grade}</span>
                      </div>
                      <div className="btn-group">
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(c)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                      <div>👩‍🏫 GVCN: <strong style={{ color: 'var(--text-secondary)' }}>{c.teacher?.full_name || 'Chưa có'}</strong></div>
                      <div>📅 Năm học: <strong style={{ color: 'var(--text-secondary)' }}>{c.academic_year}</strong></div>
                      <div>🏠 Phòng: <strong style={{ color: 'var(--text-secondary)' }}>{c.room || 'N/A'}</strong></div>
                      <div>👨‍🎓 Sĩ số: <strong style={{ color: 'var(--primary-400)' }}>{c.student_count || 0} học sinh</strong></div>
                    </div>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">🏫</div>
                  <p className="empty-state-title">Chưa có lớp học</p>
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
              <h3 className="modal-title">{editingClass ? 'Sửa lớp' : 'Thêm lớp'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tên lớp *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="VD: 10A1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Khối *</label>
                    <select className="form-control" value={form.grade} onChange={e => setForm({...form, grade: parseInt(e.target.value)})}>
                      {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Năm học *</label>
                    <input className="form-control" value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phòng học</label>
                    <input className="form-control" value={form.room} onChange={e => setForm({...form, room: e.target.value})} placeholder="VD: P101" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Giáo viên chủ nhiệm</label>
                  <select className="form-control" value={form.teacher_id} onChange={e => setForm({...form, teacher_id: e.target.value})}>
                    <option value="">Chọn GVCN</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingClass ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
