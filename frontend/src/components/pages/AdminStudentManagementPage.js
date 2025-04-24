import { useEffect, useState } from "react";
import axios from "axios";
import AdminPanel from "./AdminPanel";
import "../styles/ManagementPage.css";

function StudentManagementPage() {
    const [activePage, setActivePage] = useState("Student Management");
    const [activeTab, setActiveTab] = useState("Add Students");
    const [formData, setFormData] = useState({ username: "", password: "", name: "", email: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-students`);
                // console.log("Fetched students:", res.data.students);
                setStudents(res.data.students);
            } catch (error) {
                console.error("Failed to fetch students:", error);
            }
        };

        fetchStudents();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (e) => {
        const selectedUsername = e.target.value;
        const selectedStudent = students.find((s) => s.username === selectedUsername) || {};
        setFormData({
            username: selectedUsername,
            name: selectedStudent.name || "",
            email: selectedStudent.email || "",
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
                            <label className="dropdown-label">Select Student:</label>
                            <select className="dropdown-select" value={formData.username} onChange={handleSelectChange}>
                                <option value="">-- Select Student --</option>
                                {students.map((student) => (
                                    <option key={student.username} value={student.username}>
                                        {student.username} - {student.name}
                                    </option>
                                ))}
                            </select>
                            <input type="text" name="name" placeholder="New Name" value={formData.name} onChange={handleInputChange} />
                            <input type="email" name="email" placeholder="New Email" value={formData.email} onChange={handleInputChange} />
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
                            <label className="dropdown-label">Select Student:</label>
                            <select className="dropdown-select" value={formData.username} onChange={handleSelectChange}>
                                <option value="">-- Select Student --</option>
                                {students.map((student) => (
                                    <option key={student.username} value={student.username}>
                                        {student.username} - {student.name}
                                    </option>
                                ))}
                            </select>
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
