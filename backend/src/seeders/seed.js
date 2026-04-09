require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const sequelize = require('../models/index');
const { User, Student, Class, AttendanceRecord, TimeRule, Notification } = require('../models/associations');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database synced (tables recreated)');

    // Create admin
    const admin = await User.create({
      username: 'admin',
      email: 'admin@school.edu.vn',
      password: '123456',
      full_name: 'Quản trị viên',
      phone: '0901234567',
      role: 'admin',
    });
    console.log('✅ Admin created');

    // Create teachers
    const teachers = await User.bulkCreate([
      { username: 'gv_nguyen', email: 'nguyen@school.edu.vn', password: await bcrypt.hash('123456', 10), full_name: 'Nguyễn Thị Mai', phone: '0912345678', role: 'teacher' },
      { username: 'gv_tran', email: 'tran@school.edu.vn', password: await bcrypt.hash('123456', 10), full_name: 'Trần Văn Hùng', phone: '0923456789', role: 'teacher' },
      { username: 'gv_le', email: 'le@school.edu.vn', password: await bcrypt.hash('123456', 10), full_name: 'Lê Thị Hương', phone: '0934567890', role: 'teacher' },
    ]);
    console.log('✅ Teachers created');

    // Create parents
    const parents = await User.bulkCreate([
      { username: 'ph_hoang', email: 'hoang@gmail.com', password: await bcrypt.hash('123456', 10), full_name: 'Hoàng Văn Nam', phone: '0945678901', role: 'parent' },
      { username: 'ph_pham', email: 'pham@gmail.com', password: await bcrypt.hash('123456', 10), full_name: 'Phạm Thị Lan', phone: '0956789012', role: 'parent' },
      { username: 'ph_vu', email: 'vu@gmail.com', password: await bcrypt.hash('123456', 10), full_name: 'Vũ Đình Tùng', phone: '0967890123', role: 'parent' },
      { username: 'ph_do', email: 'do@gmail.com', password: await bcrypt.hash('123456', 10), full_name: 'Đỗ Thị Hạnh', phone: '0978901234', role: 'parent' },
      { username: 'ph_bui', email: 'bui@gmail.com', password: await bcrypt.hash('123456', 10), full_name: 'Bùi Văn Quang', phone: '0989012345', role: 'parent' },
    ]);
    console.log('✅ Parents created');

    // Create classes
    const classes = await Class.bulkCreate([
      { name: '10A1', grade: 10, academic_year: '2025-2026', teacher_id: teachers[0].id, room: 'P101' },
      { name: '10A2', grade: 10, academic_year: '2025-2026', teacher_id: teachers[1].id, room: 'P102' },
      { name: '11A1', grade: 11, academic_year: '2025-2026', teacher_id: teachers[2].id, room: 'P201' },
    ]);
    console.log('✅ Classes created');

    // Create students
    const studentNames = [
      'Nguyễn Minh Anh', 'Trần Đức Bình', 'Lê Hoàng Cường', 'Phạm Thị Dung', 'Hoàng Văn Đức',
      'Vũ Thị Em', 'Đỗ Quang Phúc', 'Bùi Thị Giang', 'Nguyễn Văn Hải', 'Trần Thị Hoa',
      'Lê Minh Khôi', 'Phạm Văn Long', 'Hoàng Thị Mai', 'Vũ Đình Nghĩa', 'Đỗ Thị Oanh',
    ];

    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
      const classIndex = i < 5 ? 0 : i < 10 ? 1 : 2;
      const parentIndex = i % parents.length;
      const student = await Student.create({
        student_code: `HS${String(i + 1).padStart(4, '0')}`,
        full_name: studentNames[i],
        date_of_birth: new Date(2008 + (classIndex > 1 ? -1 : 0), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: i % 2 === 0 ? 'male' : 'female',
        address: `${i + 1} Đường ABC, Quận ${i % 5 + 1}, TP.HCM`,
        class_id: classes[classIndex].id,
        parent_id: parents[parentIndex].id,
      });
      students.push(student);
    }
    console.log('✅ Students created');

    // Create attendance records for last 30 days
    const today = new Date();
    const statuses = ['present', 'present', 'present', 'present', 'late', 'absent', 'present', 'excused', 'present', 'present'];

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const dateStr = date.toISOString().split('T')[0];

      for (const student of students) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const lateMinutes = randomStatus === 'late' ? Math.floor(Math.random() * 30) + 5 : 0;

        const checkInHour = 7;
        const checkInMin = randomStatus === 'late' ? lateMinutes : Math.floor(Math.random() * 10);

        await AttendanceRecord.create({
          student_id: student.id,
          date: dateStr,
          check_in_time: randomStatus !== 'absent' ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), checkInHour, checkInMin) : null,
          status: randomStatus,
          late_minutes: lateMinutes,
          session: 'morning',
          is_manual: Math.random() > 0.9,
        });
      }
    }
    console.log('✅ Attendance records created');

    // Create time rules
    await TimeRule.bulkCreate([
      { name: 'Ca sáng', session: 'morning', start_time: '07:00', end_time: '11:30', late_threshold_minutes: 15, absent_threshold_minutes: 45, academic_year: '2025-2026', is_active: true },
      { name: 'Ca chiều', session: 'afternoon', start_time: '13:00', end_time: '17:00', late_threshold_minutes: 15, absent_threshold_minutes: 45, academic_year: '2025-2026', is_active: true },
    ]);
    console.log('✅ Time rules created');

    // Create sample notifications
    for (const parent of parents) {
      await Notification.create({
        user_id: parent.id,
        title: 'Chào mừng bạn đến với hệ thống',
        message: 'Hệ thống quản lý điểm danh trường học đã sẵn sàng. Bạn có thể theo dõi tình hình điểm danh của con em mình tại đây.',
        type: 'system',
        sent_by: admin.id,
      });
    }
    console.log('✅ Notifications created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('  Admin:    admin / 123456');
    console.log('  Teacher:  gv_nguyen / 123456');
    console.log('  Parent:   ph_hoang / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
