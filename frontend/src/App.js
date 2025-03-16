import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import StudentPage from './components/StudentPage';
import TeacherPage from './components/TeacherPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/student" element={<StudentPage />} />
                <Route path="/teacher" element={<TeacherPage />} />
            </Routes>
        </Router>
    );
}

export default App;