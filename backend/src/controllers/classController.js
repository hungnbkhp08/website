const { Class, User, Student } = require('../models/associations');
const { Op } = require('sequelize');

exports.getAllClasses = async (req, res) => {
  try {
    const { grade, academic_year, search } = req.query;
    const where = {};

    if (grade) where.grade = grade;
    if (academic_year) where.academic_year = academic_year;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const classes = await Class.findAll({
      where,
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'full_name'] },
        { model: Student, as: 'students', attributes: ['id'] },
      ],
      order: [['grade', 'ASC'], ['name', 'ASC']],
    });

    const result = classes.map(c => ({
      ...c.toJSON(),
      student_count: c.students ? c.students.length : 0,
    }));

    res.json({ classes: result });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách lớp' });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'full_name', 'phone', 'email'] },
        {
          model: Student, as: 'students',
          where: { is_active: true },
          required: false,
          include: [{ model: User, as: 'parent', attributes: ['id', 'full_name', 'phone'] }],
        },
      ],
    });

    if (!classItem) {
      return res.status(404).json({ error: 'Không tìm thấy lớp' });
    }

    res.json({ class: classItem });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy thông tin lớp' });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { name, grade, academic_year, teacher_id, room } = req.body;
    const classItem = await Class.create({ name, grade, academic_year, teacher_id, room });
    res.status(201).json({ class: classItem, message: 'Tạo lớp thành công' });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Lỗi tạo lớp' });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id);
    if (!classItem) {
      return res.status(404).json({ error: 'Không tìm thấy lớp' });
    }

    const { name, grade, academic_year, teacher_id, room } = req.body;
    await classItem.update({ name, grade, academic_year, teacher_id, room });
    res.json({ class: classItem, message: 'Cập nhật lớp thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật lớp' });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id);
    if (!classItem) {
      return res.status(404).json({ error: 'Không tìm thấy lớp' });
    }

    await classItem.destroy();
    res.json({ message: 'Đã xóa lớp' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa lớp' });
  }
};

// Lớp của giáo viên
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      where: { teacher_id: req.user.id },
      include: [
        { model: Student, as: 'students', where: { is_active: true }, required: false },
      ],
      order: [['name', 'ASC']],
    });

    const result = classes.map(c => ({
      ...c.toJSON(),
      student_count: c.students ? c.students.length : 0,
    }));

    res.json({ classes: result });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách lớp' });
  }
};
