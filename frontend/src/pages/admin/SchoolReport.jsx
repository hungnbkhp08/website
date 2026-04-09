import { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';

const SchoolReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    grade: '',
  });

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getSchoolReport(filters);
      setReport(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadReport(); }, []);

  return (
    <div className="animate-in">
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">📈 Báo cáo Thống kê Chuyên cần</h3>
          <button className="btn btn-primary" onClick={loadReport}>🔄 Tải lại</button>
        </div>
        <div className="card-body">
          <div className="filter-bar">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Từ ngày</label>
              <input type="date" className="form-control" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Đến ngày</label>
              <input type="date" className="form-control" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Khối</label>
              <select className="form-control" value={filters.grade} onChange={e => setFilters({...filters, grade: e.target.value})}>
                <option value="">Tất cả</option>
                {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Khối {i+1}</option>)}
              </select>
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button className="btn btn-success" onClick={loadReport}>Xem báo cáo</button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : report ? (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon primary">👨‍🎓</div>
              <div className="stat-info"><div className="stat-label">Tổng học sinh</div><div className="stat-value">{report.total_students}</div></div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon success">✅</div>
              <div className="stat-info"><div className="stat-label">Tổng số lớp</div><div className="stat-value">{report.class_summary?.length || 0}</div></div>
            </div>
          </div>

          {report.class_summary?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header"><h3 className="card-title">Tổng hợp theo lớp</h3></div>
              <div className="card-body">
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Lớp</th><th>Khối</th><th>Sĩ số</th><th>Có mặt</th><th>Vắng</th><th>Muộn</th><th>Có phép</th></tr></thead>
                    <tbody>
                      {report.class_summary.map((c, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.class_name}</td>
                          <td>{c.grade}</td>
                          <td>{c.total_students}</td>
                          <td><span className="badge present">{c.total_present}</span></td>
                          <td><span className="badge absent">{c.total_absent}</span></td>
                          <td><span className="badge late">{c.total_late}</span></td>
                          <td><span className="badge excused">{c.total_excused}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header"><h3 className="card-title">Chi tiết học sinh</h3></div>
            <div className="card-body">
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Mã HS</th><th>Họ tên</th><th>Lớp</th><th>Có mặt</th><th>Vắng</th><th>Muộn</th><th>Phép</th><th>Muộn (phút)</th></tr></thead>
                  <tbody>
                    {report.students?.map((s, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--primary-400)' }}>{s.student_code}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.full_name}</td>
                        <td>{s.class_name}</td>
                        <td><span className="badge present">{s.present}</span></td>
                        <td><span className="badge absent">{s.absent}</span></td>
                        <td><span className="badge late">{s.late}</span></td>
                        <td><span className="badge excused">{s.excused}</span></td>
                        <td>{s.total_late_minutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default SchoolReport;
