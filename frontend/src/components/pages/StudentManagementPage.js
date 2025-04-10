import { useState } from "react";
import axios from "axios";
import AdminPanel from "./AdminPanel";
import "../styles/ManagementPage.css";

function StudentManagementPage() {
    const [activePage, setActivePage] = useState("Student Management");
    const [activeTab, setActiveTab] = useState("Add Students");
    const [formData, setFormData] = useState({ username: "", password: "", name: "", email: "" });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (endpoint) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/${endpoint}`, formData);
            alert(response.data.message);
        } catch (error) {
            alert("Error: " + (error.response?.data.message || error.message));
        }
    };

    const handleFileUpload = async (endpoint) => {
        if (!selectedFile) {
            alert("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

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
                <div className="sidebar">
                    {["Add Students", "Edit Students", "Delete Students"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="user-content">
                    {activeTab === "Add Students" && (
                        <>
                            <h2 className="user-h2">Add Students</h2>
                            <input type="text" name="username" placeholder="Username" onChange={handleInputChange} />
                            <input type="password" name="password" placeholder="Password" onChange={handleInputChange} />
                            <input type="text" name="name" placeholder="Name" onChange={handleInputChange} />
                            <input type="email" name="email" placeholder="Email" onChange={handleInputChange} />
                            <button onClick={() => handleSubmit("add-student")}>Add Student</button>
                            <h2 className="OR">OR</h2>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={() => handleFileUpload("upload-students")}>Upload Excel</button>
                        </>
                    )}
                    {activeTab === "Edit Students" && (
                        <>
                            <h2 className="user-h2">Edit Students</h2>
                            <input type="text" name="username" placeholder="Username (Search)" onChange={handleInputChange} />
                            <input type="text" name="name" placeholder="New Name" onChange={handleInputChange} />
                            <input type="email" name="email" placeholder="New Email" onChange={handleInputChange} />
                            <input type="password" name="password" placeholder="New Password" onChange={handleInputChange} />
                            <button onClick={() => handleSubmit("edit-user/" + formData.username)}>Edit Student</button>
                            <h2 className="OR">OR</h2>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={() => handleFileUpload("upload-edit-users")}>Upload Excel</button>
                        </>
                    )}
                    {activeTab === "Delete Students" && (
                        <>
                            <h2 className="user-h2">Delete Students</h2>
                            <input type="text" name="username" placeholder="Username (Search)" onChange={handleInputChange} />
                            <button onClick={() => handleSubmit("delete-user/" + formData.username)}>Delete Student</button>
                            <h2 className="OR">OR</h2>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={() => handleFileUpload("upload-delete-users")}>Upload Excel</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentManagementPage;
