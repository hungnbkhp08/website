const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Phụ huynh gửi đơn',
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  attachment: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'File đính kèm (giấy khám bệnh,...)',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Giáo viên duyệt',
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  review_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'leave_requests',
});

module.exports = LeaveRequest;
