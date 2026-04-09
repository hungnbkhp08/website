const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Mã học sinh',
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'classes',
      key: 'id',
    },
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Phụ huynh liên kết',
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'students',
});

module.exports = Student;
