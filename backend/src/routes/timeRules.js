const express = require('express');
const router = express.Router();
const timeRuleController = require('../controllers/timeRuleController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.use(authorize('admin'));

router.get('/', timeRuleController.getAllTimeRules);
router.post('/', timeRuleController.createTimeRule);
router.put('/:id', timeRuleController.updateTimeRule);
router.delete('/:id', timeRuleController.deleteTimeRule);

module.exports = router;
