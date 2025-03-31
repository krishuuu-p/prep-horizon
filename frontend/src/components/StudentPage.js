import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Panel from './pages/Panel';
import './styles/StudentPage.css';

function StudentPage() {
    const [activePage, setActivePage] = useState("Home");
    const [activeTests, setActiveTests] = useState([]);
    const [upcomingTests, setUpcomingTests] = useState([]);
    const [recentTests, setRecentTests] = useState([]);

    const location = useLocation();
    const name = location.state?.name || "Guest";

    useEffect(() => {
        fetch("http://localhost:5000/api/tests")
            .then(response => response.json())
            .then(data => {
                setActiveTests(data.activeTests);
                setUpcomingTests(data.upcomingTests);
                setRecentTests(data.recentTests);
            })
            .catch(error => console.error("Error fetching test data:", error));
    }, []);
    

    return (
        <div className="student-page">
            <Panel activePage={activePage} setActivePage={setActivePage} />

            <div className="content">
                <div className="user-greeting">
                    <h1>Hello, {name}</h1>
                    <p className="caption">Here's a summary of your test activity this week.</p>
                    <hr className="separator" />
                </div>

                <div className="test-sections">
                    {/* Active Tests Section */}
                    <div className="section">
                        <h2>Active Tests</h2>
                        <div className="test-list">
                            {activeTests.length === 0 && (
                                <p className='caption'>No active tests at the moment.</p>
                            )}
                            {activeTests.map((test, index) => (
                                <div className="test-card active-test" key={index}>
                                    <h3>{test["Test Title"]}</h3>
                                    <p><strong>Start:</strong> {test["Start Date"]} at {test["Start Time"]}</p>
                                    <p><strong>End:</strong> {test["End Date"]} at {test["End Time"]}</p>
                                    <button className="start-btn">Start Test</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Tests Section */}
                    <div className="section">
                        <h2>Upcoming Tests</h2>
                        <div className="test-list">
                            {upcomingTests.length === 0 && (
                                <p className='caption'>No upcoming tests this week.</p>
                            )}
                            {upcomingTests.map((test, index) => (
                                <div className="test-card upcoming-test" key={index}>
                                    <h3>{test["Test Title"]}</h3>
                                    <p><strong>Start:</strong> {test["Start Date"]} at {test["Start Time"]}</p>
                                    <p><strong>End:</strong> {test["End Date"]} at {test["End Time"]}</p>
                                    <p><strong>Mode:</strong> {test["Mode"]}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Tests Section */}
                    <div className="section">
                        <h2>Recent Tests</h2>
                        <div className="test-list">
                            {recentTests.length === 0 && (
                                <p className='caption'>No tests given this week.</p>
                            )}
                            {recentTests.map((test, index) => (
                                <div className="test-card recent-test" key={index}>
                                    <h3>{test["Test Title"]}</h3>
                                    <p><strong>Active:</strong> {test["Start Date"]} at {test["Start Time"]} - {test["End Date"]} at {test["End Time"]}</p>
                                    <button className="analysis-btn">View Analysis</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>                
            </div>
        </div>
    );
}

export default StudentPage;
