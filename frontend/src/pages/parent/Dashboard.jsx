import { useState, useEffect } from 'react';
import { studentAPI, attendanceAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [period, setPeriod] = useState('month');
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadChildren(); }, []);

  useEffect(() => {
    if (selectedChild) loadAttendance();
  }, [selectedChild, period]);

  const loadChildren = async () => {
    try {
      const res = await studentAPI.getMyChildren();
      const kids = res.data.students || [];
      setChildren(kids);
      if (kids.length > 0) setSelectedChild(kids[0].id);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getChildAttendance(selectedChild, { period });
      setAttendance(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const statusLabels = { present: 'Có mặt', absent: 'Vắng không phép', late: 'Đi muộn', excused: 'Nghỉ có phép' };
  
  // Real-time notification check could be added here using Socket.IO
  const childInfo = children.find(c => c.id == selectedChild);

  return (
    <div className="animate-in">
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <select className="form-control" value={selectedChild} onChange={e => setSelectedChild(e.target.value)} style={{ width: 250 }}>
          {children.map(c => <option key={c.id} value={c.id}>👨‍🎓 {c.full_name} ({c.class?.name})</option>)}
        </select>
        <div className="tabs" style={{ marginBottom: 0, width: 'auto' }}>
          <button className={`tab ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>7 ngày qua</button>
          <button className={`tab ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>Tháng này</button>
          <button className={`tab ${period === 'year' ? 'active' : ''}`} onClick={() => setPeriod('year')}>Từ đầu năm</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : children.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍👩‍👧</div>
          <p className="empty-state-title">Chưa có thông tin học sinh</p>
          <p className="empty-state-text">Vui lòng liên hệ nhà trường để liên kết tài khoản học sinh</p>
        </div>
      ) : attendance && childInfo ? (
        <>
          {attendance.records.length > 0 && attendance.records[0].date === new Date().toISOString().split('T')[0] && (
            <div className="card" style={{ marginBottom: 24, border: '1px solid var(--primary-500)', boxShadow: 'var(--shadow-glow)' }}>
              <div className="card-body" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                {attendance.records[0].face_image ? (
                  <img src={attendance.records[0].face_image} alt="Check-in capture" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: 12, background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📷</div>
                )}
                <div>
                  <h4 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Trạng thái hôm nay: <span className={`badge ${attendance.records[0].status}`} style={{ fontSize: 16 }}>{statusLabels[attendance.records[0].status]}</span>
                  </h4>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {attendance.records[0].check_in_time ? `Lúc: ${new Date(attendance.records[0].check_in_time).toLocaleTimeString('vi-VN')}` : 'Chưa ghi nhận giờ vào'}
                    {attendance.records[0].late_minutes > 0 && ` (Đi muộn ${attendance.records[0].late_minutes} phút)`}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon primary">📅</div>
              <div className="stat-info"><div className="stat-label">Tổng số buổi</div><div className="stat-value">{attendance.stats.total_days}</div></div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon success">✅</div>
              <div className="stat-info"><div className="stat-label">Đi học đầy đủ</div><div className="stat-value">{attendance.stats.present}</div></div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon warning">⏰</div>
              <div className="stat-info"><div className="stat-label">Đi muộn</div><div className="stat-value">{attendance.stats.late}</div><div className="stat-change negative">{attendance.stats.total_late_minutes} phút</div></div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon danger">❌</div>
              <div className="stat-info"><div className="stat-label">Vắng / Có phép</div><div className="stat-value">{attendance.stats.absent} / {attendance.stats.excused}</div></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">📖 Lịch sử điểm danh</h3></div>
            <div className="card-body">
              {attendance.records.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Ngày</th><th>Trạng thái</th><th>Giờ vào</th><th>Giờ ra</th><th>Ghi chú</th></tr></thead>
                    <tbody>
                      {attendance.records.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(r.date).toLocaleDateString('vi-VN')}</td>
                          <td><span className={`badge ${r.status}`}>{statusLabels[r.status]}</span></td>
                          <td>{r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td>{r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.late_minutes > 0 ? `Muộn ${r.late_minutes} phút. ` : ''}{r.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <p className="empty-state-title">Chưa có dữ liệu</p>
                  <p className="empty-state-text">Không có thông tin điểm danh trong khoảng thời gian này</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ParentDashboard;
