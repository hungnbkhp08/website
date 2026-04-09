import { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  
  // Connect to Socket.IO
  useEffect(() => {
    let socket;
    
    if (user?.id) {
      socket = io(location.hostname === 'localhost' ? 'http://localhost:5000' : '/');
      
      socket.on('connect', () => {
        socket.emit('join', user.id);
      });
      
      socket.on('notification', (newNotif) => {
        // Automatically fetch new notifications when receiving a real-time event
        loadNotifications();
        
        // Could also show a browser toast here
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotif.title, { body: newNotif.message });
        }
      });
      
      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
    
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return; // Already read
    
    try {
      await notificationAPI.markAsRead(id);
      
      // Optimistic UI update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      await notificationAPI.markAllAsRead();
      loadNotifications();
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc', err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'attendance': return '📊';
      case 'alert': return '⚠️';
      case 'leave': return '📝';
      case 'announcement': return '📢';
      default: return '🔔';
    }
  };

  return (
    <div className="animate-in">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className="card-title">🔔 Thông báo của bạn</h3>
            {unreadCount > 0 && (
              <span className="badge danger" style={{ borderRadius: '12px' }}>
                {unreadCount} tin mới
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleMarkAllAsRead}>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : notifications.length > 0 ? (
            <ul className="notification-list">
              {notifications.map(notif => (
                <li 
                  key={notif.id} 
                  className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
                >
                  <div style={{ fontSize: '24px', marginRight: '16px' }}>
                    {getIconForType(notif.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title-text">{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <div className="notification-time">
                        {new Date(notif.created_at).toLocaleString('vi-VN')}
                        {notif.sender?.full_name && ` • Từ: ${notif.sender.full_name}`}
                      </div>
                      {!notif.is_read && <div className="notification-dot"></div>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔕</div>
              <p className="empty-state-title">Chưa có thông báo nào</p>
              <p className="empty-state-text">Bạn sẽ nhận được thông báo khi con điểm danh, vắng mặt hoặc có tin mới từ giáo viên.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentNotifications;
