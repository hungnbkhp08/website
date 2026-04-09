import { useState, useEffect } from 'react';
import { studentAPI, leaveAPI } from '../../services/api';

const ParentLeaveRequest = () => {
  const [children, setChildren] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    student_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childrenRes, reqsRes] = await Promise.all([
        studentAPI.getMyChildren(),
        leaveAPI.getMyRequests()
      ]);
      const kids = childrenRes.data.students || [];
      setChildren(kids);
      setRequests(reqsRes.data.leaves || []);
      
      if (kids.length > 0) {
        setForm(prev => ({ ...prev, student_id: kids[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_id || !form.start_date || !form.end_date || !form.reason) {
      return alert('Vui lòng điền đầy đủ thông tin bắt buộc');
    }
    
    if (new Date(form.start_date) > new Date(form.end_date)) {
      return alert('Ngày bắt đầu không thể sau ngày kết thúc');
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('student_id', form.student_id);
      formData.append('start_date', form.start_date);
      formData.append('end_date', form.end_date);
      formData.append('reason', form.reason);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await leaveAPI.create(formData);
      setShowModal(false);
      
      // Reset form
      setForm(prev => ({
        ...prev,
        start_date: '',
        end_date: '',
        reason: '',
      }));
      setAttachment(null);
      
      alert('Gửi đơn xin phép thành công!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi gửi đơn xin phép');
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabels = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };

  return (
    <div className="animate-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📝 Đơn xin nghỉ phép của con</h3>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Tạo đơn xin phép
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : requests.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Học sinh</th>
                    <th>Thời gian nghỉ</th>
                    <th>Lý do</th>
                    <th>Trạng thái</th>
                    <th>Giáo viên duyệt</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.student?.full_name}</td>
                      <td>
                        {new Date(req.start_date).toLocaleDateString('vi-VN')} → {new Date(req.end_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.reason}>
                          {req.reason}
                        </div>
                        {req.attachment && (
                          <a href={req.attachment} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--primary-400)', display: 'block', marginTop: '4px' }}>
                            📎 Xem đính kèm
                          </a>
                        )}
                      </td>
                      <td><span className={`badge ${req.status}`}>{statusLabels[req.status]}</span></td>
                      <td>
                        {req.reviewer?.full_name || '—'}
                        {req.review_note && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' title={req.review_note} }}>
                            💬 {req.review_note}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p className="empty-state-title">Chưa có đơn xin phép nào</p>
              <p className="empty-state-text">Nhấn "Tạo đơn xin phép" để gửi đơn cho giáo viên</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Tạo đơn xin nghỉ học</h3>
              <button className="modal-close" onClick={() => !submitting && setShowModal(false)} disabled={submitting}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Chọn học sinh *</label>
                  <select 
                    className="form-control" 
                    value={form.student_id} 
                    onChange={e => setForm({...form, student_id: e.target.value})}
                    required
                  >
                    {children.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.student_code})</option>)}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Từ ngày *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={form.start_date} 
                      onChange={e => setForm({...form, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đến ngày *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={form.end_date} 
                      onChange={e => setForm({...form, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lý do nghỉ *</label>
                  <textarea 
                    className="form-control" 
                    value={form.reason} 
                    onChange={e => setForm({...form, reason: e.target.value})}
                    placeholder="Vui lòng ghi rõ lý do để giáo viên chủ nhiệm xem xét..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">File đính kèm (Giấy khám bệnh,...)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    onChange={e => setAttachment(e.target.files[0])}
                    accept="image/*,.pdf"
                  />
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Chấp nhận file ảnh hoặc PDF (tối đa 5MB)
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={submitting}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentLeaveRequest;
