import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../UserContext";

export default function TeacherStudents() {
  const { user } = useUser();
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/teacher/${user.userName}/classes`)
      .then((res) => setClasses(res.data.classes))
      .catch((e) => console.error(e));
  }, [user]);

  const loadStudents = (e) => {
    const id = e.target.value;
    setClassId(id);
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/classes/${id}/students`)
      .then((res) => setStudents(res.data.students))
      .catch((e) => console.error(e));
  };

  return (
    <div className="teacher-students">
      <h2>Students</h2>
      <label>
        Pick a Class:
        <select value={classId} onChange={loadStudents}>
          <option value="">-- Select --</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.class_code} — {c.class_name}
            </option>
          ))}
        </select>
      </label>
      {students.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Enrolled On</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{new Date(s.enrolled_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
