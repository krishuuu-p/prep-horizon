import { useState } from 'react';
import Panel from './Panel';
import '../styles/StudentPage.css';

function TestsPage() {
    const [activePage, setActivePage] = useState("Tests");

    return (
        <div className="student-page">
            <Panel activePage={activePage} setActivePage={setActivePage} />

            <div className="content">
                <h1>Welcome to the Tests Page</h1>
            </div>
        </div>
    );
}

export default TestsPage;
