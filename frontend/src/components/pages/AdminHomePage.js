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

        <div className="admin-homepage">
            <div className="content">
                <div className="user-greeting">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome, {userName}!</p>
                </div>

            </div>
        </div>
        </>
    );
}

export default AdminHomePage;