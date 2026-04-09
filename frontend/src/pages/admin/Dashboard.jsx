import { useState, useEffect } from 'react';
import { userAPI, studentAPI, classAPI, attendanceAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, students: 0, classes: 0 });
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [usersRes, studentsRes, classesRes] = await Promise.all([
        userAPI.getAll({ limit: 1 }),
        studentAPI.getAll({ limit: 1 }),
        classAPI.getAll(),
      ]);

      setStats({
        users: usersRes.data.total || 0,
        students: studentsRes.data.total || 0,
        classes: classesRes.data.classes?.length || 0,
      });

      // Mock weekly attendance data
      const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      const mockData = days.map(day => ({
        name: day,
        present: Math.floor(Math.random() * 20) + 80,
        absent: Math.floor(Math.random() * 10) + 2,
        late: Math.floor(Math.random() * 8) + 1,
      }));
      setAttendanceData(mockData);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Có mặt', value: 85, color: '#10b981' },
    { name: 'Vắng', value: 8, color: '#ef4444' },
    { name: 'Đi muộn', value: 5, color: '#f59e0b' },
    { name: 'Có phép', value: 2, color: '#3b82f6' },
  ];

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p className="loading-text">Đang tải dữ liệu...</p></div>;
  }

  return (
    <div className="animate-in">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon primary">👥</div>
          <div className="stat-info">
            <div className="stat-label">Tổng người dùng</div>
            <div className="stat-value">{stats.users}</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success">🎒</div>
          <div className="stat-info">
            <div className="stat-label">Tổng học sinh</div>
            <div className="stat-value">{stats.students}</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning">🏫</div>
          <div className="stat-info">
            <div className="stat-label">Tổng lớp học</div>
            <div className="stat-value">{stats.classes}</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon info">📊</div>
          <div className="stat-info">
            <div className="stat-label">Tỷ lệ chuyên cần</div>
            <div className="stat-value">95%</div>
            <div className="stat-change positive">↑ 2.5% so với tuần trước</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Điểm danh tuần này</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0' }}
                  />
                  <Bar dataKey="present" name="Có mặt" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" name="Đi muộn" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Vắng" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🥧 Tỷ lệ chuyên cần</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0' }}
                    formatter={(value) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
              {pieData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }}></div>
                  <span style={{ color: 'var(--text-muted)' }}>{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
