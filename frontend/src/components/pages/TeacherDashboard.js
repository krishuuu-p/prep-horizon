import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../UserContext';
import { Users, Layers, CalendarClock, FileText } from 'lucide-react';
import { formatDateTime } from '../utils';
import '../styles/TeacherDashboard.css';

export default function TeacherDashboard() {
    const { user } = useUser();
    const [metrics, setMetrics] = useState({
        num_classes: 0,
        num_students: 0,
        num_upcoming_tests: 0,
        num_recent_tests: 0,
    });

    const [upcomingTests, setUpcomingTests] = useState([]);
    const [testPerformance, setTestPerformance] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const metricsRes = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/teacher/${user.userName}/metrics`
                );
                setMetrics(metricsRes.data);

                const testsRes = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/teacher/${user.userName}/upcoming-tests`
                );
                console.log("upcoming tests are", testsRes.data);
                setUpcomingTests(testsRes.data);

                const performanceRes = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/teacher/${user.userName}/test-performance`
                );
                console.log("test performance data", performanceRes.data);
                setTestPerformance(performanceRes.data);
            } catch (err) {
                console.error("Failed loading dashboard data", err);
            }
        })();
    }, [user]);

    return (
        <div className="teacher-page">
            <div className="teacher-content">
                <div className="teacher-greeting">
                    <h1>Welcome, {user.name}</h1>
                    <p className="teacher-caption">Here's an overview of your teaching activity this week.</p>
                    <hr className="teacher-separator" />
                </div>

                <div className="teacher-sections">
                    <div className="teacher-section">
                        <h2>Dashboard</h2>
                        <div className="teacher-test-list">
                            <div className="teacher-test-card overview-card">
                                <div className="teacher-overview-icon">
                                    <Layers /> <h3>Total Classes</h3>
                                </div>
                                <p>{metrics.num_classes}</p>
                            </div>
                            <div className="teacher-test-card overview-card">
                                <div className="teacher-overview-icon">
                                    <Users /> <h3>Total Students</h3>
                                </div>
                                <p>{metrics.num_students}</p>
                            </div>
                            <div className="teacher-test-card overview-card">
                                <div className="teacher-overview-icon">
                                    <CalendarClock /> <h3>Upcoming Tests</h3>
                                </div>
                                <p>{metrics.num_upcoming_tests}</p>
                            </div>
                            <div className="teacher-test-card overview-card">
                                <div className="teacher-overview-icon">
                                    <FileText /> <h3>Recent Tests</h3>
                                </div>
                                <p>{metrics.num_recent_tests}</p>
                            </div>
                        </div>
                    </div>

                    <div className="teacher-section">
                        <h2>Upcoming Tests</h2>
                        <div className="teacher-test-list">
                            {upcomingTests.length === 0 && (
                                <p className='teacher-caption'>No upcoming tests this week.</p>
                            )}
                            {upcomingTests.map((test, index) => {
                                const { date: startdate, time: starttime } = formatDateTime(test.start_time);
                                const { date: enddate, time: endtime } = formatDateTime(test.end_time);

                                return (
                                    <div className="teacher-test-card teacher-upcoming-test" key={index}>
                                        <h3>{test.test_name}</h3>
                                        <p><strong>Start:</strong> {startdate} at {starttime}</p>
                                        <p><strong>End:</strong> {enddate} at {endtime}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="teacher-section">
                        <h2>Recent Test Performances</h2>
                        <p className='teacher-caption'>You can view detailed analysis on the Analysis page.</p>
                        <div className="teacher-test-list">
                            {testPerformance.length === 0 ? (
                                <p>No performance data available.</p>
                            ) : (
                                testPerformance.map((test, idx) => (
                                    <div key={idx} className="teacher-test-card teacher-test-performance">
                                        <h3>{test.testName}</h3>
                                        <p><strong>Attempted by:</strong> {test.numStudents}</p>
                                        <p><strong>Average Score:</strong> {test.avgScore}</p>
                                        <p><strong>Top Scorer:</strong> {test.topScorer}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
