import { useState } from "react";
import { useUser } from "../UserContext";
import AdminPanel from "./pages/AdminPanel";
import "./styles/AdminPage.css"

function AdminPage() {
    const { user } = useUser();
    const [activePage, setActivePage] = useState("Home");

    const userType = user.userType;
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

export default AdminPage;