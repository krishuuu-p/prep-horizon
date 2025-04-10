import React, { useState } from "react";
import "../styles/TestPage.css";
import Panel from "./Panel";
import "../styles/StudentHomePage.css";

const TestsPage = () => {
    const [activePage, setActivePage] = useState("Tests");
    const [activeTab, setActiveTab] = useState("Active Tests");
	// const [tests, setTests] = useState({ past: [], active: [], upcoming: [] });

	// Hardcoded test data
    const testData = {
        pasttests: [
            {
                name: "Math Test",
                id: "T001",
                startDate: "2025-03-01",
                startTime: "10:00 AM",
                endDate: "2025-03-01",
                endTime: "12:00 PM",
                details: "Final term exam for mathematics."
            },
            {
                name: "Physics Quiz",
                id: "T002",
                startDate: "2025-03-02",
                startTime: "02:00 PM",
                endDate: "2025-03-02",
                endTime: "03:00 PM",
                details: "Quiz on Newton's laws and kinematics."
            },
            {
                name: "History Exam",
                id: "T003",
                startDate: "2025-03-03",
                startTime: "09:00 AM",
                endDate: "2025-03-03",
                endTime: "11:00 AM",
                details: "Medieval history test."
            },
            {
                name: "Math Test",
                id: "T001",
                startDate: "2025-03-01",
                startTime: "10:00 AM",
                endDate: "2025-03-01",
                endTime: "12:00 PM",
                details: "Final term exam for mathematics."
            },
            {
                name: "Physics Quiz",
                id: "T002",
                startDate: "2025-03-02",
                startTime: "02:00 PM",
                endDate: "2025-03-02",
                endTime: "03:00 PM",
                details: "Quiz on Newton's laws and kinematics."
            },
            {
                name: "History Exam",
                id: "T003",
                startDate: "2025-03-03",
                startTime: "09:00 AM",
                endDate: "2025-03-03",
                endTime: "11:00 AM",
                details: "Medieval history test."
            },
            {
                name: "Math Test",
                id: "T001",
                startDate: "2025-03-01",
                startTime: "10:00 AM",
                endDate: "2025-03-01",
                endTime: "12:00 PM",
                details: "Final term exam for mathematics."
            },
            {
                name: "Physics Quiz",
                id: "T002",
                startDate: "2025-03-02",
                startTime: "02:00 PM",
                endDate: "2025-03-02",
                endTime: "03:00 PM",
                details: "Quiz on Newton's laws and kinematics."
            },
            {
                name: "History Exam",
                id: "T003",
                startDate: "2025-03-03",
                startTime: "09:00 AM",
                endDate: "2025-03-03",
                endTime: "11:00 AM",
                details: "Medieval history test."
            },
            {
                name: "Math Test",
                id: "T001",
                startDate: "2025-03-01",
                startTime: "10:00 AM",
                endDate: "2025-03-01",
                endTime: "12:00 PM",
                details: "Final term exam for mathematics."
            },
            {
                name: "Physics Quiz",
                id: "T002",
                startDate: "2025-03-02",
                startTime: "02:00 PM",
                endDate: "2025-03-02",
                endTime: "03:00 PM",
                details: "Quiz on Newton's laws and kinematics."
            },
            {
                name: "History Exam",
                id: "T003",
                startDate: "2025-03-03",
                startTime: "09:00 AM",
                endDate: "2025-03-03",
                endTime: "11:00 AM",
                details: "Medieval history test."
            },
            {
                name: "Math Test",
                id: "T001",
                startDate: "2025-03-01",
                startTime: "10:00 AM",
                endDate: "2025-03-01",
                endTime: "12:00 PM",
                details: "Final term exam for mathematics."
            },
            {
                name: "Physics Quiz",
                id: "T002",
                startDate: "2025-03-02",
                startTime: "02:00 PM",
                endDate: "2025-03-02",
                endTime: "03:00 PM",
                details: "Quiz on Newton's laws and kinematics."
            },
            {
                name: "History Exam",
                id: "T003",
                startDate: "2025-03-03",
                startTime: "09:00 AM",
                endDate: "2025-03-03",
                endTime: "11:00 AM",
                details: "Medieval history test."
            },
            {
                name: "Math Test",
                id: "T001",
                startDate: "2025-03-01",
                startTime: "10:00 AM",
                endDate: "2025-03-01",
                endTime: "12:00 PM",
                details: "Final term exam for mathematics."
            },
            {
                name: "Physics Quiz",
                id: "T002",
                startDate: "2025-03-02",
                startTime: "02:00 PM",
                endDate: "2025-03-02",
                endTime: "03:00 PM",
                details: "Quiz on Newton's laws and kinematics."
            },
            {
                name: "History Exam",
                id: "T003",
                startDate: "2025-03-03",
                startTime: "09:00 AM",
                endDate: "2025-03-03",
                endTime: "11:00 AM",
                details: "Medieval history test."
            },
            {
                name: "Math Test",
                id: "T001",
                startDate: "2025-03-01",
                startTime: "10:00 AM",
                endDate: "2025-03-01",
                endTime: "12:00 PM",
                details: "Final term exam for mathematics."
            },
            {
                name: "Physics Quiz",
                id: "T002",
                startDate: "2025-03-02",
                startTime: "02:00 PM",
                endDate: "2025-03-02",
                endTime: "03:00 PM",
                details: "Quiz on Newton's laws and kinematics."
            },
            {
                name: "History Exam",
                id: "T003",
                startDate: "2025-03-03",
                startTime: "09:00 AM",
                endDate: "2025-03-03",
                endTime: "11:00 AM",
                details: "Medieval history test."
            }
        ],
        activetests: [
            {
                name: "Chemistry Test",
                id: "T004",
                startDate: "2025-03-30",
                startTime: "10:00 AM",
                endDate: "2025-03-30",
                endTime: "12:00 PM",
                details: "Organic chemistry test."
            },
            {
                name: "Computer Science Quiz",
                id: "T005",
                startDate: "2025-03-30",
                startTime: "03:00 PM",
                endDate: "2025-03-30",
                endTime: "04:00 PM",
                details: "Data structures and algorithms quiz."
            },
            {
                name: "Economics Exam",
                id: "T006",
                startDate: "2025-03-30",
                startTime: "06:00 PM",
                endDate: "2025-03-30",
                endTime: "08:00 PM",
                details: "Macroeconomics final test."
            }
        ],
        upcomingtests: [
            {
                name: "Biology Test",
                id: "T007",
                startDate: "2025-04-05",
                startTime: "11:00 AM",
                endDate: "2025-04-05",
                endTime: "01:00 PM",
                details: "Cell biology and genetics test."
            },
            {
                name: "English Literature Exam",
                id: "T008",
                startDate: "2025-04-06",
                startTime: "09:00 AM",
                endDate: "2025-04-06",
                endTime: "11:00 AM",
                details: "Shakespeare and modern literature."
            },
            {
                name: "Statistics Quiz",
                id: "T009",
                startDate: "2025-04-07",
                startTime: "02:00 PM",
                endDate: "2025-04-07",
                endTime: "03:00 PM",
                details: "Probability and regression analysis."
            }
        ]
    };

	return (
        <div className="tests-page">
            <div className="panel"><Panel activePage={activePage} setActivePage={setActivePage} /></div>
            <div className="main-container">
                <div className="sidebar">
                    {["Past Tests", "Active Tests", "Upcoming Tests"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="test-display">
                    {testData[activeTab.toLowerCase().replace(" ", "")].map((test, index) => (
                        <div key={index} className="test-box">
                            <h3>{test.name}</h3>
                            <p><strong>Test ID:</strong> {test.id}</p>
                            <p><strong>Start:</strong> {test.startDate} {test.startTime}</p>
                            <p><strong>End:</strong> {test.endDate} {test.endTime}</p>
                            <p className="test-details"><strong>Details:</strong> {test.details}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default TestsPage;
