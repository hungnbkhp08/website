const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth);

// Phụ huynh
router.post('/', authorize('parent'), (req, res, next) => {
  req.uploadSubDir = 'leave';
  next();
}, upload.single('attachment'), leaveController.createLeaveRequest);
router.get('/my-requests', authorize('parent'), leaveController.getParentLeaveRequests);

// Giáo viên
router.get('/', authorize('teacher', 'admin'), leaveController.getLeaveRequests);
router.put('/:id/review', authorize('teacher', 'admin'), leaveController.reviewLeaveRequest);

module.exports = router;
