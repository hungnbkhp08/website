const { Student, Class, User, FaceData } = require('../models/associations');
const { Op } = require('sequelize');

exports.getAllStudents = async (req, res) => {
  try {
    const { class_id, search, page = 1, limit = 20 } = req.query;
    const where = { is_active: true };
    
    if (class_id) where.class_id = class_id;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { student_code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Student.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] },
        { model: User, as: 'parent', attributes: ['id', 'full_name', 'phone', 'email'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['full_name', 'ASC']],
    });

    res.json({
      students: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách học sinh' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: Class, as: 'class' },
        { model: User, as: 'parent', attributes: ['id', 'full_name', 'phone', 'email'] },
        { model: FaceData, as: 'faceData' },
      ],
    });

    if (!student) {
      return res.status(404).json({ error: 'Không tìm thấy học sinh' });
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy thông tin học sinh' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { student_code, full_name, date_of_birth, gender, address, class_id, parent_id } = req.body;

    const existing = await Student.findOne({ where: { student_code } });
    if (existing) {
      return res.status(400).json({ error: 'Mã học sinh đã tồn tại' });
    }

    const student = await Student.create({
      student_code, full_name, date_of_birth, gender, address, class_id, parent_id,
    });

    res.status(201).json({ student, message: 'Thêm học sinh thành công' });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Lỗi thêm học sinh' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Không tìm thấy học sinh' });
    }

    const { full_name, date_of_birth, gender, address, class_id, parent_id } = req.body;
    await student.update({ full_name, date_of_birth, gender, address, class_id, parent_id });

    res.json({ student, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật học sinh' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Không tìm thấy học sinh' });
    }

    await student.update({ is_active: false });
    res.json({ message: 'Đã xóa học sinh' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa học sinh' });
  }
};

// Lấy học sinh theo phụ huynh
exports.getStudentsByParent = async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { parent_id: req.user.id, is_active: true },
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] },
      ],
    });
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách con em' });
  }
};
