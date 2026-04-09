import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      switch (user.role) {
        case 'admin': navigate('/admin'); break;
        case 'teacher': navigate('/teacher'); break;
        case 'parent': navigate('/parent'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎓</div>
          <h1 className="login-title">EduTrack</h1>
          <p className="login-subtitle">Hệ thống Quản lý Điểm danh Trường học</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input
              id="login-username"
              type="text"
              className="form-control"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                Đang đăng nhập...
              </>
            ) : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '16px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--primary-400)' }}>Tài khoản demo:</strong>
          <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
            <div>👑 Admin: <strong>admin</strong> / 123456</div>
            <div>👩‍🏫 Giáo viên: <strong>gv_nguyen</strong> / 123456</div>
            <div>👨‍👩‍👧 Phụ huynh: <strong>ph_hoang</strong> / 123456</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
