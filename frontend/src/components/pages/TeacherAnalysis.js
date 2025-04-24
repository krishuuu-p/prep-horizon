import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../UserContext";

export default function TeacherAnalysis() {
    const { user } = useUser();
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [tests, setTests] = useState([]);
    const [analysis, setAnalysis] = useState(null);

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
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/tests/${testId}/analysis`)
            .then((res) => setAnalysis(res.data))
            .catch((e) => console.error(e));
    };

    console.log("recent tests are", tests);

    return (
        <div className="teacher-analysis">
            <h2>Analysis</h2>
            <div className="selectors">
                <select onChange={onClassChange} value={classId}>
                    <option value="">-- Pick Class --</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.class_code}
                        </option>
                    ))}
                </select>

                {tests.length > 0 && (
                    <select onChange={onTestChange}>
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
                <div className="analysis-results">
                    <h3>Section-wise Avg Scores</h3>
                    <ul>
                        {analysis.sections.map((s) => (
                            <li key={s.section_id}>
                                {s.section_name}: {s.avg_score}%
                            </li>
                        ))}
                    </ul>

                    <h3>Top 5 Students</h3>
                    <ol>
                        {analysis.top5.map((stu) => (
                            <li key={stu.student_id}>
                                {stu.name} — {stu.score}%
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
