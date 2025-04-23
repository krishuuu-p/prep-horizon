import React from "react";
import { useParams} from "react-router-dom";
import { useUser } from '../../UserContext';

const AnalysisPage = () => {
    const { user } = useUser(); 
    const { userType, userName, testName, testId } = useParams();
    // get the state from navigation
    // Construct image URLs
    const pieImage  = `${process.env.REACT_APP_BACKEND_URL}/static/student_pie_${user.userName}_test_${testId}.png`;
    const mainImage = `${process.env.REACT_APP_BACKEND_URL}/static/student_${user.userName}_test_${testId}.png`;

    console.log(pieImage, mainImage);
    return (
        <div>
            <h2>Analysis for {testName}</h2>

            <div className="image-section">
                <h3>Score Distribution (Pie Chart)</h3>
                <img src={pieImage} alt="Pie Chart" style={{ width: "400px" }} />

                <h3>Performance Breakdown</h3>
                
                <img src={mainImage} alt="Performance Chart" style={{ width: "600px" }} />
            </div>
        </div>
    );
};

export default AnalysisPage;
