import { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import "../styles/TestManagementPage.css"

function TestManagementPage() {
    const [activePage, setActivePage] = useState("Test Management");

    return(
    <>
    <AdminPanel activePage={activePage} setActivePage={setActivePage}/>
    </>
    );
}

export default TestManagementPage;