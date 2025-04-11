import {useState} from "react";
import axios from "axios";
import AdminPanel from "./AdminPanel";
import "../styles/ClassesPage.css";

function ClassesPage() {
    const [activePage, setActivePage] = useState("Classes");
    const [activeTab, setActiveTab] = useState("Add Class");
    const [classFormData, setClassFormData] = useState({class_code: "", class_name: "", description: ""});
    const [selectedFile, setSelectedFile] = useState(null);

    const handleInputChange = (e) => {
        setClassFormData({...classFormData, [e.target.name]: e.target.value});
    }

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
                    {["Add Class", "Edit Class", "Delete Class", "Add Students", "Remove Students", "Add Teachers", "Remove Teachers"].map((tab) => (
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
                            <input type="text" name="class_code" placeholder="Class Code (Search)" onChange={handleInputChange} />
                            <input type="text" name="class_name" placeholder="New Class Name" onChange={handleInputChange} />
                            <textarea name="description" placeholder="New Class Description" onChange={handleInputChange} />
                            <button onClick={() => handleSubmit("edit-class/" + classFormData.class_code)}>Edit Class</button>
                        </>
                    )}
                    {activeTab === "Delete Class" && (
                        <>
                            <h2 className="class-h2">Delete Class</h2>
                            <input type="text" name="class_code" placeholder="Class Code (Search)" onChange={handleInputChange} />
                            <button onClick={() => handleSubmit("delete-class/" + classFormData.class_code)}>Delete Class</button>
                        </>
                    )}
                    {activeTab === "Add Students" && (
                        <>
                            <h2 className="class-h2">Add Students to Class</h2>
                            <input type="text" name="class_code" placeholder="Class Code" required onChange={handleInputChange} />
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={ () => handleFileUpload("add-users-to-class")}>Add Students</button>
                        </>
                    )}
                    {activeTab === "Remove Students" && (
                        <>
                            <h2 className="class-h2">Remove Students from Class</h2>
                            <input type="text" name="class_code" placeholder="Class Code" required onChange={handleInputChange} />
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={ () => handleFileUpload("remove-users-from-class")}>Remove Students</button>
                        </>
                    )}
                    {activeTab === "Add Teachers" && (
                        <>
                            <h2 className="class-h2">Add Teachers to Class</h2>
                            <input type="text" name="class_code" placeholder="Class Code" onChange={handleInputChange} />
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={ () => handleFileUpload("add-users-to-class")}>Add Teachers</button>
                        </>
                    )}
                    {activeTab === "Remove Teachers" && (
                        <>
                            <h2 className="class-h2">Remove Teachers from Class</h2>
                            <input type="text" name="class_code" placeholder="Class Code" onChange={handleInputChange} />
                            <input type="file" onChange={handleFileChange} />
                            <button onClick={ () => handleFileUpload("remove-users-from-class")}>Remove Teachers</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClassesPage;