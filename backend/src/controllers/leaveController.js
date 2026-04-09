const { LeaveRequest, Student, User } = require('../models/associations');
const { Op } = require('sequelize');

// Phụ huynh gửi đơn xin phép
exports.createLeaveRequest = async (req, res) => {
  try {
    const { student_id, start_date, end_date, reason } = req.body;

    // Kiểm tra học sinh thuộc về phụ huynh này
    const student = await Student.findByPk(student_id);
    if (!student || student.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền gửi đơn cho học sinh này' });
    }

    const attachment = req.file ? `/uploads/leave/${req.file.filename}` : null;

    const leave = await LeaveRequest.create({
      student_id,
      parent_id: req.user.id,
      start_date,
      end_date,
      reason,
      attachment,
    });

    res.status(201).json({ leave, message: 'Đã gửi đơn xin phép thành công' });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ error: 'Lỗi gửi đơn xin phép' });
  }
};

// Danh sách đơn xin phép (cho giáo viên duyệt)
exports.getLeaveRequests = async (req, res) => {
  try {
    const { status, class_id, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;

    const studentWhere = { is_active: true };
    if (class_id) studentWhere.class_id = class_id;

    // Nếu là giáo viên, chỉ lấy đơn từ lớp mình chủ nhiệm
    if (req.user.role === 'teacher') {
      const { Class } = require('../models/associations');
      const teacherClasses = await Class.findAll({
        where: { teacher_id: req.user.id },
        attributes: ['id'],
      });
      const classIds = teacherClasses.map(c => c.id);
      studentWhere.class_id = { [Op.in]: classIds };
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await LeaveRequest.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          where: studentWhere,
          include: [{ model: require('../models/Class'), as: 'class', attributes: ['id', 'name'] }],
        },
        { model: User, as: 'parent', attributes: ['id', 'full_name', 'phone'] },
        { model: User, as: 'reviewer', attributes: ['id', 'full_name'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      leaves: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách đơn xin phép' });
  }
};

// Duyệt đơn
exports.reviewLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_note } = req.body;

    const leave = await LeaveRequest.findByPk(id);
    if (!leave) {
      return res.status(404).json({ error: 'Không tìm thấy đơn xin phép' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Đơn đã được xử lý' });
    }

    await leave.update({
      status,
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
      review_note,
    });

    res.json({ leave, message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn xin phép` });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi duyệt đơn' });
  }
};

// Đơn xin phép của phụ huynh
exports.getParentLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.findAll({
      where: { parent_id: req.user.id },
      include: [
        { model: Student, as: 'student', attributes: ['id', 'full_name', 'student_code'] },
        { model: User, as: 'reviewer', attributes: ['id', 'full_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách đơn xin phép' });
  }
};
