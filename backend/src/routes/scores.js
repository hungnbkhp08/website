const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', scoreController.getAll);
router.post('/', authorize('admin', 'teacher'), scoreController.create);
router.put('/:id', authorize('admin', 'teacher'), scoreController.update);
router.delete('/:id', authorize('admin', 'teacher'), scoreController.delete);

module.exports = router;
