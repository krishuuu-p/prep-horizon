import { useState } from "react";
import axios from "axios";
import AdminPanel from "./AdminPanel";
import { useUser } from "../../UserContext";
import "../styles/ManagementPage.css";

function TestManagementPage() {
    const [activePage, setActivePage] = useState("Tests Management");
    const [activeTab, setActiveTab] = useState("Add Tests");
    const [selectedFile, setSelectedFile] = useState(null);
    const { user } = useUser();
    const username = user.userName;

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("username", username);

        try {   
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/upload-test-data`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
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
                    {["Add Tests"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="user-content">
                    {activeTab === "Add Tests" && (
                        <>
                            <h2>Add Tests</h2>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={() => handleFileUpload("upload-test-data")}>Upload Excel</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TestManagementPage;
