const pool = require('./db');

async function getTestsForStudent(studentId) { 
    try {
        const idQuery = `SELECT id FROM users WHERE username = ?;`;
        const [idResult] = await pool.query(idQuery, [studentId]);

        if (!idResult || idResult.length === 0) {
            throw new Error("Student not found");
        }

        const classQuery = `SELECT class_id FROM enrollments WHERE student_id = ?;`;
        const [classResult] = await pool.query(classQuery, [idResult[0].id]);

        if (!classResult || classResult.length === 0) {
            return { activeTests: [], upcomingTests: [], recentTests: [] };
        }

        const classIds = classResult.map(row => row.class_id);

        const activeTestsQuery = `
            SELECT * FROM tests
            WHERE id IN (
                SELECT test_id FROM class_test WHERE class_id IN (?)
            ) AND NOW() BETWEEN start_time AND end_time
            ORDER BY start_time ASC;
        `;
        const upcomingTestsQuery = `
            SELECT * FROM tests
            WHERE id IN (
                SELECT test_id FROM class_test WHERE class_id IN (?)
            ) AND start_time > NOW()
            ORDER BY start_time ASC;
        `;
        const recentTestsQuery = `
            SELECT * FROM tests 
            WHERE id IN (
                SELECT test_id FROM class_test WHERE class_id IN (?)
            ) AND end_time < NOW()
            ORDER BY end_time DESC;
        `;

        const [activeTests] = await pool.query(activeTestsQuery, [classIds]);
        const [upcomingTests] = await pool.query(upcomingTestsQuery, [classIds]);
        const [recentTests] = await pool.query(recentTestsQuery, [classIds]);

        return {
            activeTests: activeTests || [],
            upcomingTests: upcomingTests || [],
            recentTests: recentTests || [],
        };
    } catch (error) {
        throw new Error("Error fetching tests: " + error.message);
    }
}

async function getClasses() {
    try {
        const query = 'SELECT id, class_code, class_name, description FROM classes;';
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        throw new Error("Error fetching classes: " + error.message);
    }
}

async function getTestsForClass(classId) {
    try {
        const query = `
            SELECT * FROM tests 
            WHERE id IN (
                SELECT test_id FROM class_test WHERE class_id = ?
            ) AND start_time > NOW()
            ORDER BY start_time ASC;
        `;
        const [rows] = await pool.query(query, [classId]);
        return rows;
    } catch (error) {
        throw new Error("Error fetching upcoming tests for class: " + error.message);
    }
}

async function insertQuestion(testId, sectionId, question) {
    try {
        const query = `
            INSERT INTO questions (test_id, section_id, ques_text, ques_img_url, ques_type, 
            correct_answer, positive_marks, negative_marks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const [result] = await pool.query(query, 
            [testId, sectionId, question.ques_text, question.ques_img_url, question.ques_type, question.correct_answer, 
            question.positive_marks, question.negative_marks]);
        return result.insertId;
    } catch (error) {
        throw new Error("Error inserting question: " + error.message);
    }
}

async function saveStudentResponses(student_id, test_id, responses) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        for (const { question_id, answer } of responses) {
            await client.query(
                `INSERT INTO student_responses (student_id, test_id, question_id, response)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (student_id, test_id, question_id)
                 DO UPDATE SET response = EXCLUDED.response;`,
                [student_id, test_id, question_id, answer]
            );
        }

        await client.query("COMMIT");
        return { success: true };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function getQuestionsForTest(test_id) {
    const query = `
        SELECT q.question_id, q.question_text, q.options, q.correct_answer
        FROM questions q
        WHERE q.test_id = ?;
    `;

    const [rows] = await pool.query(query, [test_id]);
    return rows;
}

module.exports = {
    getTestsForStudent,
    getClasses,
    getTestsForClass,
    insertQuestion
};
