import { useState, useEffect } from 'react';
import { notificationAPI, classAPI } from '../../services/api';

const SendNotification = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [form, setForm] = useState({ title: '', message: '', type: 'announcement' });
  const [sending, setSending] = useState(false);
  const [sentHistory, setSentHistory] = useState([]);

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const res = await classAPI.getMyClasses();
      setClasses(res.data.classes || []);
      if (res.data.classes?.length > 0) setSelectedClass(res.data.classes[0].id);
    } catch (err) { console.error(err); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedClass || !form.title || !form.message) return alert('Vui lòng điền đầy đủ thông tin');
    try {
      setSending(true);
      const res = await notificationAPI.sendToClass({ class_id: selectedClass, ...form });
      setSentHistory(prev => [{ ...form, class_name: classes.find(c => c.id == selectedClass)?.name, count: res.data.count, time: new Date() }, ...prev]);
      setForm({ title: '', message: '', type: 'announcement' });
      alert(`Đã gửi thông báo cho ${res.data.count} phụ huynh!`);
    } catch (err) { alert(err.response?.data?.error || 'Lỗi gửi thông báo'); } finally { setSending(false); }
  };

  return (
    <div className="animate-in">
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h3 className="card-title">📢 Gửi thông báo cho lớp</h3></div>
          <div className="card-body">
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label className="form-label">Lớp *</label>
                <select className="form-control" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.student_count} HS)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Loại thông báo</label>
                <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="announcement">📢 Thông báo chung</option>
                  <option value="attendance">📊 Về điểm danh</option>
                  <option value="alert">⚠️ Cảnh báo</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tiêu đề *</label>
                <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="VD: Thông báo về buổi họp phụ huynh" required />
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung *</label>
                <textarea className="form-control" value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Nhập nội dung thông báo..." rows={5} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={sending} style={{ width: '100%' }}>
                {sending ? '⏳ Đang gửi...' : '📤 Gửi thông báo'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">📋 Lịch sử gửi</h3></div>
          <div className="card-body">
            {sentHistory.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {sentHistory.map((item, i) => (
                  <div key={i} style={{ padding: 12, background: 'rgba(99,102,241,0.05)', borderRadius: 8, borderLeft: '3px solid var(--primary-500)' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>→ {item.class_name} · {item.count} phụ huynh · {item.time.toLocaleTimeString('vi-VN')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p className="empty-state-title">Chưa gửi thông báo nào</p>
                <p className="empty-state-text">Thông báo đã gửi sẽ hiển thị tại đây</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotification;
