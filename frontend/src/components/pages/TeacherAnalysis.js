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
    const [selectedTestId, setSelectedTestId] = useState("");
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/teacher/${user.userName}/classes`)
            .then((res) => setClasses(res.data.classes));
    }, [user]);

    const onClassChange = (e) => {
        const id = e.target.value;
        setClassId(id);
        setTests([]);
        setAnalysis(null);
        setSubjects([]);
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/classes/${id}/recent-tests`)
            .then((res) => setTests(res.data.tests));
    };

    const onTestChange = (e) => {
        const testId = e.target.value;
        setSelectedTestId(testId);
        setAnalysis(null);
        setSubjects([]);
        if (testId === "") return;

        // Fetch analysis
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/tests/${testId}/analysis`)
            .then((res) => setAnalysis(res.data))
            .catch((e) => console.error(e));

        // Fetch subject names for histograms
        axios
            .get(`${process.env.REACT_APP_FLASK_URL}/api/subjects/${testId}`)
            .then((res) => setSubjects(res.data))
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
                        value={selectedTestId}
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
                    <div className="teacher-card">
                        <h3>Section-wise Avg Scores</h3>
                        <ul>
                            {analysis.sections.map((s) => {
                                // Check if avg_score is a valid number
                                const avgScore = isNaN(s.avg_score) ? "N/A" : parseFloat(s.avg_score).toFixed(2);
                                return (
                                    <li key={s.section_id} className="teacher-list-item">
                                        <span className="teacher-section-name">{s.section_name}</span>:&nbsp;
                                        <span className="teacher-score">{avgScore}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>


                    <div className="teacher-card">
                        <h3>Top 5 Students</h3>
                        <ol>
                            {analysis.top5.map((stu) => (
                                <li key={stu.student_id} className="teacher-list-item">
                                    <span className="teacher-student-name">{stu.name}</span>&nbsp;—&nbsp;
                                    <span className="teacher-score">{(stu.score ?? 0).toFixed(2)}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="teacher-card teacher-all-students">
                        <h3>All Students' Scores</h3>
                        <ol>
                            {analysis.all_students.map((stu) => (
                                <li key={stu.student_id} className="teacher-list-item">
                                    <span className="teacher-student-name">{stu.name}</span>:&nbsp;
                                    
                                    <span className="teacher-score">{(stu.score ?? 0).toFixed(2)}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {subjects.length > 0 && (
                        <div className="teacher-card">
                            <h3>Test Summary (Max / Mean / Median)</h3>
                            <img
                                src={`${process.env.REACT_APP_BACKEND_URL}/static/${selectedTestId}summary.png`}
                                alt="Test Summary"
                                style={{ width: "100%", maxWidth: "800px" }}
                            />

                            <h3 style={{ marginTop: "30px" }}>Histograms by Subject</h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                                {subjects.map((subj) => {
                                    const url = `${process.env.REACT_APP_BACKEND_URL}/static/hist_${selectedTestId}_${subj.replace(/\s+/g, '_')}.png`;
                                    return (
                                        <div key={subj}>
                                            <h4>{subj}</h4>
                                            <img
                                                src={url}
                                                alt={`Histogram of ${subj}`}
                                                style={{ width: "350px" }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}