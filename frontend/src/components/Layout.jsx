import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { section: 'Tổng quan', items: [
            { path: '/admin', label: 'Dashboard', icon: '📊' },
          ]},
          { section: 'Quản lý', items: [
            { path: '/admin/users', label: 'Người dùng', icon: '👥' },
            { path: '/admin/students', label: 'Học sinh', icon: '🎒' },
            { path: '/admin/classes', label: 'Lớp học', icon: '🏫' },
          ]},
          { section: 'Cài đặt', items: [
            { path: '/admin/time-rules', label: 'Quy tắc thời gian', icon: '⏰' },
            { path: '/admin/face-data', label: 'Dữ liệu khuôn mặt', icon: '📷' },
          ]},
          { section: 'Báo cáo', items: [
            { path: '/admin/reports', label: 'Thống kê', icon: '📈' },
          ]},
        ];
      case 'teacher':
        return [
          { section: 'Lớp học', items: [
            { path: '/teacher', label: 'Dashboard sĩ số', icon: '📊' },
          ]},
          { section: 'Quản lý', items: [
            { path: '/teacher/leaves', label: 'Đơn xin phép', icon: '📝' },
            { path: '/teacher/notifications', label: 'Gửi thông báo', icon: '📢' },
          ]},
        ];
      case 'parent':
        return [
          { section: 'Theo dõi', items: [
            { path: '/parent', label: 'Điểm danh con', icon: '📊' },
          ]},
          { section: 'Yêu cầu', items: [
            { path: '/parent/leave', label: 'Xin nghỉ phép', icon: '📝' },
            { path: '/parent/notifications', label: 'Thông báo', icon: '🔔' },
          ]},
        ];
      default:
        return [];
    }
  };

  const roleLabels = {
    admin: 'Quản trị viên',
    teacher: 'Giáo viên',
    parent: 'Phụ huynh',
  };

  const navItems = getNavItems();

  const getPageTitle = () => {
    for (const section of navItems) {
      const found = section.items.find(item => item.path === location.pathname);
      if (found) return found.label;
    }
    return 'Dashboard';
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🎓</div>
            <span className="sidebar-logo-text">EduTrack</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section, idx) => (
            <div className="nav-section" key={idx}>
              <div className="nav-section-title">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/teacher' || item.path === '/parent'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">{roleLabels[user?.role]}</div>
            </div>
          </div>
          <button
            className="nav-item"
            onClick={logout}
            style={{ marginTop: 8, color: 'var(--danger-500)' }}
          >
            <span className="nav-item-icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              className="top-bar-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
              id="menu-toggle"
            >
              ☰
            </button>
            <div>
              <h1 className="page-title">{getPageTitle()}</h1>
              <p className="page-subtitle">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="top-bar-right">
            <button className="top-bar-btn" title="Thông báo">
              🔔
            </button>
          </div>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          #menu-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
