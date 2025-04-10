import { useState } from "react";
import { useUser } from "../../UserContext";
import Panel from "./Panel";
import "../styles/ProfilePage.css"

function ProfilePage() {
    const { user } = useUser();
    const [activePage, setActivePage] = useState("Profile");
    const userName = user.userName;

    return (
        <>
        <Panel activePage={activePage} setActivePage={setActivePage} />

        <div>
            <h2>Profile</h2>
            <p>Welcome, {userName}!</p>
        </div>
        </>
    );
}

export default ProfilePage;