const { TimeRule } = require('../models/associations');

exports.getAllTimeRules = async (req, res) => {
  try {
    const { academic_year } = req.query;
    const where = {};
    if (academic_year) where.academic_year = academic_year;

    const rules = await TimeRule.findAll({
      where,
      order: [['session', 'ASC']],
    });

    res.json({ rules });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy quy tắc thời gian' });
  }
};

exports.createTimeRule = async (req, res) => {
  try {
    const rule = await TimeRule.create(req.body);
    res.status(201).json({ rule, message: 'Tạo quy tắc thời gian thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tạo quy tắc' });
  }
};

exports.updateTimeRule = async (req, res) => {
  try {
    const rule = await TimeRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Không tìm thấy quy tắc' });
    }

    await rule.update(req.body);
    res.json({ rule, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật quy tắc' });
  }
};

exports.deleteTimeRule = async (req, res) => {
  try {
    const rule = await TimeRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Không tìm thấy quy tắc' });
    }

    await rule.destroy();
    res.json({ message: 'Đã xóa quy tắc' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa quy tắc' });
  }
};
