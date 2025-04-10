import { useState } from "react";
import { useUser } from "../../UserContext";
import Panel from "./Panel";
import "../styles/InterviewPage.css"

function InterviewPage() {
    const { user } = useUser();
    const [activePage, setActivePage] = useState("Interview Practice");
    const userName = user.userName;

    return (
        <>
        <Panel activePage={activePage} setActivePage={setActivePage} />

        <div>
            <h2>Interview Practice</h2>
            <p>Welcome, {userName}!</p>
        </div>
        </>
    );
}

export default InterviewPage;