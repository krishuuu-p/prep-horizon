import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Panel from './pages/Panel.js';
import './styles/StudentPage.css';

function StudentPage() {
    const [activePage, setActivePage] = useState("Home"); // Default active page
    const { userId } = useParams();

    return (
        <div className="student-page">
            <Panel activePage={activePage} setActivePage={setActivePage} />

            <div className="content">
                <h1>Hello, {userId}</h1>
            </div>
        </div>
    );
}

export default StudentPage;
