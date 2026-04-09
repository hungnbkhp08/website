import { useState, useEffect } from 'react';
import { scoreAPI } from '../../services/api';

const AdminScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { loadScores(); }, []);

  const loadScores = async () => {
    try {
      setLoading(true);
      const res = await scoreAPI.getAll();
      setScores(res.data.scores || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="animate-in">
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">📝 Quản lý Điểm thi Toàn trường</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Học sinh</th><th>Lớp</th><th>Môn học</th><th>Kỳ thi</th><th>Học kỳ</th><th>Điểm</th></tr></thead>
                <tbody>
                  {scores.length > 0 ? scores.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.student?.full_name}</td>
                      <td>{s.student?.class?.name}</td>
                      <td>{s.subject}</td>
                      <td>{s.exam_type}</td>
                      <td>{s.semester}</td>
                      <td><span className="badge primary">{s.score}</span></td>
                    </tr>
                  )) : <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chưa có điểm nào. Cần thêm Modal nhập điểm.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminScores;
