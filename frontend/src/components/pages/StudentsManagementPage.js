import {useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import "../styles/StudentsManagementPage.css"

function StudentsManagementPage() {
    const [activePage, setActivePage] = useState("Students");

    return(
    <>
    <AdminPanel activePage={activePage} setActivePage={setActivePage}/>
    </>
    );
}

export default StudentsManagementPage;