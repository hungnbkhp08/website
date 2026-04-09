const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/my-children', authorize('parent'), studentController.getStudentsByParent);
router.get('/', authorize('admin', 'teacher'), studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', authorize('admin'), studentController.createStudent);
router.put('/:id', authorize('admin'), studentController.updateStudent);
router.delete('/:id', authorize('admin'), studentController.deleteStudent);

module.exports = router;
