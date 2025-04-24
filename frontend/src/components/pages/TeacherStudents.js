import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../UserContext";
import "../styles/TeacherStudents.css";

export default function TeacherStudents() {
    const { user } = useUser();
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [studentsByClass, setStudentsByClass] = useState([{ class: [], students: [] }]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/teacher/${user.userName}/students`)
            .then((res) => {
                setStudentsByClass(res.data);
                setClasses(res.data.map((c) => ({
                    id: c.class.id,
                    class_code: c.class.class_code,
                    class_name: c.class.class_name,
                })));
            })
            .catch((e) => console.error(e));
    }, [user]);

    const loadStudents = (e) => {
        const id = Number(e.target.value);
        setClassId(id);
        const students = studentsByClass.find((c) => c.class.id === id)?.students || [];
        setStudents(students);
    };

    return (
        <div className="teacher-students">
            <h2>Students</h2>
            <div className="class-select-container">
                <label htmlFor="classSelect">Pick a Class:</label>
                <select id="classSelect" value={classId} onChange={loadStudents}>
                    <option value="">-- Select --</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.class_code} — {c.class_name}
                        </option>
                    ))}
                </select>
            </div>

            {students.length > 0 && (
                <div className="students-table-container">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td>{s.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
