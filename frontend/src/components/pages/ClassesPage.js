// import { useEffect, useState } from "react";
// import AdminPanel from "./AdminPanel";
// import "../styles/ClassesPage.css"

// function ClassesPage() {
//     const [activePage, setActivePage] = useState("Classes");

//     return(
//     <div className="classes-page">
//     <AdminPanel activePage={activePage} setActivePage={setActivePage}/>
//     </div>
//     );
// }

// export default ClassesPage;

import {useState} from "react";
import AdminPanel from "./AdminPanel";
import "../styles/ClassesPage.css";

function ClassesPage() {
    const [activePage, setActivePage] = useState("Classes");
    const [activeTab, setActiveTab] = useState("Add Class");
    const [classFormData, setClassFormData] = useState({class_code: "", class_name: "", description: ""});

    const handleInputChange = (e) => {
        setClassFormData({...classFormData, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (endpoint) => {

    }

    return(
        <div className="classes-page">
            <AdminPanel activePage={activePage} setActivePage={setActivePage} />

            <div className="main-container-classes">
                <div className="sidebar">
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
                            <button onClick={() => handleSubmit("delete-class/" + classFormData.class_code)}>Edit Class</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClassesPage;