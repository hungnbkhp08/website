const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const ExamScore = sequelize.define('ExamScore', {
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
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  exam_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  semester: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING(255),
    allowNull: true,
  }
}, {
  tableName: 'exam_scores',
});

module.exports = ExamScore;
