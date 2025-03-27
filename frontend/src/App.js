import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import StudentPage from './components/StudentPage';
import TeacherPage from './components/TeacherPage';
import AdminPage from './components/AdminPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/student/:userId/home" element={<StudentPage />} />
                <Route path="/teacher/:userId" element={<TeacherPage />} />
                <Route path="/admin/:userId" element={<AdminPage />} />
            </Routes>
        </Router>
    );
}

export default App;