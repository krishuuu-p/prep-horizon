import process from 'process';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/pages/LoginPage';
import ForgotPassword from './components/pages/ForgotPassword';
import StudentHomePage from './components/pages/StudentHomePage';
import TeacherHomePage from './components/pages/TeacherPage';
import AdminHomePage from './components/pages/AdminHomePage';
import TestPage from './components/pages/StudentTestPage';
import PdfToQuizPage from './components/pages/StudentPdfToQuizPage';
import ActiveTestPage from './components/pages/ActiveTest';
import ClassesPage from './components/pages/AdminClassesPage';
import StudentManagementPage from './components/pages/AdminStudentManagementPage';
import TeacherManagementPage from './components/pages/TeacherManagementPage';
import TestManagementPage from './components/pages/AdminTestManagementPage';
import InterviewPage from './components/pages/StudentInterviewPage';
import ProfilePage from './components/pages/StudentProfilePage';
import AnalysisPage from './components/pages/AnalysisPage';
window.process = process;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/student/:userName/home" element={<StudentHomePage />} />
        <Route path="/teacher/:userName/home" element={<TeacherHomePage />} />
        <Route path="/admin/:userName/home" element={<AdminHomePage />} />
        <Route path="/:userType/:userName/tests" element={<TestPage />} />
        <Route path="/:userType/:userName/interview-practice" element={<InterviewPage />} />
        <Route path="/:userType/:userName/profile" element={<ProfilePage />} />
        <Route path="/:userType/:userName/start-test/:testName/:testId" element={<ActiveTestPage />} />
        <Route path="/:userType/:userName/pdf-to-quiz" element={<PdfToQuizPage />} />
        <Route path="/:userType/:userName/classes" element={<ClassesPage />} />
        <Route path="/admin/:userName/student-management" element={<StudentManagementPage />} />
        <Route path="/admin/:userName/teacher-management" element={<TeacherManagementPage />} />
        <Route path="/admin/:userName/tests-management" element={<TestManagementPage />} />
        <Route path="/:userType/:userName/analysis/:testName/:testId" element={<AnalysisPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
