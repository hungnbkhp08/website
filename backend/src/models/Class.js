const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Khối lớp (1-12)',
  },
  academic_year: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Năm học, vd: 2024-2025',
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Giáo viên chủ nhiệm',
  },
  room: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Phòng học',
  },
}, {
  tableName: 'classes',
});

module.exports = Class;
