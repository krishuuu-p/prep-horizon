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

    const [canProceed, setCanProceed] = useState(false);

    useEffect(() => {
        // Fetch sections from backend
        console.log("Hi")
        const fetchSections = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-test-state/${userName}/${testId}`);
                const data = response.data;
                console.log("Fetched sections:", data.testState);
                console.log("Fetched timer:", data.remainingTime);
                const sections = data.testState;
                setSections(sections);
                setTimer(data.remainingTime);
                setLoading(false);

                const firstSubject = Object.keys(sections)[0];
                setCurrentSubject(firstSubject);

                const defaultIndexes = Object.keys(sections).reduce((acc, subject) => {
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
        console.log("Starting test");
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

    }, [tabSwitchCount,testStarted,testSubmitted]);
    useEffect(() => 
    { 
        const d = e=>e.preventDefault(); 
        document.addEventListener("contextmenu", d); 
        window.addEventListener("keydown", e=>e.ctrlKey&&e.preventDefault()); 
        return ()=>document.removeEventListener("contextmenu", d);
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
        // console.log(typeof(selectedAnswer));
        if (q.type === "single_correct") {
            q.useranswer = selectedAnswer;
        } else if (q.type === "multi_correct") {
            q.useranswer = [...selectedAnswer];
        } else if (q.type === "numerical") {
            q.useranswer = selectedAnswer ? selectedAnswer : null;
        }
        if(selectedAnswer){
            if(typeof(selectedAnswer)===String||Array.isArray(selectedAnswer)){
                if(selectedAnswer.length>0){
                    q.status="Answered";
                }
                else{
                    q.status="Visited but Not Answered";
                }
            }
            else{
                console.log("Yes");
                q.status="Answered";
            }
        }
        else{
            q.status="Visited but Not Answered";
        }
        // q.status = selectedAnswer && selectedAnswer.length > 0 ? "Answered" : "Visited but Not Answered";
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
            q.useranswer = selectedAnswer ? selectedAnswer : null;
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
            console.log("This is current subject", currentSubject);
            console.log("This is current question index", currentQuestionIndex);
            console.log("This is sections", sections);
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
    
    
    const toggleProceed=(e)=>{
        setCanProceed(e.target.checked);
    }

    if (loading) {
        return <div>Loading questions...</div>;
    }
    if (!testStarted || testSubmitted) {
        return (
            <div style={{ marginTop: 50, fontFamily:"Roboto"}}>
                {!testSubmitted ? (
                    <div style={{marginLeft: "10px"}}>
                    <div className="heading" style={{textAlign: 'center'}}>
                    <h2><b>Please read the instructions carefully.</b></h2>
                  </div>
                  
                  <div>
                    <h4>General Instructions:</h4>
                    <ol>
                      <li>Total duration of <b>{`${testName}`}</b> is {``}.</li>
                      <li>
                        The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.
                      </li>
                      <li>
                        The Questions Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                        <ol>
                          <li>
                            <button className="question-button" style={{ backgroundColor: 'white' }}></button>
                            You have not visited the question yet.
                          </li>
                          <li>
                            <button className="question-button" style={{ backgroundColor: 'red' }}></button>
                            You have not answered the question.
                          </li>
                          <li>
                            <button className="question-button" style={{ backgroundColor: 'lightgreen' }}></button>
                            You have answered the question.
                          </li>
                          <li>
                            <button className="question-button" style={{ backgroundColor: 'purple' }}></button>
                            You have marked the question for Review.
                          </li>
                        </ol>
                      </li>
                    </ol>
                  
                    <h4>Navigating a Question:</h4>
                    <ol start={4}>
                      <li>
                        To answer a question, do the following:
                        <ol>
                          <li>
                            Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.
                          </li>
                          <li>
                            Click on <b>Save & Next</b> to save your answer for the current question and then go to the next question.
                          </li>
                          <li>
                            Click on <b>Mark for Review & Next</b> to save your answer for the current question, mark it for review, and then go to the next question.
                          </li>
                        </ol>
                      </li>
                    </ol>
                  
                    <h4>Answering a Question:</h4>
                    <ol start={5}>
                      <li>
                        Procedure for answering a multiple choice type question:
                        <ol>
                          <li>To select your answer, click on the button of one of the options.</li>
                          <li>To deselect your chosen answer, click on the Clear Response button.</li>
                          <li>To change your chosen answer, click on the button of another option.</li>
                          <li>To save your answer, you MUST click on the Save & Next button.</li>
                          <li>To mark the question for review, click on the Mark for Review & Next button.</li>
                        </ol>
                      </li>
                      <li>
                        To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.
                      </li>
                    </ol>
                  
                    <h4>Navigating through sections:</h4>
                    <ol start={7}>
                      <li>
                        Sections in this question paper are displayed on the top bar of the screen. Questions in a section can be viewed by clicking on the section name. The section you are currently viewing is highlighted.
                      </li>
                      <li>
                        You can shuffle between sections and questions at any time during the examination as per your convenience only during the time stipulated.
                      </li>
                      <li>
                        Candidate can view the corresponding section summary as part of the legend that appears in every section above the question palette.
                      </li>
                    </ol>
                  </div>
                  
                  <div className="terms-container">
                    <input type="checkbox" id="accept" onClick={toggleProceed} />
                    <label htmlFor="accept">
                      I have read and understood the instructions. All computer hardware allotted to me are in proper working condition.
                      I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone,
                      bluetooth devices etc. / any prohibited material with me into the Examination Hall. I agree that in case of not
                      adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which
                      may include ban from future Tests / Examinations.
                    </label>
                    <br />
                  </div>
                  
                    
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                        <h2>📝 Start Test</h2>
                        <button
                        className="proceed-button"
                        id="proceed"
                        disabled={!canProceed}
                        onClick={startTest}
                        style={{marginBottom:'100px'}}
                        >
                        Proceed
                        </button>
                        {webcamAllowed === false && (
                        <p style={{ color: 'red', marginTop: '10px' }}>
                            Allow webcam
                        </p>
                        )}
                    </div>
                </>

                    </div>
                ) : (
                    <h2>✅ Test has been submitted</h2>
                )}
            </div>
        );
    }
    return (
        <div>
            <header className="prep-header">
            <div className="logo">
                <span className="logo-glow">Prep</span><span className="logo-text">Horizon</span>
            </div>
            </header>


            <div className="top-palette">
            <div className="candidate-info">
                <div className="avatar" />
                <div className="detailsCandidate">
                <p><strong>Candidate Name :</strong> {`${userName}`}</p>
                <p><strong>Exam Name :</strong> {`${testName}`}</p>
                <p><strong>Remaining Time :</strong> <span className="timer">{formatTime()}</span></p>
                </div>
            </div>

            <div className="language-select">
                <select>
                <option>English</option>
                <option>Hindi</option>
                </select>
            </div>
            </div>


            <div className="subject-palette">
                <ul className="subject-list">
                    {Object.keys(sections).map((subject) => (
                    <li key={subject}>
                        <button
                        onClick={() => setCurrentSubject(subject)}
                        className={`subject-button ${currentSubject === subject ? 'active' : ''}`}
                        >
                        {subject}
                        </button>
                    </li>
                    ))}
                </ul>
            </div>


            <div className="container">
                <div className="question-section">
                    <h3 className="question-heading">Question {currentQuestionIndex[currentSubject] + 1}</h3>
                    <p className="question-text">{sections[currentSubject][currentQuestionIndex[currentSubject]].question}</p>
                    {sections[currentSubject][currentQuestionIndex[currentSubject]].image&&
                    
                        <img src={`${process.env.REACT_APP_BACKEND_URL}/extracted_images/${sections[currentSubject][currentQuestionIndex[currentSubject]].image}`} alt="Question" width="500vw"/>
                    }



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
