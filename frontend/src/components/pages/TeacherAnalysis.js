// TeacherAnalysis.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../UserContext";
import '../styles/TeacherAnalysis.css';

export default function TeacherAnalysis() {
    const { user } = useUser();
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [tests, setTests] = useState([]);
    const [analysis, setAnalysis] = useState(null);

    const defaultAnalysis = {
        sections: [
            { section_id: 1, section_name: "Physics", avg_score: 9 },
            { section_id: 2, section_name: "Maths", avg_score: 7 },
            { section_id: 3, section_name: "Chemistry", avg_score: 8 }
        ],
        top5: [
            { student_id: 1, name: "Student 7", score: 23 },
            { student_id: 2, name: "Student 1", score: 22 },
            { student_id: 3, name: "Student 9", score: 20 },
            { student_id: 4, name: "Student 11", score: 20 },
            { student_id: 5, name: "Student 12", score: 19 }
        ],
        all_students: [
            { student_id: 1, name: "Student 7", score: 23 },
            { student_id: 2, name: "Student 1", score: 22 },
            { student_id: 3, name: "Student 9", score: 20 },
            { student_id: 4, name: "Student 11", score: 20 },
            { student_id: 5, name: "Student 12", score: 19 },
            { student_id: 6, name: "Student 8", score: 18 },
            { student_id: 7, name: "Student 10", score: 17 }
        ]
    };

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/teacher/${user.userName}/classes`)
            .then((res) => setClasses(res.data.classes));
    }, [user]);

    const onClassChange = (e) => {
        const id = e.target.value;
        setClassId(id);
        setTests([]);
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/classes/${id}/recent-tests`)
            .then((res) => setTests(res.data.tests));
    };

    const onTestChange = (e) => {
        const testId = e.target.value;
        // show defaults until real data arrives
        setAnalysis(defaultAnalysis);
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/tests/${testId}/analysis`)
            .then((res) => setAnalysis(res.data))
            .catch((e) => console.error(e));
    };

    return (
        <div className="teacher-analysis">
            <h2 className="teacher-title">Performance Analysis</h2>

            <div className="teacher-selectors">
                <select
                  onChange={onClassChange}
                  value={classId}
                  className="teacher-dropdown"
                >
                    <option value="">-- Pick Class --</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.class_code}
                        </option>
                    ))}
                </select>

                {tests.length > 0 && (
                    <select
                      onChange={onTestChange}
                      className="teacher-dropdown"
                    >
                        <option value="">-- Pick Test --</option>
                        {tests.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.test_name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {analysis && (
                <div className="teacher-analysis-results">
                    {/* Section-wise averages */}
                    <div className="teacher-card">
                        <h3>Section-wise Avg Scores</h3>
                        <ul>
                            {analysis.sections.map((s) => (
                                <li
                                  key={s.section_id}
                                  className="teacher-list-item"
                                >
                                    <span className="teacher-section-name">
                                      {s.section_name}
                                    </span>
                                    :&nbsp;
                                    <span className="teacher-score">
                                      {s.avg_score}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Top 5 */}
                    <div className="teacher-card">
                        <h3>Top 5 Students</h3>
                        <ol>
                            {analysis.top5.map((stu) => (
                                <li
                                  key={stu.student_id}
                                  className="teacher-list-item"
                                >
                                    <span className="teacher-student-name">
                                      {stu.name}
                                    </span>
                                    &nbsp;—&nbsp;
                                    <span className="teacher-score">
                                      {stu.score}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* All students */}
                    <div className="teacher-card teacher-all-students">
                        <h3>All Students' Scores</h3>
                        <ul>
                            {analysis.all_students.map((stu) => (
                                <li
                                  key={stu.student_id}
                                  className="teacher-list-item"
                                >
                                    <span className="teacher-student-name">
                                      {stu.name}
                                    </span>
                                    :&nbsp;
                                    <span className="teacher-score">
                                      {stu.score}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
