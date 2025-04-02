import { useState } from "react";
import { useLocation } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import "./styles/AdminPage.css"

function AdminPage() {
    const [activePage, setActivePage] = useState("Home");
    const location = useLocation();

    const name = location.state?.name || "Guest";

    return (
        <>
        <AdminPanel activePage={activePage} setActivePage={setActivePage} />

        <div>
            <h2>Admin Dashboard</h2>
            <p>Welcome, {name}!</p>
        </div>
        </>
    );
}

export default AdminPage;