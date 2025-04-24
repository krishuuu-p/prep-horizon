import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Panel from './StudentPanel';
import { useUser } from '../../UserContext';
import { formatDateTime } from '../utils';
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
        console.log(user);
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tests/${user.userName}`)
            .then(response => response.json())
            .then(data => {
                const currentDate = new Date();
                const weekFromNow = new Date();
                const weekBeforeNow = new Date();
                weekBeforeNow.setDate(currentDate.getDate() - 7);
                weekFromNow.setDate(currentDate.getDate() + 7);

                setActiveTests(data.activeTests);
                setUpcomingTests(
                    data.upcomingTests.filter(test => {
                        const testDate = new Date(test.start_time);
                        return testDate >= currentDate && testDate <= weekFromNow;
                    })
                );
                setRecentTests(
                    data.recentTests.filter(test => {
                        const testDate = new Date(test.start_time);
                        return testDate <= currentDate && testDate >= weekBeforeNow;
                    })
                );
            })
            .catch(error => console.error("Error fetching test data:", error));
    }, [user]);

    const handleStartTest = (testId,testName) => {
        testName = testName.replace(/\s+/g, '');
        navigate(`/${userType}/${userName}/start-test/${testName}/${testId}`);
    }
    
    const handleViewAnalysis = (testId, testName) => {
        testName = testName.replace(/\s+/g, '');
        navigate(`/${userType}/${userName}/analysis/${testName}/${testId}`, {
            state: { testId, testName }
        });
    };
    
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
                    <div className="section">
                        <h2>Active Tests</h2>
                        <div className="test-list">
                            {activeTests.length === 0 && (
                                <p className='caption'>No active tests at the moment.</p>
                            )}
                            {activeTests.map((test, index) => {
                                const {date: startdate, time: starttime} = formatDateTime(test.start_time);
                                const {date: enddate, time: endtime} = formatDateTime(test.end_time);

                                return (
                                    <div className="test-card active-test" key={index}>
                                        <h3>{test.test_name}</h3>
                                        <p><strong>Start:</strong> {startdate} at {starttime}</p>
                                        <p><strong>End:</strong> {enddate} at {endtime}</p>
                                        <button className="analysis-btn" onClick={() => handleViewAnalysis(test.id, test.test_name)}>
                                            View Analysis
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="section">
                        <h2>Upcoming Tests</h2>
                        <div className="test-list">
                            {upcomingTests.length === 0 && (
                                <p className='caption'>No upcoming tests this week.</p>
                            )}
                            {upcomingTests.map((test, index) => {
                                const {date: startdate, time: starttime} = formatDateTime(test.start_time);
                                const {date: enddate, time: endtime} = formatDateTime(test.end_time);

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

                    <div className="section">
                        <h2>Recent Tests</h2>
                        <div className="test-list">
                            {recentTests.length === 0 && (
                                <p className='caption'>No tests given this week.</p>
                            )}
                            {recentTests.map((test, index) => {
                                const {date: startdate, time: starttime} = formatDateTime(test.start_time);
                                const {date: enddate, time: endtime} = formatDateTime(test.end_time); 
                                
                                return (
                                    <div className="test-card recent-test" key={index}>
                                        <h3>{test.test_name}</h3>
                                        <p><strong>Active:</strong> {startdate} at {starttime} - {enddate} at {endtime}</p>
                                        <button className="analysis-btn" onClick={() => handleViewAnalysis(test.id, test.test_name)}>
                                            View Analysis
                                        </button>
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
