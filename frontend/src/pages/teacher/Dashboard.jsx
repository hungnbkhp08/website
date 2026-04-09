import { useState, useEffect } from 'react';
import { attendanceAPI, classAPI } from '../../services/api';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('morning');
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(null);
  const [manualForm, setManualForm] = useState({ status: 'present', note: '' });

  useEffect(() => { loadClasses(); }, []);

  useEffect(() => {
    if (selectedClass) loadDashboard();
  }, [selectedClass, date, session]);

  const loadClasses = async () => {
    try {
      const res = await classAPI.getMyClasses();
      const cls = res.data.classes || [];
      setClasses(cls);
      if (cls.length > 0) setSelectedClass(cls[0].id);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getDashboard({ class_id: selectedClass, date, session });
      setDashboard(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleManualAttendance = async () => {
    if (!showManual) return;
    try {
      await attendanceAPI.manualAttendance({
        student_id: showManual.id,
        date,
        session,
        status: manualForm.status,
        note: manualForm.note,
      });
      setShowManual(null);
      loadDashboard();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const statusLabels = { present: 'Có mặt', absent: 'Vắng', late: 'Đi muộn', excused: 'Có phép' };
  const sessionLabels = { morning: 'Ca sáng', afternoon: 'Ca chiều' };

  return (
    <div className="animate-in">
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <select className="form-control" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ width: 200 }}>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.student_count} HS)</option>)}
        </select>
        <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} style={{ width: 180 }} />
        <div className="tabs" style={{ marginBottom: 0, width: 'auto' }}>
          <button className={`tab ${session === 'morning' ? 'active' : ''}`} onClick={() => setSession('morning')}>☀️ Sáng</button>
          <button className={`tab ${session === 'afternoon' ? 'active' : ''}`} onClick={() => setSession('afternoon')}>🌅 Chiều</button>
        </div>
      </div>

      {dashboard && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon primary">👥</div>
              <div className="stat-info"><div className="stat-label">Tổng sĩ số</div><div className="stat-value">{dashboard.total}</div></div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon success">✅</div>
              <div className="stat-info"><div className="stat-label">Có mặt</div><div className="stat-value">{dashboard.present}</div></div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon warning">⏰</div>
              <div className="stat-info"><div className="stat-label">Đi muộn</div><div className="stat-value">{dashboard.late}</div></div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon danger">❌</div>
              <div className="stat-info"><div className="stat-label">Vắng / Có phép</div><div className="stat-value">{dashboard.absent} / {dashboard.excused}</div></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Danh sách học sinh - {sessionLabels[session]} ({date})</h3>
            </div>
            <div className="card-body">
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Mã HS</th><th>Họ tên</th><th>Trạng thái</th><th>Giờ vào</th><th>Muộn (phút)</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    {dashboard.students?.map(s => (
                      <tr key={s.id}>
                        <td style={{ color: 'var(--primary-400)' }}>{s.student_code}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.full_name}</td>
                        <td><span className={`badge ${s.status}`}>{statusLabels[s.status]}</span></td>
                        <td>{s.check_in_time ? new Date(s.check_in_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                        <td>{s.late_minutes > 0 ? <span style={{ color: 'var(--warning-500)', fontWeight: 600 }}>{s.late_minutes}p</span> : '—'}</td>
                        <td style={{ fontSize: 13 }}>{s.note || (s.is_manual ? '📝 Thủ công' : '')}</td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => { setShowManual(s); setManualForm({ status: s.status, note: s.note || '' }); }}>
                            ✏️ Sửa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {loading && <div className="loading-container"><div className="spinner"></div></div>}

      {showManual && (
        <div className="modal-overlay" onClick={() => setShowManual(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Điểm danh thủ công - {showManual.full_name}</h3>
              <button className="modal-close" onClick={() => setShowManual(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select className="form-control" value={manualForm.status} onChange={e => setManualForm({...manualForm, status: e.target.value})}>
                  <option value="present">Có mặt</option>
                  <option value="absent">Vắng</option>
                  <option value="late">Đi muộn</option>
                  <option value="excused">Có phép</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <textarea className="form-control" value={manualForm.note} onChange={e => setManualForm({...manualForm, note: e.target.value})} placeholder="Lý do điểm danh thủ công..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowManual(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleManualAttendance}>Cập nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
