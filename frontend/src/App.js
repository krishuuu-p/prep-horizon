import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ForgotPassword from './pages/ForgotPassword';
// import RegisterStudent from './pages/RegisterStudent';
// import RegisterTeacher from './pages/RegisterTeacher';
// import RegisterAdmin from './pages/RegisterAdmin';
import StudentPage from './components/StudentPage';
import TeacherPage from './components/TeacherPage';
import AdminPage from './components/AdminPage';
import TestPage from './components/pages/TestPage';
import PdfToQuizPage from './components/pages/PdfToQuizPage';
import ClassesPage from './components/pages/ClassesPage';
import StudentManagementPage from './components/pages/StudentManagementPage';
import TeacherManagementPage from './components/pages/TeacherManagementPage';
import TestManagementPage from './components/pages/TestManagementPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/register/teacher" element={<RegisterTeacher />} />
        <Route path="/register/admin" element={<RegisterAdmin />} /> */}
        <Route path="/student/:userId/home" element={<StudentPage />} />
        <Route path="/teacher/:userId/home" element={<TeacherPage />} />
        <Route path="/admin/:userId/home" element={<AdminPage />} />
        <Route path="/:userType/:userId/tests" element={<TestPage />} />
        <Route path="/:userType/:userId/pdf-to-quiz" element={<PdfToQuizPage />} />
        <Route path="/:userType/:userId/classes" element={<ClassesPage />} />
        <Route path="/:userType/:userId/student-management" element={<StudentManagementPage />} />
        <Route path="/:userType/:userId/teacher-management" element={<TeacherManagementPage />} />
        <Route path="/:userType/:userId/tests-management" element={<TestManagementPage />} />
      </Routes>
    </Router>
  );
}

export default App;
