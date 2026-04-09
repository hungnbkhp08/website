const { Notification, User } = require('../models/associations');
const { Op } = require('sequelize');

// Lấy thông báo của user
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, unread } = req.query;
    const where = { user_id: req.user.id };

    if (type) where.type = type;
    if (unread === 'true') where.is_read = false;

    const offset = (page - 1) * limit;
    const { count, rows } = await Notification.findAndCountAll({
      where,
      include: [{ model: User, as: 'sender', attributes: ['id', 'full_name'] }],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false },
    });

    res.json({
      notifications: rows,
      unreadCount,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy thông báo' });
  }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    }

    await notification.update({ is_read: true });
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật thông báo' });
  }
};

// Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật thông báo' });
  }
};

// Gửi thông báo (giáo viên)
exports.sendNotification = async (req, res) => {
  try {
    const { user_ids, title, message, type = 'announcement' } = req.body;

    const notifications = await Notification.bulkCreate(
      user_ids.map(user_id => ({
        user_id,
        title,
        message,
        type,
        sent_by: req.user.id,
      }))
    );

    // Emit via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      user_ids.forEach(userId => {
        io.to(`user_${userId}`).emit('notification', {
          title,
          message,
          type,
          sender: req.user.full_name,
        });
      });
    }

    res.status(201).json({
      message: `Đã gửi thông báo cho ${notifications.length} người`,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Lỗi gửi thông báo' });
  }
};

// Gửi thông báo cho cả lớp
exports.sendClassNotification = async (req, res) => {
  try {
    const { class_id, title, message, type = 'announcement' } = req.body;
    const { Student } = require('../models/associations');

    const students = await Student.findAll({
      where: { class_id, is_active: true },
      attributes: ['parent_id'],
    });

    const parentIds = [...new Set(students.map(s => s.parent_id).filter(Boolean))];

    if (parentIds.length === 0) {
      return res.status(400).json({ error: 'Không tìm thấy phụ huynh nào trong lớp' });
    }

    const notifications = await Notification.bulkCreate(
      parentIds.map(parent_id => ({
        user_id: parent_id,
        title,
        message,
        type,
        sent_by: req.user.id,
      }))
    );

    const io = req.app.get('io');
    if (io) {
      parentIds.forEach(parentId => {
        io.to(`user_${parentId}`).emit('notification', {
          title,
          message,
          type,
          sender: req.user.full_name,
        });
      });
    }

    res.status(201).json({
      message: `Đã gửi thông báo cho ${notifications.length} phụ huynh`,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Send class notification error:', error);
    res.status(500).json({ error: 'Lỗi gửi thông báo' });
  }
};
