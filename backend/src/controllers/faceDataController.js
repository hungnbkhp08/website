const { FaceData, Student } = require('../models/associations');

exports.getFaceData = async (req, res) => {
  try {
    const { student_id, academic_year } = req.query;
    const where = {};
    if (student_id) where.student_id = student_id;
    if (academic_year) where.academic_year = academic_year;

    const faceData = await FaceData.findAll({
      where,
      include: [{ model: Student, as: 'student', attributes: ['id', 'full_name', 'student_code'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ faceData });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy dữ liệu khuôn mặt' });
  }
};

exports.uploadFaceData = async (req, res) => {
  try {
    const { student_id, academic_year, is_primary } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn ảnh' });
    }

    const faceData = await FaceData.create({
      student_id,
      image_url: `/uploads/faces/${req.file.filename}`,
      academic_year,
      is_primary: is_primary === 'true',
      uploaded_by: req.user.id,
    });

    res.status(201).json({ faceData, message: 'Tải ảnh khuôn mặt thành công' });
  } catch (error) {
    console.error('Upload face error:', error);
    res.status(500).json({ error: 'Lỗi tải ảnh khuôn mặt' });
  }
};

exports.deleteFaceData = async (req, res) => {
  try {
    const faceData = await FaceData.findByPk(req.params.id);
    if (!faceData) {
      return res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
    }

    await faceData.destroy();
    res.json({ message: 'Đã xóa ảnh khuôn mặt' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa ảnh' });
  }
};

exports.setPrimaryFace = async (req, res) => {
  try {
    const { id } = req.params;
    const faceData = await FaceData.findByPk(id);
    if (!faceData) {
      return res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
    }

    // Bỏ primary cũ
    await FaceData.update(
      { is_primary: false },
      { where: { student_id: faceData.student_id } }
    );

    // Đặt primary mới
    await faceData.update({ is_primary: true });
    res.json({ message: 'Đã đặt ảnh chính' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi đặt ảnh chính' });
  }
};
