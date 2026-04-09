import { useState, useEffect } from 'react';
import { scoreAPI, classAPI } from '../../services/api';

const TeacherScores = () => {
  const [scores, setScores] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { if (selectedClass) loadScores(); }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const res = await classAPI.getMyClasses();
      const cls = res.data.classes || [];
      setClasses(cls);
      if (cls.length > 0) setSelectedClass(cls[0].id);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadScores = async () => {
    try {
      setLoading(true);
      const res = await scoreAPI.getAll({ class_id: selectedClass });
      setScores(res.data.scores || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="animate-in">
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ display: 'flex', gap: 16 }}>
          <h3 className="card-title">📝 Quản lý Điểm thi</h3>
          <select className="form-control" style={{ width: 200 }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
             {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Học sinh</th><th>Môn học</th><th>Kỳ thi</th><th>Học kỳ</th><th>Điểm</th><th>Ghi chú</th></tr></thead>
                <tbody>
                  {scores.length > 0 ? scores.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.student?.full_name}</td>
                      <td>{s.subject}</td>
                      <td>{s.exam_type}</td>
                      <td>{s.semester}</td>
                      <td><span className="badge primary">{s.score}</span></td>
                      <td>{s.note}</td>
                    </tr>
                  )) : <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chưa có điểm nào. Cần Admin thêm chức năng nhập điểm.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherScores;
