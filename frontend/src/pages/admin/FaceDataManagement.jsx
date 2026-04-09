import { useState, useEffect } from 'react';
import { faceDataAPI, studentAPI } from '../../services/api';

const FaceDataManagement = () => {
  const [faceData, setFaceData] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', academic_year: '2025-2026', is_primary: 'false' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => { loadData(); loadStudents(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await faceDataAPI.getAll();
      setFaceData(res.data.faceData || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadStudents = async () => {
    try {
      const res = await studentAPI.getAll({ limit: 200 });
      setStudents(res.data.students || []);
    } catch (err) { console.error(err); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Vui lòng chọn ảnh');
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('student_id', form.student_id);
      formData.append('academic_year', form.academic_year);
      formData.append('is_primary', form.is_primary);
      await faceDataAPI.upload(formData);
      setShowModal(false);
      setSelectedFile(null);
      loadData();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi tải ảnh'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa ảnh này?')) return;
    try { await faceDataAPI.delete(id); loadData(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleSetPrimary = async (id) => {
    try { await faceDataAPI.setPrimary(id); loadData(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  return (
    <div className="animate-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📷 Quản lý Dữ liệu Khuôn mặt ({faceData.length})</h3>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm({ student_id: '', academic_year: '2025-2026', is_primary: 'false' }); setSelectedFile(null); }}>
            + Tải ảnh lên
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {faceData.map(fd => (
                <div key={fd.id} className="card">
                  <div style={{ height: 180, background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <img
                      src={`http://localhost:5000${fd.image_url}`}
                      alt={fd.student?.full_name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style="font-size:48px;opacity:0.3">📷</div>'; }}
                    />
                    {fd.is_primary && (
                      <span style={{ position: 'absolute', top: 8, right: 8, background: 'var(--gradient-primary)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: 'white' }}>⭐ Chính</span>
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{fd.student?.full_name || 'N/A'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{fd.student?.student_code} · {fd.academic_year}</div>
                    <div className="btn-group">
                      {!fd.is_primary && <button className="btn btn-outline btn-sm" onClick={() => handleSetPrimary(fd.id)}>⭐ Đặt chính</button>}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(fd.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
              {faceData.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">📷</div>
                  <p className="empty-state-title">Chưa có dữ liệu khuôn mặt</p>
                  <p className="empty-state-text">Tải ảnh khuôn mặt học sinh để bắt đầu</p>
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
              <h3 className="modal-title">Tải ảnh khuôn mặt</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Học sinh *</label>
                  <select className="form-control" value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} required>
                    <option value="">Chọn học sinh</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.student_code} - {s.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ảnh khuôn mặt *</label>
                  <input type="file" className="form-control" accept="image/*" onChange={e => setSelectedFile(e.target.files[0])} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Năm học</label>
                    <input className="form-control" value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ảnh chính?</label>
                    <select className="form-control" value={form.is_primary} onChange={e => setForm({...form, is_primary: e.target.value})}>
                      <option value="false">Không</option>
                      <option value="true">Có</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tải lên</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceDataManagement;
