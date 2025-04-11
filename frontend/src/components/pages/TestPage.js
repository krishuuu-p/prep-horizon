import React, { useState, useEffect } from "react";
import { useUser } from '../../UserContext';
import { formatDateTime } from "../utils";
import "../styles/TestPage.css";
import Panel from "./Panel";
import "../styles/StudentHomePage.css";

const TestsPage = () => {
    const { user } = useUser();
    const [activePage, setActivePage] = useState("Tests");
    const [activeTab, setActiveTab] = useState("Active Tests");
    const [activeTests, setActiveTests] = useState([]);
    const [upcomingTests, setUpcomingTests] = useState([]);
    const [recentTests, setRecentTests] = useState([]);
	// const [tests, setTests] = useState({ past: [], active: [], upcoming: [] });

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

    const testData = {
        active_tests: activeTests,
        upcoming_tests: upcomingTests,
        recent_tests: recentTests,
    };

	return (
        <div className="tests-page">
            <div className="panel"><Panel activePage={activePage} setActivePage={setActivePage} /></div>
            <div className="main-container">
                <div className="sidebar">
                    {["Active Tests", "Upcoming Tests", "Recent Tests"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="test-display">
                    {testData[activeTab.toLowerCase().replace(" ", "_")].map((test, index) => {
                        const { date: startDate, time: startTime } = formatDateTime(test.start_time);
                        const { date: endDate, time: endTime } = formatDateTime(test.end_time);
                        return (
                            <div key={index} className="test-box">
                                <h3>{test.name}</h3>
                                <p><strong>Test Name:</strong> {test.test_name}</p>
                                <p><strong>Start:</strong> {startDate} {startTime}</p>
                                <p><strong>End:</strong> {endDate} {endTime}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default TestsPage;
