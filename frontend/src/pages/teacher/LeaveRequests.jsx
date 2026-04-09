import { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';

const TeacherLeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => { loadLeaves(); }, [statusFilter]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getAll({ status: statusFilter || undefined });
      setLeaves(res.data.leaves || []);
      setTotal(res.data.total || 0);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleReview = async (status) => {
    if (!reviewModal) return;
    try {
      await leaveAPI.review(reviewModal.id, { status, review_note: reviewNote });
      setReviewModal(null);
      setReviewNote('');
      loadLeaves();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const statusLabels = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };

  return (
    <div className="animate-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📝 Đơn xin phép ({total})</h3>
          <div className="tabs" style={{ marginBottom: 0, width: 'auto' }}>
            <button className={`tab ${statusFilter === '' ? 'active' : ''}`} onClick={() => setStatusFilter('')}>Tất cả</button>
            <button className={`tab ${statusFilter === 'pending' ? 'active' : ''}`} onClick={() => setStatusFilter('pending')}>Chờ duyệt</button>
            <button className={`tab ${statusFilter === 'approved' ? 'active' : ''}`} onClick={() => setStatusFilter('approved')}>Đã duyệt</button>
            <button className={`tab ${statusFilter === 'rejected' ? 'active' : ''}`} onClick={() => setStatusFilter('rejected')}>Từ chối</button>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : leaves.length > 0 ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {leaves.map(leave => (
                <div key={leave.id} className="card" style={{ cursor: 'default' }}>
                  <div className="card-body" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{leave.student?.full_name}</h4>
                          <span className={`badge ${leave.status}`}>{statusLabels[leave.status]}</span>
                        </div>
                        <div style={{ display: 'grid', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}>
                          <div>🏫 Lớp: <strong style={{ color: 'var(--text-secondary)' }}>{leave.student?.class?.name || 'N/A'}</strong></div>
                          <div>👨‍👩‍👧 Phụ huynh: <strong style={{ color: 'var(--text-secondary)' }}>{leave.parent?.full_name} ({leave.parent?.phone})</strong></div>
                          <div>📅 Từ {new Date(leave.start_date).toLocaleDateString('vi-VN')} đến {new Date(leave.end_date).toLocaleDateString('vi-VN')}</div>
                          <div>📝 Lý do: <em style={{ color: 'var(--text-secondary)' }}>{leave.reason}</em></div>
                          {leave.attachment && <div>📎 <a href={leave.attachment} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-400)' }}>Xem file đính kèm</a></div>}
                          {leave.review_note && <div>💬 Ghi chú duyệt: <em>{leave.review_note}</em></div>}
                        </div>
                      </div>
                      {leave.status === 'pending' && (
                        <div className="btn-group">
                          <button className="btn btn-success btn-sm" onClick={() => { setReviewModal(leave); setReviewNote(''); }}>✅ Duyệt</button>
                          <button className="btn btn-danger btn-sm" onClick={() => { setReviewModal(leave); setReviewNote(''); }}>❌ Từ chối</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p className="empty-state-title">Không có đơn xin phép</p>
            </div>
          )}
        </div>
      </div>

      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Duyệt đơn - {reviewModal.student?.full_name}</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16, padding: 12, background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 13 }}>
                <div>📅 {new Date(reviewModal.start_date).toLocaleDateString('vi-VN')} → {new Date(reviewModal.end_date).toLocaleDateString('vi-VN')}</div>
                <div style={{ marginTop: 4 }}>📝 {reviewModal.reason}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea className="form-control" value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Ghi chú..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setReviewModal(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => handleReview('rejected')}>Từ chối</button>
              <button className="btn btn-success" onClick={() => handleReview('approved')}>Duyệt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLeaveRequests;
