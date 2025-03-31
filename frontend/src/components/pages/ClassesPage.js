import { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import "../styles/ClassesPage.css"

function ClassesPage() {
    const [activePage, setActivePage] = useState("Classes");

    return(
    <>
    <AdminPanel activePage={activePage} setActivePage={setActivePage}/>
    </>
    );
}

export default ClassesPage;