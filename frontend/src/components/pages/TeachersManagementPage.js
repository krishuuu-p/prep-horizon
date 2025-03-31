import { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import "../styles/TeachersManagementPage.css"

function TeachersManagementPage() {
    const [activePage, setActivePage] = useState("Teachers");

    return(
    <>
    <AdminPanel activePage={activePage} setActivePage={setActivePage}/>
    </>
    );
}

export default TeachersManagementPage;