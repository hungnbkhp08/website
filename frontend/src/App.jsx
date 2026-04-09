import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import StudentManagement from './pages/admin/StudentManagement';
import ClassManagement from './pages/admin/ClassManagement';
import TimeRules from './pages/admin/TimeRules';
import FaceDataManagement from './pages/admin/FaceDataManagement';
import SchoolReport from './pages/admin/SchoolReport';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherLeaveRequests from './pages/teacher/LeaveRequests';
import TeacherNotifications from './pages/teacher/SendNotification';
import ParentDashboard from './pages/parent/Dashboard';
import ParentLeaveRequest from './pages/parent/LeaveRequest';
import ParentNotifications from './pages/parent/Notifications';
import AdminScores from './pages/admin/Scores';
import TeacherScores from './pages/teacher/Scores';
import ParentScores from './pages/parent/Scores';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p className="loading-text">Đang tải...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'admin': return <Navigate to="/admin" />;
    case 'teacher': return <Navigate to="/teacher" />;
    case 'parent': return <Navigate to="/parent" />;
    default: return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomeRedirect />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><UserManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><StudentManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><ClassManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/time-rules" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><TimeRules /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/face-data" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><FaceDataManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><SchoolReport /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/scores" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminScores /></Layout>
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute roles={['teacher']}>
              <Layout><TeacherDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/leaves" element={
            <ProtectedRoute roles={['teacher']}>
              <Layout><TeacherLeaveRequests /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/notifications" element={
            <ProtectedRoute roles={['teacher']}>
              <Layout><TeacherNotifications /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/scores" element={
            <ProtectedRoute roles={['teacher']}>
              <Layout><TeacherScores /></Layout>
            </ProtectedRoute>
          } />

          {/* Parent Routes */}
          <Route path="/parent" element={
            <ProtectedRoute roles={['parent']}>
              <Layout><ParentDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/parent/leave" element={
            <ProtectedRoute roles={['parent']}>
              <Layout><ParentLeaveRequest /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/parent/notifications" element={
            <ProtectedRoute roles={['parent']}>
              <Layout><ParentNotifications /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/parent/scores" element={
            <ProtectedRoute roles={['parent']}>
              <Layout><ParentScores /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
