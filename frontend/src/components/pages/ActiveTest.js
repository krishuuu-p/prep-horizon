import { useState, useEffect, useCallback } from "react";
import { useParams } from 'react-router-dom';
import Webcam from "react-webcam";
import '../styles/ActiveTest.css';
import axios from "axios";

const ActiveTestPage = () => {
    const { userName, testName, testId } = useParams();
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState({});
    const [currentSubject, setCurrentSubject] = useState();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState({});
    const [timer, setTimer] = useState(600);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    // Proctoring state
    const [testStarted, setTestStarted] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [webcamAllowed, setWebcamAllowed] = useState(null);

    useEffect(() => {
        // Fetch sections from backend
        const fetchSections = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-test-state/${userName}/${testId}`);
                const data = response.data; // assuming response.data is the full sections object

                setSections(data);
                setLoading(false);

                const firstSubject = Object.keys(data)[0];
                setCurrentSubject(firstSubject);

                const defaultIndexes = Object.keys(data).reduce((acc, subject) => {
                    acc[subject] = 0;
                    return acc;
                }, {});
                setCurrentQuestionIndex(defaultIndexes);

                console.log("Fetched sections and initialized state.");
            } catch (error) {
                console.error("Error fetching sections:", error);
                setLoading(false);
            }
        };

        fetchSections();
    }, [testId, userName]);

    const postSectionsToBackend = async (studentName, testId, updatedSections) => {
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/save-test-state/${studentName}/${testId}`,
                { sections: updatedSections }
            );
            console.log("Sections saved successfully");
        } catch (error) {
            console.error("Error saving sections:", error);
        }
    };

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    alert("Time's up! Submitting the test.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, []);

    const requestWebcamAccess = async () => {
        try { await navigator.mediaDevices.getUserMedia({ video: true }); setWebcamAllowed(true); return true; }
        catch { setWebcamAllowed(false); return false; }
    };

    // Start test
    const startTest = async () => {
        if (!(await requestWebcamAccess())) { alert("Please allow webcam to proceed"); return; }
        document.documentElement.requestFullscreen();
        setTestStarted(true);
    };

    // Auto-submit
    const SubmitTest = () => {
        setTestSubmitted(true);
        setTestStarted(false);
        // To check if fullscreen exists and the document is active before exiting
        if (document.fullscreenElement && document.hasFocus()) {
            document.exitFullscreen().catch((err) => {
                console.warn("Failed to exit fullscreen:", err);
            });
        }
        alert("Test has been submitted due to multiple tab switches.");
    };

    // Proctoring effects
    useEffect(() => {
        if (!testStarted) return;
        const handleVis = () => {
            if (document.hidden && !testSubmitted) {
                setTabSwitchCount(c => c + 1);
                alert("⚠ Tab switching is not allowed");
            }
        };
        document.addEventListener("visibilitychange", handleVis);
        return () => document.removeEventListener("visibilitychange", handleVis);
    }, [testStarted, testSubmitted]);
    useEffect(() => {
        if (tabSwitchCount > 3 && testStarted && !testSubmitted) {
            SubmitTest();
        }

    }, [tabSwitchCount]);

    useEffect(() => {
        const d = e => e.preventDefault();
        document.addEventListener("contextmenu", d);
        window.addEventListener("keydown", e => e.ctrlKey && e.preventDefault());
        return () => document.removeEventListener("contextmenu", d);
    }, []);

    useEffect(() => {
        if (!testStarted) return;
        const checkFs = () => setIsFullscreen(!!(document.fullscreenElement));
        document.addEventListener("fullscreenchange", checkFs);
        checkFs();
        return () => document.removeEventListener("fullscreenchange", checkFs);
    }, [testStarted]);

    // Timer
    useEffect(() => {
        if (!testStarted || testSubmitted) return;
        const id = setInterval(() => {
            setTimer(t => {
                if (t <= 1) { clearInterval(id); alert("Time's up"); SubmitTest(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [testStarted, testSubmitted]);

    const formatTime = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const checkFirstQ = () => {
        const q = sections[currentSubject][currentQuestionIndex[currentSubject]];
        if (q.status === "Not Visited") {
            const updatedSections = { ...sections };
            updatedSections[currentSubject][currentQuestionIndex[currentSubject]].status = "Visited but Not Answered";
            setSections(updatedSections);
        }

        setTimeout(() => {
            if (q.type === "single_correct") {
                if (q.useranswer) {
                    const selectedOption = document.querySelector(`input[name='answer'][value='${q.useranswer}']`);
                    if (selectedOption) selectedOption.checked = true;
                }
            }
            else if (q.type === "multi_correct") {
                if (q.useranswer) {
                    q.useranswer.forEach((answer) => {
                        const checkbox = document.querySelector(`input[name='answer'][value='${answer}']`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            }
            else if (q.type === "numerical") {
                const numericalInput = document.querySelector("input[name='numerical-answer']");
                if (numericalInput && q.useranswer) {
                    numericalInput.value = q.useranswer;
                }
            }
        }, 0);
    }

    const loadQuestion = useCallback((index) => {
        const q = sections[currentSubject][index];
        setCurrentQuestionIndex((prev) => ({ ...prev, [currentSubject]: index }));

        if (q.status === "Not Visited") {
            const updatedSections = { ...sections };
            updatedSections[currentSubject][index].status = "Visited but Not Answered";
            setSections(updatedSections);
        }

        setTimeout(() => {
            if (q.type === "single_correct") {
                if (q.useranswer) {
                    const selectedOption = document.querySelector(`input[name='answer'][value='${q.useranswer}']`);
                    if (selectedOption) selectedOption.checked = true;
                }
            }
            else if (q.type === "multi_correct") {
                if (q.useranswer) {
                    q.useranswer.forEach((answer) => {
                        const checkbox = document.querySelector(`input[name='answer'][value='${answer}']`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            }
            else if (q.type === "numerical") {
                const numericalInput = document.querySelector("input[name='numerical-answer']");
                if (numericalInput && q.useranswer) {
                    numericalInput.value = q.useranswer;
                }
            }
        }, 0);
    }, [sections, currentSubject]);

    const handleSaveNext = () => {
        const index = currentQuestionIndex[currentSubject];
        const updatedSections = { ...sections };
        const q = updatedSections[currentSubject][index];
        console.log("This is selected answer", selectedAnswer);
        if (q.type === "single_correct") {
            q.useranswer = selectedAnswer;
        } else if (q.type === "multi_correct") {
            q.useranswer = [...selectedAnswer];
        } else if (q.type === "numerical") {
            q.useranswer = selectedAnswer ? selectedAnswer.trim() : null;
        }

        q.status = selectedAnswer && selectedAnswer.length > 0 ? "Answered" : "Visited but Not Answered";
        console.log("I am handle Save and Next.")
        console.log("This is useranswer", q.useranswer);
        postSectionsToBackend(userName, testId, updatedSections);
        setSections(updatedSections);
        if (index + 1 < updatedSections[currentSubject].length) {
            console.log("this");
            loadQuestion(index + 1);
        }
    };


    const handleClearResponse = () => {
        const index = currentQuestionIndex[currentSubject];
        const updatedSections = { ...sections };
        const q = updatedSections[currentSubject][index];

        if (q.type === "single_correct") {
            q.useranswer = null;
            setSelectedAnswer(null);
        } else if (q.type === "multi_correct") {
            q.useranswer = [];
            setSelectedAnswer([]);
        } else if (q.type === "numerical") {
            q.useranswer = "";
            setSelectedAnswer("");
        }

        q.status = "Visited but Not Answered";

        setSections(updatedSections);
        postSectionsToBackend(userName, testId, updatedSections);
    };


    const handleMarkReview = () => {
        const index = currentQuestionIndex[currentSubject];
        const updatedSections = { ...sections };
        const q = updatedSections[currentSubject][index];
        if (q.type === "single_correct") {
            q.useranswer = selectedAnswer;
        } else if (q.type === "multi_correct") {
            q.useranswer = [...selectedAnswer];
        } else if (q.type === "numerical") {
            q.useranswer = selectedAnswer ? selectedAnswer.trim() : null;
        }

        q.status = "Marked for Review";

        setSections(updatedSections);
        postSectionsToBackend(userName, testId, updatedSections);

        if (index + 1 < updatedSections[currentSubject].length) {
            loadQuestion(index + 1);
        }
    };


    useEffect(() => {
        try {
            const question = sections[currentSubject][currentQuestionIndex[currentSubject]];

            let savedAnswer;

            if (question.type === "single_correct") {
                savedAnswer = question.useranswer || null;
            } else if (question.type === "multi_correct") {
                savedAnswer = question.useranswer || [];
            } else if (question.type === "numerical") {
                savedAnswer = question.useranswer || "";
            }
            console.log("This is saved answer", savedAnswer);
            console.log("I am use effect.");
            setSelectedAnswer(savedAnswer);
        } catch (error) {
            console.error("Error in useEffect:", error);
        }
    }, [currentSubject, currentQuestionIndex, sections]);


    if (loading) {
        return <div>Loading questions...</div>;
    }
    if (!testStarted || testSubmitted) {
        return (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
                {!testSubmitted ? (
                    <><h2>📝 Start Test</h2>
                        <button onClick={startTest}>
                            Start
                        </button>
                        {webcamAllowed === false && <p style={{ color: 'red' }}>
                            Allow webcam</p>}
                    </>
                ) : (
                    <h2>✅ Test has been submitted</h2>
                )}
            </div>
        );
    }
    return (
        <div>
            <header style={{ textAlign: "center", padding: "10px", background: "white" }}>
                <strong>Time Remaining: </strong> <span style={{ color: "red" }}>{formatTime()}</span> |
                <strong> Student Name:</strong> {userName} | <strong>Test Name:</strong> {testName}
            </header>

            <div className="Subject pallete">
                <li className="Subject">
                    {Object.keys(sections).map((subject) => (
                        <button key={subject} className="subj"
                            onClick={() => {
                                setCurrentSubject(subject);
                            }
                            }
                        >
                            {subject}
                        </button>
                    ))}
                </li>
            </div>

            <div className="container">
                <div className="question-section">
                    <h3 className="question-heading">Question {currentQuestionIndex[currentSubject] + 1}</h3>
                    <p className="question-text">{sections[currentSubject][currentQuestionIndex[currentSubject]].question}</p>


                    <div className="options">
                        {sections[currentSubject][currentQuestionIndex[currentSubject]].type === "single_correct" &&
                            Object.entries(sections[currentSubject][currentQuestionIndex[currentSubject]].options).map(([key, value]) => (
                                <label key={key}>
                                    <input
                                        type="radio"
                                        name="answer"
                                        value={key}
                                        checked={selectedAnswer === key}
                                        onChange={(e) => setSelectedAnswer(e.target.value)}
                                    />
                                    {value}
                                </label>
                            ))}

                        {sections[currentSubject][currentQuestionIndex[currentSubject]].type === "multi_correct" &&
                            Object.entries(sections[currentSubject][currentQuestionIndex[currentSubject]].options).map(([key, value]) => (
                                <label key={key}>
                                    <input
                                        type="checkbox"
                                        name="answer"
                                        value={key}
                                        checked={Array.isArray(selectedAnswer) && selectedAnswer.includes(key)}
                                        onChange={(e) => {
                                            let updatedSelection = [...(selectedAnswer || [])];
                                            if (e.target.checked) {
                                                updatedSelection.push(key);
                                            } else {
                                                updatedSelection = updatedSelection.filter((ans) => ans !== key);
                                            }
                                            console.log("This is updated selection", updatedSelection);
                                            setSelectedAnswer(updatedSelection);
                                        }}
                                    />
                                    {value}
                                </label>
                            ))}

                        {sections[currentSubject][currentQuestionIndex[currentSubject]].type === "numerical" && (
                            <input
                                type="text"
                                name="numerical-answer"
                                placeholder="Enter your answer"
                                value={selectedAnswer || ""}
                                onChange={(e) => setSelectedAnswer(e.target.value.trim())}
                            />
                        )}
                    </div>


                    <div className="buttons">
                        <button className="save-next" onClick={handleSaveNext}>
                            Save & Next
                        </button>
                        <button className="mark-review" onClick={handleMarkReview}>
                            Mark for Review and Next
                        </button>
                        <button className="clear-response" onClick={handleClearResponse}>
                            Clear Response
                        </button>
                        <button className="submit">Submit</button>
                    </div>
                </div>

                <div className="sidebar">
                    <h4>Question Palette</h4>
                    <div className="question-palette">
                        {sections[currentSubject].map((q, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    checkFirstQ();
                                    loadQuestion(index);
                                }
                                }
                                style={{
                                    backgroundColor:
                                        q.status === "Not Visited" && index !== currentQuestionIndex[currentSubject]
                                            ? "white" :
                                            q.status === "Not Visited"
                                                ? "red"
                                                : q.status === "Visited but Not Answered"
                                                    ? "red"
                                                    : q.status === "Answered"
                                                        ? "lightgreen"
                                                        : "purple",
                                }}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: 20 }}>
                <Webcam width={300} height={200} />
            </div>
            {!isFullscreen && <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "black",
                    color: "white",
                    fontSize: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                    flexDirection: "column",
                }}
            >
                <p>⚠ Fullscreen mode is required for the test</p>
                <button
                    onClick={() => {
                        document.documentElement.requestFullscreen();
                    }}
                    style={{ padding: "10px 20px", marginTop: "20px", fontSize: "18px" }}
                >
                    Re-enter Fullscreen
                </button>
            </div>}
        </div>
    );
};

export default ActiveTestPage;
