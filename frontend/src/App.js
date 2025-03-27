import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ForgotPassword from './pages/ForgotPassword';
import RegisterStudent from './pages/RegisterStudent';
import RegisterTeacher from './pages/RegisterTeacher';
import RegisterAdmin from './pages/RegisterAdmin';
import StudentPage from './components/StudentPage';
import TeacherPage from './components/TeacherPage';
import AdminPage from './components/AdminPage';
import TestPage from './components/pages/TestPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/register/teacher" element={<RegisterTeacher />} />
        <Route path="/register/admin" element={<RegisterAdmin />} />
        <Route path="/:userType/:userId/home" element={<StudentPage />} />
        <Route path="/:userType/:userId/tests" element={<TestPage />} />
        <Route path="/:userType/:userId" element={<TeacherPage />} />
        <Route path="/:userType/:userId" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
