import { useState } from 'react';
import Panel from './pages/Panel.js';
import './styles/StudentPage.css';

function StudentPage() {
    const [activePage, setActivePage] = useState("Home"); // Default active page

    return (
        <div className="student-page">
            <Panel activePage={activePage} setActivePage={setActivePage} />

            <div className="content">
                <h1>Welcome to Your {activePage} Page</h1>
            </div>
        </div>
    );
}

export default StudentPage;
