import { useState, useEffect } from 'react';
import { studentAPI, classAPI, userAPI } from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ student_code: '', full_name: '', date_of_birth: '', gender: 'male', address: '', class_id: '', parent_id: '' });

  useEffect(() => {
    loadClasses();
    loadParents();
  }, []);

  useEffect(() => { loadStudents(); }, [page, search, classFilter]);

  const loadClasses = async () => {
    try {
      const res = await classAPI.getAll();
      setClasses(res.data.classes || []);
    } catch (err) { console.error(err); }
  };

  const loadParents = async () => {
    try {
      const res = await userAPI.getAll({ role: 'parent', limit: 100 });
      setParents(res.data.users || []);
    } catch (err) { console.error(err); }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getAll({ page, limit: 15, search, class_id: classFilter || undefined });
      setStudents(res.data.students);
      setTotal(res.data.total);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentAPI.update(editingStudent.id, form);
      } else {
        await studentAPI.create(form);
      }
      setShowModal(false);
      setEditingStudent(null);
      loadStudents();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setForm({
      student_code: student.student_code,
      full_name: student.full_name,
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || 'male',
      address: student.address || '',
      class_id: student.class_id || '',
      parent_id: student.parent_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa học sinh này?')) return;
    try {
      await studentAPI.delete(id);
      loadStudents();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const genderLabels = { male: 'Nam', female: 'Nữ', other: 'Khác' };

  return (
    <div className="animate-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🎒 Quản lý Học sinh ({total})</h3>
          <button className="btn btn-primary" onClick={() => { setEditingStudent(null); setForm({ student_code: '', full_name: '', date_of_birth: '', gender: 'male', address: '', class_id: '', parent_id: '' }); setShowModal(true); }}>
            + Thêm học sinh
          </button>
        </div>
        <div className="card-body">
          <div className="filter-bar">
            <div className="search-bar">
              <span className="search-bar-icon">🔍</span>
              <input placeholder="Tìm theo tên hoặc mã..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-control" value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }} style={{ width: 160 }}>
              <option value="">Tất cả lớp</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Mã HS</th>
                    <th>Họ tên</th>
                    <th>Ngày sinh</th>
                    <th>Giới tính</th>
                    <th>Lớp</th>
                    <th>Phụ huynh</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{s.student_code}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.full_name}</td>
                      <td>{s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('vi-VN') : '—'}</td>
                      <td><span className={`badge ${s.gender}`}>{genderLabels[s.gender] || '—'}</span></td>
                      <td>{s.class?.name || '—'}</td>
                      <td>{s.parent?.full_name || '—'}</td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-outline btn-sm" onClick={() => handleEdit(s)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">🎒</div>
                  <p className="empty-state-title">Chưa có học sinh</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingStudent ? 'Sửa học sinh' : 'Thêm học sinh'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Mã học sinh *</label>
                    <input className="form-control" value={form.student_code} onChange={e => setForm({...form, student_code: e.target.value})} required disabled={!!editingStudent} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Họ tên *</label>
                    <input className="form-control" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <input type="date" className="form-control" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giới tính</label>
                    <select className="form-control" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Lớp</label>
                    <select className="form-control" value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})}>
                      <option value="">Chọn lớp</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} (Khối {c.grade})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phụ huynh</label>
                    <select className="form-control" value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})}>
                      <option value="">Chọn phụ huynh</option>
                      {parents.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.phone || p.email})</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ</label>
                  <input className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingStudent ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
