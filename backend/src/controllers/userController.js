const { User, Student, Class } = require('../models/associations');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = {};
    
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      users: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách người dùng' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Class, as: 'classes' },
        { model: Student, as: 'children' },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy thông tin người dùng' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, role } = req.body;

    const existing = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });

    if (existing) {
      return res.status(400).json({ error: 'Username hoặc email đã tồn tại' });
    }

    const user = await User.create({
      username, email, password, full_name, phone, role,
    });

    res.status(201).json({ user, message: 'Tạo người dùng thành công' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Lỗi tạo người dùng' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const { full_name, email, phone, role, is_active } = req.body;
    await user.update({ full_name, email, phone, role, is_active });

    res.json({ user, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật người dùng' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    await user.update({ is_active: false });
    res.json({ message: 'Đã vô hiệu hóa tài khoản' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa người dùng' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    user.password = '123456';
    await user.save();

    res.json({ message: 'Đã reset mật khẩu về 123456' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi reset mật khẩu' });
  }
};
