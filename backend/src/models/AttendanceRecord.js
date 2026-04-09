const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const AttendanceRecord = sequelize.define('AttendanceRecord', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời điểm quét mặt vào',
  },
  check_out_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời điểm quét mặt ra',
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
    defaultValue: 'absent',
    comment: 'present=có mặt, absent=vắng, late=đi muộn, excused=có phép',
  },
  late_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Số phút đi muộn',
  },
  face_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Ảnh chụp khuôn mặt khi điểm danh',
  },
  is_manual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Điểm danh thủ công bởi giáo viên',
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recorded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Người ghi nhận (nếu điểm danh thủ công)',
  },
  session: {
    type: DataTypes.ENUM('morning', 'afternoon'),
    defaultValue: 'morning',
    comment: 'Ca học: sáng / chiều',
  },
}, {
  tableName: 'attendance_records',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'date', 'session'],
    },
  ],
});

module.exports = AttendanceRecord;
