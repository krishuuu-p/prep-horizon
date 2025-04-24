import React, { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import { useUser } from '../../UserContext';

const AnalysisPage = () => {
    const { user } = useUser(); 
    const { userType, userName, testName, testId } = useParams();
    const [subjects, setSubjects] = useState([]);
    // get the state from navigation
    // Construct image URLs
    const pieImage  = `${process.env.REACT_APP_BACKEND_URL}/static/student_pie_${user.userName}_test_${testId}.png`;
    const mainImage = `${process.env.REACT_APP_BACKEND_URL}/static/student_${user.userName}_test_${testId}.png`;
    const summaryImage = `${process.env.REACT_APP_BACKEND_URL}/static/${testId}summary.png`;
    
    // console.log(pieImage, mainImage);
    useEffect(() => {
        if (user.userType === "teacher") {
            fetch(`${process.env.REACT_APP_FLASK_URL}/api/subjects/${testId}`)
                .then(res => res.json())
                .then(data => {
                    console.log("Fetched subjects:", data);  // <-- this will print the subjects to the browser console
                    setSubjects(data);
                })
                .catch(err => console.error("Failed to fetch subjects:", err));
        }
    }, [user, testId])
    return (
        <div>
            {user.userType === "student" && (
                <div className="image-section">
                    <h3>Score Distribution (Pie Chart)</h3>

                    <img src={pieImage} alt="Pie Chart" style={{ width: "400px" }} />

                    <h3>Performance Breakdown</h3>

                    <img src={mainImage} alt="Performance Chart" style={{ width: "600px" }} />
                </div>
            )}
            {user.userType === "teacher" && (
                <div className="teacher-analysis">
                    <h3>Test Summary (Max / Mean / Median)</h3>
                    <img src={summaryImage} alt="Test Summary" style={{ width: "100%", maxWidth: "800px" }} />

                    <h3 style={{ marginTop: "30px" }}>Histograms by Subject</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                        {subjects.map((subj) => {
                            const url = `${process.env.REACT_APP_BACKEND_URL}/static/hist_${testId}_${subj.replace(/\s+/g, '_')}.png`;
                            console.log(url)
                            return (
                                <div key={subj}>
                                    <h4>{subj}</h4>
                                    <img src={url} alt={`Histogram of ${subj}`} style={{ width: "350px" }} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisPage;
