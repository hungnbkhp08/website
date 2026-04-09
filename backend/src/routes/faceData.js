const express = require('express');
const router = express.Router();
const faceDataController = require('../controllers/faceDataController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth);
router.use(authorize('admin'));

router.get('/', faceDataController.getFaceData);
router.post('/', (req, res, next) => {
  req.uploadSubDir = 'faces';
  next();
}, upload.single('image'), faceDataController.uploadFaceData);
router.delete('/:id', faceDataController.deleteFaceData);
router.put('/:id/primary', faceDataController.setPrimaryFace);

module.exports = router;
