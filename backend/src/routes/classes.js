const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/my-classes', authorize('teacher'), classController.getTeacherClasses);
router.get('/', classController.getAllClasses);
router.get('/:id', classController.getClassById);
router.post('/', authorize('admin'), classController.createClass);
router.put('/:id', authorize('admin'), classController.updateClass);
router.delete('/:id', authorize('admin'), classController.deleteClass);

module.exports = router;
