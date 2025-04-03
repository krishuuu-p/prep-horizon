import { useState } from "react";
import { useUser } from "../UserContext";
import AdminPanel from "./pages/AdminPanel";
import "./styles/AdminPage.css"

function AdminPage() {
    const [activePage, setActivePage] = useState("Home");
    const { user } = useUser();

    const name = user.name;

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