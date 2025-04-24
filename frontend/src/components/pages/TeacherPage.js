import { useState } from "react";
import Panel from "./TeacherPanel";
import TeacherDashboard from "./TeacherDashboard";
import TeacherClasses from "./TeacherClasses";
import TeacherStudents from "./TeacherStudents";
import TeacherAnalysis from "./TeacherAnalysis";
import "../styles/TeacherHomePage.css";

export default function TeacherHomePage() {
  const [activePage, setActivePage] = useState("Home");

  return (
    <div className="teacher-page">
      <Panel activePage={activePage} setActivePage={setActivePage} />
      <div className="teacher-content">
        {activePage === "Home" && <TeacherDashboard />}
        {activePage === "Classes" && <TeacherClasses />}
        {activePage === "Students" && <TeacherStudents />}
        {activePage === "Analysis" && <TeacherAnalysis />}
      </div>
    </div>
  );
}
