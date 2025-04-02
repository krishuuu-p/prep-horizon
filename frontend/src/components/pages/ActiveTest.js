import { useState, useEffect } from "react";

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
        ],
        Physics: [
            {
                type: "MCQ",
                question: "What is the unit of force?",
                options: { A: "Newton", B: "Tesla", C: "Metre", D: "Watt" },
                answer: "B",
                image: null,
                useranswer: null,
                status: "Not Visited",
            },
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
        ],
    });

    const [currentSubject, setCurrentSubject] = useState("Maths");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState({
        Maths: 0,
        Physics: 0,
        Chemistry: 0,
    });
    const [timer, setTimer] = useState(600); // Example: 10 minutes in seconds

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

    const loadQuestion = (index) => {
        updateSingleQuestionStatus(index);
        setCurrentQuestionIndex((prev) => ({ ...prev, [currentSubject]: index }));
    };

    const handleSaveNext = () => {
        const index = currentQuestionIndex[currentSubject];
        const updatedSections = { ...sections };
        const q = updatedSections[currentSubject][index];

        q.useranswer = document.querySelector("input[name='answer']:checked")?.value || null;
        q.status = q.useranswer ? "Answered" : "Visited but Not Answered";

        setSections(updatedSections);
        if (index + 1 < updatedSections[currentSubject].length) loadQuestion(index + 1);
    };

    const handleClearResponse = () => {
        const index = currentQuestionIndex[currentSubject];
        const updatedSections = { ...sections };
        const q = updatedSections[currentSubject][index];

        q.useranswer = null;
        q.status = "Visited but Not Answered";

        setSections(updatedSections);
        document.querySelectorAll("input[name='answer']").forEach((input) => (input.checked = false));
    };

    const handleMarkReview = () => {
        const index = currentQuestionIndex[currentSubject];
        const updatedSections = { ...sections };
        const q = updatedSections[currentSubject][index];

        q.useranswer = document.querySelector("input[name='answer']:checked")?.value || null;
        q.status = "Marked for Review";

        setSections(updatedSections);
        if (index + 1 < updatedSections[currentSubject].length) loadQuestion(index + 1);
    };

    return (
        <div>
            <header style={{ textAlign: "center", padding: "10px", background: "white" }}>
                <strong>Time Remaining: </strong> <span style={{ color: "red" }}>{formatTime()}</span> |
                <strong> Student Name:</strong> ABCD | <strong>Test Name:</strong> WXYZ
            </header>

            <div className="Subject pallete">
                <li className="Subject">
                    {Object.keys(sections).map((subject) => (
                        <button key={subject} className="subj" onClick={() => setCurrentSubject(subject)}>
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
                            Object.entries(sections[currentSubject][currentQuestionIndex[currentSubject]].options).map(
                                ([key, value]) => (
                                    <label key={key}>
                                        <input type="radio" name="answer" value={key} />
                                        {value}
                                    </label>
                                )
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
                                onClick={() => loadQuestion(index)}
                                style={{
                                    backgroundColor:
                                        q.status === "Not Visited"
                                            ? "white"
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