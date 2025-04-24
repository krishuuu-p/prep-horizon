import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../UserContext";
import "../styles/TeacherClasses.css";

export default function TeacherClasses() {
  const { user } = useUser();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/teacher/${user.userName}/classes`)
      .then((res) => setClasses(res.data.classes))
      .catch((e) => console.error("Could not load classes", e));
  }, [user]);

  return (
    <div className="teacher-classes">
      <h2>My Classes</h2>
      <ul className="teacher-class-list">
        {classes.map((c) => (
          <li key={c.id} className="teacher-class-card">
            <strong>{c.class_code}</strong>
            <span>{c.class_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
