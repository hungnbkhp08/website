import { useState, useEffect } from 'react';
import { timeRuleAPI } from '../../services/api';

const TimeRules = () => {
  const [rules, setRules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', session: 'morning', start_time: '07:00', end_time: '11:30', late_threshold_minutes: 15, absent_threshold_minutes: 45, academic_year: '2025-2026', is_active: true });

  useEffect(() => { loadRules(); }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const res = await timeRuleAPI.getAll();
      setRules(res.data.rules || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) { await timeRuleAPI.update(editingRule.id, form); }
      else { await timeRuleAPI.create(form); }
      setShowModal(false);
      loadRules();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setForm({ name: rule.name, session: rule.session, start_time: rule.start_time, end_time: rule.end_time, late_threshold_minutes: rule.late_threshold_minutes, absent_threshold_minutes: rule.absent_threshold_minutes, academic_year: rule.academic_year, is_active: rule.is_active });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa quy tắc này?')) return;
    try { await timeRuleAPI.delete(id); loadRules(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const sessionLabels = { morning: 'Ca sáng ☀️', afternoon: 'Ca chiều 🌅' };

  return (
    <div className="animate-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⏰ Quy tắc Thời gian</h3>
          <button className="btn btn-primary" onClick={() => { setEditingRule(null); setForm({ name: '', session: 'morning', start_time: '07:00', end_time: '11:30', late_threshold_minutes: 15, absent_threshold_minutes: 45, academic_year: '2025-2026', is_active: true }); setShowModal(true); }}>
            + Thêm quy tắc
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {rules.map(rule => (
                <div key={rule.id} className="card" style={{ background: rule.is_active ? 'var(--bg-dark-card)' : 'rgba(255,255,255,0.02)', opacity: rule.is_active ? 1 : 0.6 }}>
                  <div className="card-body" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{rule.name}</h4>
                        <span className={`badge ${rule.session === 'morning' ? 'present' : 'info'}`}>{sessionLabels[rule.session]}</span>
                      </div>
                      <div className="btn-group">
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(rule)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rule.id)}>🗑️</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'rgba(99,102,241,0.08)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Giờ vào</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-400)' }}>{rule.start_time}</div>
                      </div>
                      <div style={{ background: 'rgba(16,185,129,0.08)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Giờ ra</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success-500)' }}>{rule.end_time}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', display: 'grid', gap: 4 }}>
                      <div>⚠️ Đi muộn sau: <strong style={{ color: 'var(--warning-500)' }}>{rule.late_threshold_minutes} phút</strong></div>
                      <div>❌ Vắng sau: <strong style={{ color: 'var(--danger-500)' }}>{rule.absent_threshold_minutes} phút</strong></div>
                      <div>📅 Năm học: <strong style={{ color: 'var(--text-secondary)' }}>{rule.academic_year}</strong></div>
                    </div>
                  </div>
                </div>
              ))}
              {rules.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">⏰</div>
                  <p className="empty-state-title">Chưa có quy tắc thời gian</p>
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
              <h3 className="modal-title">{editingRule ? 'Sửa quy tắc' : 'Thêm quy tắc'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tên quy tắc *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="VD: Ca sáng" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ca học *</label>
                    <select className="form-control" value={form.session} onChange={e => setForm({...form, session: e.target.value})}>
                      <option value="morning">Ca sáng</option>
                      <option value="afternoon">Ca chiều</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Giờ bắt đầu *</label>
                    <input type="time" className="form-control" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giờ kết thúc *</label>
                    <input type="time" className="form-control" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Đi muộn sau (phút)</label>
                    <input type="number" className="form-control" value={form.late_threshold_minutes} onChange={e => setForm({...form, late_threshold_minutes: parseInt(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vắng sau (phút)</label>
                    <input type="number" className="form-control" value={form.absent_threshold_minutes} onChange={e => setForm({...form, absent_threshold_minutes: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Năm học</label>
                  <input className="form-control" value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingRule ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRules;
