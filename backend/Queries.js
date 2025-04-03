const pool = require('./db');

async function getTestsForStudent(studentId) { 
    try {
        // Get user ID based on username
        const idQuery = `SELECT id FROM users WHERE username = ?;`;
        const [idResult] = await pool.query(idQuery, [studentId]);

        // ✅ Fix: Ensure `idResult` is defined and has data
        if (!idResult || idResult.length === 0) {
            throw new Error("Student not found");
        }

        // Get classes the student is enrolled in
        const classQuery = `SELECT class_id FROM enrollments WHERE student_id = ?;`;
        const [classResult] = await pool.query(classQuery, [idResult[0].id]);

        // ✅ Fix: Ensure `classResult` is defined before accessing `length`
        if (!classResult || classResult.length === 0) {
            return { activeTests: [], upcomingTests: [], recentTests: [] };
        }

        const classIds = classResult.map(row => row.class_id);

        // Fetch tests related to those classes
        const activeTestsQuery = `
            SELECT * FROM tests 
            WHERE class_id IN (?) AND NOW() BETWEEN start_time AND end_time
            ORDER BY start_time ASC;
        `;
        const upcomingTestsQuery = `
            SELECT * FROM tests 
            WHERE class_id IN (?) AND start_time > NOW()
            ORDER BY start_time ASC;
        `;
        const recentTestsQuery = `
            SELECT * FROM tests 
            WHERE class_id IN (?) AND end_time < NOW()
            ORDER BY end_time DESC
            LIMIT 10;
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

module.exports = {
    // Fetches tests available for a given student based on enrolled classes
    getTestsForStudent,

    // Saves student responses for a test
    saveStudentResponses: async (student_id, test_id, responses) => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            
            for (const { question_id, answer } of responses) {
                await client.query(
                    `INSERT INTO student_responses (student_id, test_id, question_id, response)
                    VALUES (?, $2, $3, $4)
                    ON CONFLICT (student_id, test_id, question_id) DO UPDATE SET response = EXCLUDED.response;`,
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
    },

    // Fetches questions for a test
    getQuestionsForTest: async (test_id) => {
        const query = `
            SELECT q.question_id, q.question_text, q.options, q.correct_answer
            FROM questions q
            WHERE q.test_id = ?;
        `;
        const result = await pool.query(query, [test_id]);
        return result.rows;
    }
};
