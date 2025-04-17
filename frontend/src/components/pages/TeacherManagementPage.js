import { useState, useEffect } from "react";
import axios from 'axios';
import AdminPanel from "./AdminPanel";
import "../styles/ManagementPage.css";

function TeacherManagementPage() {
    const [activePage, setActivePage] = useState("Teacher Management");
    const [activeTab, setActiveTab] = useState("Add Teachers");
    const [formData, setFormData] = useState({ username: "", password: "", name: "", email: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-teachers`);
                setTeachers(res.data.teachers);
            } catch (error) {
                console.error("Failed to fetch teachers:", error);
            }
        };

        fetchTeachers();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (e) => {
        const selectedUsername = e.target.value;
        const selectedTeacher = teachers.find(t => t.username === selectedUsername) || {};
        setFormData({
            username: selectedUsername,
            name: selectedTeacher.name || "",
            email: selectedTeacher.email || "",
            password: ""
        });
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
                <div className="admin-sidebar">
                    {["Add Teachers", "Edit Teachers", "Delete Teachers"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="user-content">
                    {activeTab === "Add Teachers" && (
                        <>
                            <h2 className="user-h2">Add Teachers</h2>
                            <input type="text" name="username" placeholder="Username" onChange={handleInputChange} />
                            <input type="password" name="password" placeholder="Password" onChange={handleInputChange} />
                            <input type="text" name="name" placeholder="Name" onChange={handleInputChange} />
                            <input type="email" name="email" placeholder="Email" onChange={handleInputChange} />
                            <button onClick={() => handleSubmit("add-teacher")}>Add Teacher</button>
                            <h2 className="OR">OR</h2>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={() => handleFileUpload("upload-teachers")}>Upload Excel</button>
                        </>
                    )}

                    {activeTab === "Edit Teachers" && (
                        <>
                            <h2 className="user-h2">Edit Teachers</h2>
                            <label className="dropdown-label">Select Teacher:</label>
                            <select className="dropdown-select" value={formData.username} onChange={handleSelectChange}>
                                <option value="">-- Select Teacher --</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.username} value={teacher.username}>
                                        {teacher.username} - {teacher.name}
                                    </option>
                                ))}
                            </select>
                            <input type="text" name="name" placeholder="New Name" value={formData.name} onChange={handleInputChange} />
                            <input type="email" name="email" placeholder="New Email" value={formData.email} onChange={handleInputChange} />
                            <input type="password" name="password" placeholder="New Password" onChange={handleInputChange} />
                            <button onClick={() => handleSubmit("edit-user/" + formData.username)}>Edit Teacher</button>
                            <h2 className="OR">OR</h2>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={() => handleFileUpload("upload-edit-users")}>Upload Excel</button>
                        </>
                    )}

                    {activeTab === "Delete Teachers" && (
                        <>
                            <h2 className="user-h2">Delete Teachers</h2>
                            <label className="dropdown-label">Select Teacher:</label>
                            <select className="dropdown-select" value={formData.username} onChange={handleSelectChange}>
                                <option value="">-- Select Teacher --</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.username} value={teacher.username}>
                                        {teacher.username} - {teacher.name}
                                    </option>
                                ))}
                            </select>
                            <button onClick={() => handleSubmit("delete-user/" + formData.username)}>Delete Teacher</button>
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

export default TeacherManagementPage;
