import { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import "../styles/ClassesPage.css"

function ClassesPage() {
    const [activePage, setActivePage] = useState("Classes");

    return(
    <div className="classes-page">
    <AdminPanel activePage={activePage} setActivePage={setActivePage}/>
    </div>
    );
}

export default ClassesPage;