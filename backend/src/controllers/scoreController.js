const { ExamScore, Student, Class } = require('../models/associations');
const { Op } = require('sequelize');

const scoreController = {
  create: async (req, res) => {
    try {
      const { student_id, subject, exam_type, semester, score, note } = req.body;
      const newScore = await ExamScore.create({ student_id, subject, exam_type, semester, score, note });
      res.status(201).json(newScore);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const { class_id, student_id, semester } = req.query;
      const whereClause = {};
      const studentWhere = {};
      
      if (student_id) whereClause.student_id = student_id;
      if (semester) whereClause.semester = semester;
      if (class_id) studentWhere.class_id = class_id;

      const scores = await ExamScore.findAll({
        where: whereClause,
        include: [{ 
          model: Student, 
          as: 'student',
          where: Object.keys(studentWhere).length > 0 ? studentWhere : undefined,
          include: [{ model: Class, as: 'class' }]
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({ scores });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  update: async (req, res) => {
    try {
      await ExamScore.update(req.body, { where: { id: req.params.id } });
      res.json({ message: 'Score updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  delete: async (req, res) => {
    try {
      await ExamScore.destroy({ where: { id: req.params.id } });
      res.json({ message: 'Score deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = scoreController;
