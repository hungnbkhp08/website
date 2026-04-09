const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const TimeRule = sequelize.define('TimeRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tên quy tắc, vd: Ca sáng, Ca chiều',
  },
  session: {
    type: DataTypes.ENUM('morning', 'afternoon'),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Giờ bắt đầu vào lớp',
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Giờ tan học',
  },
  late_threshold_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
    comment: 'Số phút tối đa trước khi tính đi muộn',
  },
  absent_threshold_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 45,
    comment: 'Quá giờ này mà chưa quét thì coi là vắng',
  },
  academic_year: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'time_rules',
});

module.exports = TimeRule;
