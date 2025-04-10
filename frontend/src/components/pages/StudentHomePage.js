import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Panel from './Panel';
import { useUser } from '../../UserContext';
import '../styles/StudentHomePage.css';

function StudentHomePage() {
    const { user } = useUser();
    const [activePage, setActivePage] = useState("Home");
    const [activeTests, setActiveTests] = useState([]);
    const [upcomingTests, setUpcomingTests] = useState([]);
    const [recentTests, setRecentTests] = useState([]);
    const navigate = useNavigate();

    const name = user.name;
    const userType = user.userType;
    const userName = user.userName;

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tests/${user.userName}`)
            .then(response => response.json())
            .then(data => {
                setActiveTests(data.activeTests);
                setUpcomingTests(data.upcomingTests);
                setRecentTests(data.recentTests);
            })
            .catch(error => console.error("Error fetching test data:", error));
    }, [user]);

    const handleStartTest = () => {
        navigate(`/${userType}/${userName}/start-test`);
    }
    

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
                            {activeTests.map((test, index) => {
                                const startdateObj = new Date(test.start_time);
                                const startdate = startdateObj.toISOString().split("T")[0];
                                const starttime = startdateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                                const enddateObj = new Date(test.end_time);
                                const enddate = enddateObj.toISOString().split("T")[0];
                                const endtime = enddateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                                return (
                                    <div className="test-card active-test" key={index}>
                                        <h3>{test.test_name}</h3>
                                        <p><strong>Start:</strong> {startdate} at {starttime}</p>
                                        <p><strong>End:</strong> {enddate} at {endtime}</p>
                                        <button className="start-btn" onClick={handleStartTest}>Start Test</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Tests Section */}
                    <div className="section">
                        <h2>Upcoming Tests</h2>
                        <div className="test-list">
                            {upcomingTests.length === 0 && (
                                <p className='caption'>No upcoming tests this week.</p>
                            )}
                            {upcomingTests.map((test, index) => {
                                const startdateObj = new Date(test.start_time);
                                const startdate = startdateObj.toISOString().split("T")[0];
                                const starttime = startdateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                                const enddateObj = new Date(test.end_time);
                                const enddate = enddateObj.toISOString().split("T")[0];
                                const endtime = enddateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                return (
                                    <div className="test-card upcoming-test" key={index}>
                                        <h3>{test.test_name}</h3>
                                        <p><strong>Start:</strong> {startdate} at {starttime}</p>
                                        <p><strong>End:</strong> {enddate} at {endtime}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Tests Section */}
                    <div className="section">
                        <h2>Recent Tests</h2>
                        <div className="test-list">
                            {recentTests.length === 0 && (
                                <p className='caption'>No tests given this week.</p>
                            )}
                            {recentTests.map((test, index) => { 
                                const startdateObj = new Date(test.start_time);
                                const startdate = startdateObj.toISOString().split("T")[0];
                                const starttime = startdateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                                const enddateObj = new Date(test.end_time);
                                const enddate = enddateObj.toISOString().split("T")[0];
                                const endtime = enddateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                return (
                                    <div className="test-card recent-test" key={index}>
                                        <h3>{test.test_name}</h3>
                                        <p><strong>Active:</strong> {startdate} at {starttime} - {enddate} at {endtime}</p>
                                        <button className="analysis-btn">View Analysis</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>                
            </div>
        </div>
    );
}

export default StudentHomePage;
