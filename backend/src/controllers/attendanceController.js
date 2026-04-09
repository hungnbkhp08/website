const { AttendanceRecord, Student, Class, User, TimeRule } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../models/index');

// Dashboard sĩ số lớp cho giáo viên
exports.getClassDashboard = async (req, res) => {
  try {
    const { class_id, date, session = 'morning' } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const students = await Student.findAll({
      where: { class_id, is_active: true },
      include: [{
        model: AttendanceRecord,
        as: 'attendances',
        where: { date: targetDate, session },
        required: false,
      }],
      order: [['full_name', 'ASC']],
    });

    let present = 0, absent = 0, late = 0, excused = 0;

    const studentList = students.map(s => {
      const att = s.attendances && s.attendances[0];
      const status = att ? att.status : 'absent';

      if (status === 'present') present++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
      else absent++;

      return {
        id: s.id,
        student_code: s.student_code,
        full_name: s.full_name,
        status,
        check_in_time: att ? att.check_in_time : null,
        late_minutes: att ? att.late_minutes : 0,
        is_manual: att ? att.is_manual : false,
        note: att ? att.note : null,
        face_image: att ? att.face_image : null,
      };
    });

    res.json({
      date: targetDate,
      session,
      total: students.length,
      present,
      absent,
      late,
      excused,
      students: studentList,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Lỗi tải dashboard' });
  }
};

// Điểm danh thủ công
exports.manualAttendance = async (req, res) => {
  try {
    const { student_id, date, session, status, note } = req.body;

    const [record, created] = await AttendanceRecord.findOrCreate({
      where: { student_id, date, session },
      defaults: {
        status,
        is_manual: true,
        recorded_by: req.user.id,
        note,
        check_in_time: status === 'present' || status === 'late' ? new Date() : null,
      },
    });

    if (!created) {
      await record.update({
        status,
        is_manual: true,
        recorded_by: req.user.id,
        note,
      });
    }

    res.json({ record, message: 'Đã cập nhật điểm danh' });
  } catch (error) {
    console.error('Manual attendance error:', error);
    res.status(500).json({ error: 'Lỗi điểm danh' });
  }
};

// Lịch sử điểm danh theo học sinh
exports.getStudentAttendanceHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { start_date, end_date, session } = req.query;

    const where = { student_id };
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }
    if (session) where.session = session;

    const records = await AttendanceRecord.findAll({
      where,
      order: [['date', 'DESC']],
      include: [{ model: User, as: 'recorder', attributes: ['id', 'full_name'] }],
    });

    // Thống kê
    const stats = {
      total_days: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
      total_late_minutes: records.reduce((sum, r) => sum + (r.late_minutes || 0), 0),
    };

    res.json({ records, stats });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy lịch sử điểm danh' });
  }
};

// Báo cáo thống kê toàn trường
exports.getSchoolReport = async (req, res) => {
  try {
    const { start_date, end_date, grade, class_id } = req.query;

    const dateFilter = {};
    if (start_date && end_date) {
      dateFilter.date = { [Op.between]: [start_date, end_date] };
    }

    const studentWhere = { is_active: true };
    const classWhere = {};
    if (grade) classWhere.grade = grade;
    if (class_id) studentWhere.class_id = class_id;

    const students = await Student.findAll({
      where: studentWhere,
      include: [
        {
          model: Class,
          as: 'class',
          where: Object.keys(classWhere).length > 0 ? classWhere : undefined,
          attributes: ['id', 'name', 'grade'],
        },
        {
          model: AttendanceRecord,
          as: 'attendances',
          where: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          required: false,
        },
      ],
    });

    const report = students.map(s => {
      const atts = s.attendances || [];
      return {
        student_code: s.student_code,
        full_name: s.full_name,
        class_name: s.class ? s.class.name : '',
        grade: s.class ? s.class.grade : '',
        total_days: atts.length,
        present: atts.filter(a => a.status === 'present').length,
        absent: atts.filter(a => a.status === 'absent').length,
        late: atts.filter(a => a.status === 'late').length,
        excused: atts.filter(a => a.status === 'excused').length,
        total_late_minutes: atts.reduce((sum, a) => sum + (a.late_minutes || 0), 0),
      };
    });

    // Tổng hợp theo lớp
    const classSummary = {};
    report.forEach(r => {
      const key = r.class_name;
      if (!classSummary[key]) {
        classSummary[key] = { class_name: key, grade: r.grade, total_students: 0, total_present: 0, total_absent: 0, total_late: 0, total_excused: 0 };
      }
      classSummary[key].total_students++;
      classSummary[key].total_present += r.present;
      classSummary[key].total_absent += r.absent;
      classSummary[key].total_late += r.late;
      classSummary[key].total_excused += r.excused;
    });

    res.json({
      students: report,
      class_summary: Object.values(classSummary),
      total_students: report.length,
    });
  } catch (error) {
    console.error('School report error:', error);
    res.status(500).json({ error: 'Lỗi tạo báo cáo' });
  }
};

// Điểm danh cho phụ huynh xem
exports.getChildAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { period = 'week' } = req.query;

    // Kiểm tra quyền
    const student = await Student.findByPk(student_id);
    if (!student || student.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xem thông tin này' });
    }

    let startDate;
    const now = new Date();
    if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const records = await AttendanceRecord.findAll({
      where: {
        student_id,
        date: { [Op.gte]: startDate.toISOString().split('T')[0] },
      },
      order: [['date', 'DESC']],
    });

    const stats = {
      total_days: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
      total_late_minutes: records.reduce((sum, r) => sum + (r.late_minutes || 0), 0),
    };

    res.json({ records, stats, period });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy dữ liệu điểm danh' });
  }
};
