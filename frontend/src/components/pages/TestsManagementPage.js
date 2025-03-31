import { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import "../styles/TestsManagementPage.css"

function TestsManagementPage() {
    const [activePage, setActivePage] = useState("Tests");

    return(
    <>
    <AdminPanel activePage={activePage} setActivePage={setActivePage}/>
    </>
    );
}

export default TestsManagementPage;