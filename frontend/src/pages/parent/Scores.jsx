import { useState, useEffect } from 'react';
import { scoreAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ParentScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
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
      <div className="card">
        <div className="card-header"><h3 className="card-title">📝 Bảng điểm của con</h3></div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : scores.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Học kỳ</th><th>Môn học</th><th>Loại điểm</th><th>Điểm số</th><th>Ghi chú</th></tr></thead>
                <tbody>
                  {scores.map(s => (
                    <tr key={s.id}>
                      <td>{s.semester}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{s.subject}</td>
                      <td>{s.exam_type}</td>
                      <td><span className={`badge ${s.score >= 8 ? 'success' : s.score >= 5 ? 'primary' : 'danger'}`} style={{ fontSize: 14 }}>{s.score}</span></td>
                      <td>{s.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="empty-state"><p>Chưa có dữ liệu điểm.</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentScores;
