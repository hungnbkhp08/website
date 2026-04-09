const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.post('/send', authorize('teacher', 'admin'), notificationController.sendNotification);
router.post('/send-class', authorize('teacher', 'admin'), notificationController.sendClassNotification);

module.exports = router;
