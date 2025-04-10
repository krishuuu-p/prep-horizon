import { useState } from "react";
import { useUser } from "../../UserContext";
import AdminPanel from "./AdminPanel";
import "../styles/AdminHomePage.css"

function AdminHomePage() {
    const { user } = useUser();
    const [activePage, setActivePage] = useState("Home");
    const userName = user.userName;

    return (
        <>
        <AdminPanel activePage={activePage} setActivePage={setActivePage} />

        <div>
            <h2>Admin Dashboard</h2>
            <p>Welcome, {userName}!</p>
        </div>
        </>
    );
}

export default AdminHomePage;