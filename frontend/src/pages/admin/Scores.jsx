import { useState, useEffect } from 'react';
import { scoreAPI, classAPI, studentAPI } from '../../services/api';

const AdminScores = () => {
  const [scores, setScores] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, student_id: '', subject: '', exam_type: 'Giữa kỳ', semester: 'Học kỳ 1', score: '', note: '' });

  useEffect(() => { loadClasses(); loadScores(); }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
      loadScores();
    } else {
      setStudents([]);
      loadScores(); // load all if no filter
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const res = await classAPI.getAll();
      setClasses(res.data.classes || []);
    } catch (err) {}
  };

  const loadStudents = async () => {
    try {
      const res = await studentAPI.getAll({ class_id: selectedClass });
      setStudents(res.data.students || []);
    } catch (err) {}
  };

  const loadScores = async () => {
    try {
      setLoading(true);
      const res = await scoreAPI.getAll(selectedClass ? { class_id: selectedClass } : {});
      setScores(res.data.scores || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openForm = (scoreItem = null) => {
    if (scoreItem) {
      setForm({
        id: scoreItem.id, student_id: scoreItem.student_id, subject: scoreItem.subject,
        exam_type: scoreItem.exam_type, semester: scoreItem.semester, score: scoreItem.score, note: scoreItem.note || ''
      });
      // Preload students if not loaded
      if (students.length === 0 && scoreItem.student?.class_id) {
         setSelectedClass(scoreItem.student.class_id);
      }
    } else {
      setForm({ id: null, student_id: '', subject: '', exam_type: 'Giữa kỳ', semester: 'Học kỳ 1', score: '', note: '' });
    }
    setModalOpen(true);
  };

  const saveScore = async () => {
    if (!form.student_id || !form.subject || form.score === '') return alert('Vui lòng nhập đủ thông tin!');
    try {
      if (form.id) {
        await scoreAPI.update(form.id, form);
      } else {
        await scoreAPI.create(form);
      }
      setModalOpen(false);
      loadScores();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi lưu điểm'); }
  };

  const deleteScore = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa điểm này?')) return;
    try {
      await scoreAPI.delete(id);
      loadScores();
    } catch (err) {}
  };

  return (
    <div className="animate-in">
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <h3 className="card-title">📝 Quản lý Điểm thi</h3>
          <select className="form-control" style={{ width: 200 }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
             <option value="">-- Lọc theo lớp --</option>
             {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-success" onClick={() => openForm(null)}>+ Nhập điểm mới</button>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Học sinh</th><th>Lớp</th><th>Môn học</th><th>Kỳ thi</th><th>Học kỳ</th><th>Điểm</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {scores.length > 0 ? scores.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.student?.full_name} <br/><span style={{fontSize: 12, color: 'var(--text-muted)'}}>{s.student?.student_code}</span></td>
                      <td>{s.student?.class?.name}</td>
                      <td>{s.subject}</td>
                      <td>{s.exam_type}</td>
                      <td>{s.semester}</td>
                      <td><span className={`badge ${s.score >= 8 ? 'success' : s.score >= 5 ? 'primary' : 'danger'}`}>{s.score}</span></td>
                      <td>
                         <button className="btn btn-outline btn-sm" onClick={() => openForm(s)} style={{ marginRight: 8 }}>Sửa</button>
                         <button className="btn btn-danger btn-sm" onClick={() => deleteScore(s.id)}>Xóa</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="7" style={{ textAlign: 'center' }}>Chưa có dữ liệu điểm.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{form.id ? 'Sửa điểm thi' : 'Nhập điểm mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--warning-500)' }}>
                  Lưu ý: Vui lòng chọn Lớp học ở thanh tìm kiếm bên ngoài trước để hiển thị danh sách Học sinh ở đây.
                </label>
                <select className="form-control" value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})}>
                  <option value="">-- Chọn học sinh ({students.length} học sinh) --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.student_code} - {s.full_name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Học kỳ</label>
                  <select className="form-control" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})}>
                    <option value="Học kỳ 1">Học kỳ 1</option>
                    <option value="Học kỳ 2">Học kỳ 2</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Kỳ thi (Loại điểm)</label>
                  <select className="form-control" value={form.exam_type} onChange={e => setForm({...form, exam_type: e.target.value})}>
                    <option value="Thường xuyên">Thường xuyên (15p)</option>
                    <option value="Giữa kỳ">Giữa kỳ</option>
                    <option value="Cuối kỳ">Cuối kỳ</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Môn học</label>
                  <input type="text" className="form-control" placeholder="VD: Toán, Ngữ Văn" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Điểm số</label>
                  <input type="number" min="0" max="10" step="0.1" className="form-control" value={form.score} onChange={e => setForm({...form, score: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú (Tùy chọn)</label>
                <input type="text" className="form-control" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={saveScore}>Lưu điểm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScores;
