import { useState, useEffect, useCallback } from "react";
import '../styles/ActiveTest.css';

const ActiveTestPage = () => {
    const [sections, setSections] = useState({
            Maths: [
              {
                type: "MCQ",
                question: "What is 2 + 2?",
                options: { A: "3", B: "4", C: "5", D: "6" },
                answer: "B",
                image: "q1.png",
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "Numerical",
                question: "Solve for x: 2x = 10",
                answer: "5",
                image: "q2.png",
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "MCQ",
                question: "What is the derivative of x²?",
                options: { A: "x", B: "2x", C: "x²", D: "2" },
                answer: "B",
                image: null,
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "Numerical",
                question: "If sin(θ) = 0.5, what is θ in degrees (0 < θ < 90)?",
                answer: "30",
                image: null,
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "Multiple Correct MCQ",
                question: "Which of the following are prime numbers?",
                options: { A: "2", B: "3", C: "4", D: "5" },
                answer: ["A", "B", "D"],
                image: null,
                useranswer: null,
                status: "Not Visited",
              },
            ],
          
            Physics: [
              {
                type: "MCQ",
                question: "What is the unit of force?",
                options: { A: "Newton", B: "Tesla", C: "Metre", D: "Watt" },
                answer: "A",
                image: null,
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "Numerical",
                question: "A car accelerates from 0 to 20 m/s in 5 seconds. What is its acceleration?",
                answer: "4",
                image: null,
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "MCQ",
                question: "What is the speed of light in vacuum?",
                options: {
                  A: "3×10^8 m/s",
                  B: "1.5×10^8 m/s",
                  C: "3×10^6 m/s",
                  D: "None of the above"
                },
                answer: "A",
                image: null,
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "Multiple Correct MCQ",
                question: "Which of the following are vector quantities?",
                options: {
                  A: "Velocity",
                  B: "Speed",
                  C: "Acceleration",
                  D: "Force"
                },
                answer: ["A", "C", "D"],
                image: null,
                useranswer: null,
                status: "Not Visited",
              }
            ],
          
            Chemistry: [
              {
                type: "Multiple Correct MCQ",
                question: "Which of the following are noble gases?",
                options: { A: "Xe", B: "Ne", C: "Ar", D: "Kr" },
                answer: ["A", "B", "C", "D"],
                image: null,
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "MCQ",
                question: "What is the atomic number of Carbon?",
                options: { A: "6", B: "12", C: "14", D: "8" },
                answer: "A",
                image: null,
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "Numerical",
                question: "How many moles are there in 18 grams of water (H₂O)? (Molar mass = 18 g/mol)",
                answer: "1",
                image: null,
                useranswer: null,
                status: "Not Visited",
              },
              {
                type: "Multiple Correct MCQ",
                question: "Which elements are diatomic in nature?",
                options: {
                  A: "Oxygen",
                  B: "Nitrogen",
                  C: "Chlorine",
                  D: "Helium"
                },
                answer: ["A", "B", "C"],
                image: null,
                useranswer: null,
                status: "Not Visited",
              }
            ],
          
    });

    const [currentSubject, setCurrentSubject] = useState("Maths");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState({
        Maths: 0,
        Physics: 0,
        Chemistry: 0,
    });
    const [timer, setTimer] = useState(600);
    const [selectedAnswer, setSelectedAnswer] = useState(null);


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

    
    const formatTime = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };
    
    const updateSingleQuestionStatus = (index) => {
        const updatedSections = { ...sections };
        const q = updatedSections[currentSubject][index];
        
        if (q.status === "Not Visited") q.status = "Visited but Not Answered";
        setSections(updatedSections);
    };
    const checkFirstQ=()=>{
        const q = sections[currentSubject][currentQuestionIndex[currentSubject]];
        if(q.status==="Not Visited"){
            const updatedSections = { ...sections };
            updatedSections[currentSubject][currentQuestionIndex[currentSubject]].status = "Visited but Not Answered";
            setSections(updatedSections);
        }

        setTimeout(() => {
            if (q.type === "MCQ") {
                if (q.useranswer) {
                    const selectedOption = document.querySelector(`input[name='answer'][value='${q.useranswer}']`);
                    if (selectedOption) selectedOption.checked = true;
                }
            } 
            else if (q.type === "Multiple Correct MCQ") {
                if (q.useranswer) {
                    q.useranswer.forEach((answer) => {
                        const checkbox = document.querySelector(`input[name='answer'][value='${answer}']`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            } 
            else if (q.type === "Numerical") {
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
            if (q.type === "MCQ") {
                if (q.useranswer) {
                    const selectedOption = document.querySelector(`input[name='answer'][value='${q.useranswer}']`);
                    if (selectedOption) selectedOption.checked = true;
                }
            } 
            else if (q.type === "Multiple Correct MCQ") {
                if (q.useranswer) {
                    q.useranswer.forEach((answer) => {
                        const checkbox = document.querySelector(`input[name='answer'][value='${answer}']`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            } 
            else if (q.type === "Numerical") {
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
        console.log("This is selected answer",selectedAnswer);
        if (q.type === "MCQ") {
            q.useranswer = selectedAnswer; 
        } else if (q.type === "Multiple Correct MCQ") {
            q.useranswer = [...selectedAnswer]; 
        } else if (q.type === "Numerical") {
            q.useranswer = selectedAnswer ? selectedAnswer.trim() : null; 
        }
    
        q.status = selectedAnswer && selectedAnswer.length > 0 ? "Answered" : "Visited but Not Answered";
        console.log("I am handle Save and Next.")
        console.log("This is useranswer",q.useranswer);
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
    
        if (q.type === "MCQ") {
            q.useranswer = null; 
            setSelectedAnswer(null);
        } else if (q.type === "Multiple Correct MCQ") {
            q.useranswer = []; 
            setSelectedAnswer([]);
        } else if (q.type === "Numerical") {
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
    if (q.type === "MCQ") {
        q.useranswer = selectedAnswer;
    } else if (q.type === "Multiple Correct MCQ") {
        q.useranswer = [...selectedAnswer];
    } else if (q.type === "Numerical") {
        q.useranswer = selectedAnswer ? selectedAnswer.trim() : null;
    }

    q.status = "Marked for Review";

    setSections(updatedSections);

    if (index + 1 < updatedSections[currentSubject].length) {
        loadQuestion(index + 1);
    }
};


useEffect(() => {
    const question = sections[currentSubject][currentQuestionIndex[currentSubject]];
    
    let savedAnswer;
    
    if (question.type === "MCQ") {
        savedAnswer = question.useranswer || null;
    } else if (question.type === "Multiple Correct MCQ") {
        savedAnswer = question.useranswer || [];
    } else if (question.type === "Numerical") {
        savedAnswer = question.useranswer || "";  
    }
    console.log("This is saved answer",savedAnswer);
    console.log("I am use effect.")
    setSelectedAnswer(savedAnswer);
}, [currentSubject, currentQuestionIndex, sections]);
    
    

    return (
        <div>
            <header style={{ textAlign: "center", padding: "10px", background: "white" }}>
                <strong>Time Remaining: </strong> <span style={{ color: "red" }}>{formatTime()}</span> |
                <strong> Student Name:</strong> ABCD | <strong>Test Name:</strong> WXYZ
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
                        {sections[currentSubject][currentQuestionIndex[currentSubject]].type === "MCQ" &&
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

                        {sections[currentSubject][currentQuestionIndex[currentSubject]].type === "Multiple Correct MCQ" &&
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
                                            console.log("This is updated selection",updatedSelection);
                                            setSelectedAnswer(updatedSelection);
                                        }}
                                    />
                                    {value}
                                </label>
                            ))}

                        {sections[currentSubject][currentQuestionIndex[currentSubject]].type === "Numerical" && (
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
                                        q.status === "Not Visited"&&index!==currentQuestionIndex[currentSubject]
                                            ? "white":
                                            q.status==="Not Visited"
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
        </div>
    );
};

export default ActiveTestPage;