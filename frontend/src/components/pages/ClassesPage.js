import {useState, useEffect} from "react";
import axios from "axios";
import AdminPanel from "./AdminPanel";
import "../styles/ClassesPage.css";

function ClassesPage() {
    const [activePage, setActivePage] = useState("Classes");
    const [activeTab, setActiveTab] = useState("Add Class");
    const [classFormData, setClassFormData] = useState({class_code: "", class_name: "", description: ""});
    const [selectedFile, setSelectedFile] = useState(null);
    const [classes, setClasses] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [displayClassCode, setDisplayClassCode] = useState("");


    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-classes`);
                // console.log("Fetched classes:", res.data.classes);
                setClasses(res.data.classes);
            } catch (error) {
                console.error("Failed to fetch classes:", error);
            }
        };

        fetchClasses(); 
    }, []);

    const handleInputChange = (e) => {
        setClassFormData({...classFormData, [e.target.name]: e.target.value});
    }

    const handleSelectChange = (e) => {
        const selectedClassCode = e.target.value;
        const selectedClass = classes.find((s) => s.class_code === selectedClassCode) || {};
        setClassFormData({
            class_code: selectedClassCode,
            class_name: selectedClass.class_name || "",
            description: selectedClass.description || ""
        });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    }

    const handleSubmit = async (endpoint) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/${endpoint}`, classFormData);
            alert(response.data.message);
        } catch (error) {
            alert("Error: " + (error.response?.data.message || error.message));
        }
    }

    const handleFileUpload = async (endpoint) => {
        if(!selectedFile){
            alert("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file",selectedFile);
        formData.append("class_code", classFormData.class_code);

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/${endpoint}`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.message || "Error uploading file");
        }
    }

    return(
        <div className="classes-page">
            <AdminPanel activePage={activePage} setActivePage={setActivePage} />

            <div className="main-container-classes">
                <div className="admin-sidebar">
                    {["Add Class", "Edit Class", "Delete Class", "Display Students", "Add Students", "Remove Students",  "Display Teachers", "Add Teachers", "Remove Teachers" ].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab===tab? "active":""}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="class-content">
                    {activeTab === "Add Class" && (
                        <>
                            <h2 className="class-h2">Add Class</h2>
                            <input type="text" name="class_code" placeholder="Class Code" onChange={handleInputChange} />
                            <input type="text" name="class_name" placeholder="Class Name" onChange={handleInputChange} />
                            <textarea name="description" placeholder="Class Description" onChange={handleInputChange} />
                            <button onClick={() => handleSubmit("add-class")}>Add Class</button>
                        </>
                    )}
                    {activeTab === "Edit Class" && (
                        <>
                            <h2 className="class-h2">Edit Class</h2>
                            <label className="dropdown-label">Select Class:</label>
                            <select className="dropdown-select" value={classFormData.class_code} onChange={handleSelectChange}>
                                <option value="">-- Select Class --</option>
                                {classes.map((classData) => (
                                    <option key={classData.class_code} value={classData.class_code}>
                                        {classData.class_name} - {classData.description}
                                    </option>
                                ))}
                            </select>
                            <input type="text" name="class_name" value={classFormData.class_name} placeholder="New Class Name" onChange={handleInputChange} />
                            <textarea name="description" value={classFormData.description} placeholder="New Class Description" onChange={handleInputChange} />
                            <button onClick={() => handleSubmit("edit-class/" + classFormData.class_code)}>Edit Class</button>
                        </>
                    )}
                    {activeTab === "Delete Class" && (
                        <>
                            <h2 className="class-h2">Delete Class</h2>
                            <label className="dropdown-label">Select Class:</label>
                            <select className="dropdown-select" value={classFormData.class_code} onChange={handleSelectChange}>
                                <option value="">-- Select Class --</option>
                                {classes.map((classData) => (
                                    <option key={classData.class_code} value={classData.class_code}>
                                        {classData.class_name} - {classData.description}
                                    </option>
                                ))}
                            </select>
                            <button onClick={() => handleSubmit("delete-class/" + classFormData.class_code)}>Delete Class</button>
                        </>
                    )}
                    {activeTab === "Add Students" && (
                        <>
                            <h2 className="class-h2">Add Students to Class</h2>
                            <label className="dropdown-label">Select Class:</label>
                            <select className="dropdown-select" value={classFormData.class_code} onChange={handleSelectChange}>
                                <option value="">-- Select Class --</option>
                                {classes.map((classData) => (
                                    <option key={classData.class_code} value={classData.class_code}>
                                        {classData.class_name} - {classData.description}
                                    </option>
                                ))}
                            </select>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={ () => handleFileUpload("add-users-to-class")}>Add Students</button>
                        </>
                    )}
                    {activeTab === "Remove Students" && (
                        <>
                            <h2 className="class-h2">Remove Students from Class</h2>
                            <label className="dropdown-label">Select Class:</label>
                            <select className="dropdown-select" value={classFormData.class_code} onChange={handleSelectChange}>
                                <option value="">-- Select Class --</option>
                                {classes.map((classData) => (
                                    <option key={classData.class_code} value={classData.class_code}>
                                        {classData.class_name} - {classData.description}
                                    </option>
                                ))}
                            </select>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={ () => handleFileUpload("remove-users-from-class")}>Remove Students</button>
                        </>
                    )}
                    {activeTab === "Add Teachers" && (
                        <>
                            <h2 className="class-h2">Add Teachers to Class</h2>
                            <label className="dropdown-label">Select Class:</label>
                            <select className="dropdown-select" value={classFormData.class_code} onChange={handleSelectChange}>
                                <option value="">-- Select Class --</option>
                                {classes.map((classData) => (
                                    <option key={classData.class_code} value={classData.class_code}>
                                        {classData.class_name} - {classData.description}
                                    </option>
                                ))}
                            </select>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={ () => handleFileUpload("add-users-to-class")}>Add Teachers</button>
                        </>
                    )}
                    {activeTab === "Remove Teachers" && (
                        <>
                            <h2 className="class-h2">Remove Teachers from Class</h2>
                            <label className="dropdown-label">Select Class:</label>
                            <select className="dropdown-select" value={classFormData.class_code} onChange={handleSelectChange}>
                                <option value="">-- Select Class --</option>
                                {classes.map((classData) => (
                                    <option key={classData.class_code} value={classData.class_code}>
                                        {classData.class_name} - {classData.description}
                                    </option>
                                ))}
                            </select>
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={ () => handleFileUpload("remove-users-from-class")}>Remove Teachers</button>
                        </>
                    )}
                    {activeTab === "Display Students" && (
                        <>
                            <h2 className="class-h2">Students in Class</h2>
                            <select className="dropdown-select" value={displayClassCode} onChange={(e) => setDisplayClassCode(e.target.value)}>
                                <option value="">-- Select Class --</option>
                                {classes.map((cls) => (
                                    <option key={cls.class_code} value={cls.class_code}>
                                        {cls.class_name} - {cls.description}
                                    </option>
                                ))}
                            </select>
                            <button onClick={async () => {
                                if (!displayClassCode) return alert("Please select a class");
                                try {
                                    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-students-in-class/${displayClassCode}`);
                                    setDisplayedUsers(res.data.students);
                                } catch (err) {
                                    alert("Error fetching students.");
                                }
                            }}>Show Students</button>

                            {<div className="list-container">
                                {displayedUsers.length === 0 ? (
                                    <p className="empty-message">No students found for this class.</p>
                                ) : (
                                    <ul className="user-list">
                                        {displayedUsers.map((user, index) => (
                                            <li key={user.id} className="user-card">
                                                <div className="user-info">
                                                    <h3>{user.name}</h3>
                                                    <p><strong>Username:</strong> {user.username}</p>
                                                    <p><strong>Email:</strong> {user.email}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>}
                        </>
                    )}
                    {activeTab === "Display Teachers" && (
                        <>
                            <h2 className="class-h2">Teachers in Class</h2>
                            <select className="dropdown-select" value={displayClassCode} onChange={(e) => setDisplayClassCode(e.target.value)}>
                                <option value="">-- Select Class --</option>
                                {classes.map((cls) => (
                                    <option key={cls.class_code} value={cls.class_code}>
                                        {cls.class_name} - {cls.description}
                                    </option>
                                ))}
                            </select>
                            <button onClick={async () => {
                                if (!displayClassCode) return alert("Please select a class");
                                try {
                                    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-teachers-in-class/${displayClassCode}`);
                                    setDisplayedUsers(res.data.teachers);
                                } catch (err) {
                                    alert("Error fetching teachers.");
                                }
                            }}>Show Teachers</button>
                            
                            {<div className="list-container">
                                {displayedUsers.length === 0 ? (
                                    <p className="empty-message">No teachers found for this class.</p>
                                ) : (
                                    <ul className="user-list">
                                        {displayedUsers.map((user, index) => (
                                            <li key={user.id} className="user-card">
                                                <div className="user-info">
                                                    <h3>{user.name}</h3>
                                                    <p><strong>Username:</strong> {user.username}</p>
                                                    <p><strong>Email:</strong> {user.email}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClassesPage;