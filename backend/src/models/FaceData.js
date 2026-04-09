const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const FaceData = sequelize.define('FaceData', {
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
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Đường dẫn ảnh khuôn mặt mẫu',
  },
  academic_year: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Ảnh chính dùng để nhận diện',
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'face_data',
});

module.exports = FaceData;
