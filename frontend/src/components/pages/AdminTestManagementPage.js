import { useState, useEffect } from "react";
import axios from "axios";
import AdminPanel from "./AdminPanel";
import { useUser } from "../../UserContext";
import { formatDateTime } from "../utils";
import "../styles/ManagementPage.css";

function TestManagementPage() {
    const [activePage, setActivePage] = useState("Tests Management");
    const [activeTab, setActiveTab] = useState("Add Tests");
    const [selectedFile, setSelectedFile] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState("");
    const { user } = useUser();
    const username = user.userName;

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-classes`);
                setClasses(res.data.classes);
            } catch (error) {
                console.error("Failed to fetch classes:", error);
            }
        };

        fetchClasses();
    }, []);

    const handleClassSelect = async (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        setSelectedTest("");

        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-upcoming-tests/${classId}`);
            setTests(res.data.tests);
        } catch (error) {
            console.error("Failed to fetch tests:", error);
        }
    };

    const handleTestSelect = (e) => {
        setSelectedTest(e.target.value);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = async (endpoint) => {
        if (!selectedFile) {
            alert("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("username", username);

        if (endpoint === "upload-questions") {
            if (!selectedClass || !selectedTest) {
                alert("Please select class and test.");
                return;
            }
            formData.append("classId", selectedClass);
            formData.append("testId", selectedTest);
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/${endpoint}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.message || "Error uploading file");
        }
    };

    return (
        <div className="user-management">
            <AdminPanel activePage={activePage} setActivePage={setActivePage} />
            <div className="main-container">
                <div className="admin-sidebar">
                    {["Add Tests", "Add Questions"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="user-content">
                    {activeTab === "Add Tests" && (
                        <>
                            <h2 className="user-h2">Add Tests</h2>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={() => handleFileUpload("upload-test-data")}>Upload Excel</button>
                        </>
                    )}
                    {activeTab === "Add Questions" && (
                        <>
                            <h2 className="user-h2">Add Questions</h2>
                            <label className="dropdown-label">Choose Class:</label>
                            <select className="dropdown-select" value={selectedClass} onChange={handleClassSelect}>
                                <option value="">-- Select Class --</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.class_code} - {cls.class_name} - {cls.description}
                                    </option>
                                ))}
                            </select>

                            {selectedClass && (
                                <>
                                    <label className="dropdown-label">Choose Test:</label>
                                    <select className="dropdown-select" value={selectedTest} onChange={handleTestSelect}>
                                        <option value="">-- Select Test --</option>
                                        {tests.map((test) => {
                                            const { date: startdate, time: starttime } = formatDateTime(test.start_time);
                                            const { date: enddate, time: endtime } = formatDateTime(test.end_time);
                                            return (
                                                <option key={test.id} value={test.id}>
                                                    {test.test_name} - Scheduled for {startdate} {starttime} to {enddate} {endtime}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </>
                            )}

                            {selectedTest && (
                                <>
                                    <label className="dropdown-label">Upload Questions Document:</label>
                                    <input type="file" accept=".doc,.docx" onChange={handleFileChange} />
                                    <button onClick={() => handleFileUpload("upload-questions")}>Upload Questions</button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TestManagementPage;
