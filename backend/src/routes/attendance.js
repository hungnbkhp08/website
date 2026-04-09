const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

// Giáo viên
router.get('/dashboard', authorize('teacher', 'admin'), attendanceController.getClassDashboard);
router.post('/manual', authorize('teacher', 'admin'), attendanceController.manualAttendance);

// Thống kê
router.get('/student/:student_id', authorize('teacher', 'admin'), attendanceController.getStudentAttendanceHistory);
router.get('/report', authorize('admin'), attendanceController.getSchoolReport);

// Phụ huynh
router.get('/child/:student_id', authorize('parent'), attendanceController.getChildAttendance);

module.exports = router;
