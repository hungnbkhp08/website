const User = require('./User');
const Student = require('./Student');
const Class = require('./Class');
const AttendanceRecord = require('./AttendanceRecord');
const LeaveRequest = require('./LeaveRequest');
const Notification = require('./Notification');
const TimeRule = require('./TimeRule');
const FaceData = require('./FaceData');
const ExamScore = require('./ExamScore');

// User - Class (Giáo viên chủ nhiệm)
User.hasMany(Class, { foreignKey: 'teacher_id', as: 'classes' });
Class.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

// Class - Student
Class.hasMany(Student, { foreignKey: 'class_id', as: 'students' });
Student.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

// User (Parent) - Student
User.hasMany(Student, { foreignKey: 'parent_id', as: 'children' });
Student.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });

// Student - AttendanceRecord
Student.hasMany(AttendanceRecord, { foreignKey: 'student_id', as: 'attendances' });
AttendanceRecord.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
AttendanceRecord.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

// Student - LeaveRequest
Student.hasMany(LeaveRequest, { foreignKey: 'student_id', as: 'leaveRequests' });
LeaveRequest.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
LeaveRequest.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });
LeaveRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

// User - Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'sent_by', as: 'sender' });

// Student - FaceData
Student.hasMany(FaceData, { foreignKey: 'student_id', as: 'faceData' });
FaceData.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
FaceData.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Exam Scores
Student.hasMany(ExamScore, { foreignKey: 'student_id', as: 'scores' });
ExamScore.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

module.exports = {
  User,
  Student,
  Class,
  AttendanceRecord,
  LeaveRequest,
  Notification,
  TimeRule,
  FaceData,
  ExamScore,
};
