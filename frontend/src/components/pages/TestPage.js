import React, { useState, useEffect } from "react";
import { useUser } from '../../UserContext';
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../utils";
import "../styles/TestPage.css";
import Panel from "./Panel";

const TestsPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("Tests");
    const [activeTab, setActiveTab] = useState("Active Tests");
    const [activeTests, setActiveTests] = useState([]);
    const [upcomingTests, setUpcomingTests] = useState([]);
    const [recentTests, setRecentTests] = useState([]);

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

    const handleStartTest = (testId, testName) => {
        testName = testName.replace(/\s+/g, '');
        navigate(`/${user.userType}/${user.userName}/start-test/${testName}/${testId}`);
    };

    const handleViewAnalysis = (testId, testName) => {
        testName = testName.replace(/\s+/g, '');
        navigate(`/${user.userType}/${user.userName}/analysis/${testName}/${testId}`);
    };

    return (
        <div className="tests-page">
            <div className="panel"><Panel activePage={activePage} setActivePage={setActivePage} /></div>
            <div className="main-container">
                <div className="test-page-sidebar">
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

                        // Choose color class based on active tab
                        let testBoxClass = "test-box";
                        if (activeTab === "Active Tests") testBoxClass += " active-test";
                        else if (activeTab === "Upcoming Tests") testBoxClass += " upcoming-test";
                        else if (activeTab === "Recent Tests") testBoxClass += " recent-test";

                        return (
                            <div key={index} className={testBoxClass}>
                                <h3>{test.name}</h3>
                                <p><strong>Test Name:</strong> {test.test_name}</p>
                                <p><strong>Start:</strong> {startDate} {startTime}</p>
                                <p><strong>End:</strong> {endDate} {endTime}</p>

                                {activeTab === "Active Tests" && (
                                    <button className="start-btn" onClick={() => handleStartTest(test.id, test.test_name)}>
                                        Start Test
                                    </button>
                                )}

                                {activeTab === "Recent Tests" && (
                                    <button className="analysis-btn" onClick={() => handleViewAnalysis(test.id, test.test_name)}>
                                        View Analysis
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TestsPage;
