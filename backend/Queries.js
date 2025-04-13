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

async function getTestState(studentId, testId) {
    const questionsQuery = `
        SELECT * FROM questions
        WHERE test_id = ?;
    `;

    const [questionRows] = await pool.query(questionsQuery, [testId]);
    if (!questionRows || questionRows.length === 0) {
        throw new Error(`No questions found for the test with ID ${testId}`);
    }

    const questionIds = questionRows.map(row => row.id);
    const placeholders = questionIds.map(() => '?').join(', ');

    let responseRows = [];
    let allOptionRows = [];
    if (questionIds.length > 0) {
        const responsesQuery = `
            SELECT * FROM student_responses
            WHERE student_id = ? AND question_id IN (${placeholders});
        `;
        [responseRows] = await pool.query(responsesQuery, [studentId, ...questionIds]);

        const allOptionsQuery = `
            SELECT * FROM options
            WHERE question_id IN (${placeholders});
        `;
        [allOptionRows] = await pool.query(allOptionsQuery, questionIds);
    }

    const sectionsQuery = `
        SELECT * FROM sections
        WHERE test_id = ?;
    `;
    const [sectionRows] = await pool.query(sectionsQuery, [testId]);

    let testState = {};
    for (const row of sectionRows) {
        const sectionName = row.section_name;
        const sectionQuestions = questionRows.filter(question => question.section_id === row.id);
        testState[sectionName] = [];
    }

    for (const sectionName in testState) {
        const sectionRow = sectionRows.find(row => row.section_name === sectionName);
        const sectionId = sectionRow.id;
        const sectionQuestions = questionRows.filter(question => question.section_id === sectionId);

        testState[sectionName] = sectionQuestions.map(question => {
            const response = responseRows.find(res => res.question_id === question.id);

            if (question.ques_type === "numerical") {
                return {
                    type: question.ques_type,
                    question: question.ques_text,
                    options: null,
                    answer: question.numerical_answer,
                    image: question.ques_img,
                    useranswer: response ? response.numerical_answer : null,
                    status: response ? response.status : "Not Visited",
                };
            }

            const questionOptions = allOptionRows.filter(opt => opt.question_id === question.id);
            const options = questionOptions.reduce((acc, opt) => {
                acc[opt.option_key] = opt.option_text;
                return acc;
            }, {});

            const correctAnswer = questionOptions.filter(opt => opt.is_correct === 1).map(opt => opt.option_key);

            let answer = null;
            if (question.ques_type === "single_correct") {
                answer = correctAnswer[0];
            } else if (question.ques_type === "multiple_correct") {
                answer = correctAnswer;
            }

            let userAnswer = [];
            if (response) {
                for (let i = 1; i <= 4; i++) {
                    const optionIdField = `selected_option_id_${i}`;
                    if (response[optionIdField]) {
                        const selectedOption = questionOptions.find(opt => opt.id === response[optionIdField]);
                        if (selectedOption) {
                            userAnswer.push(selectedOption.option_key);
                        }
                    }
                }
            }

            if (userAnswer.length === 0) {
                userAnswer = null;
            }
            else if (userAnswer.length === 1) {
                userAnswer = userAnswer[0];
            }

            return {
                type: question.ques_type,
                question: question.ques_text,
                options: options,
                answer: answer,
                image: question.ques_img,
                useranswer: userAnswer,
                status: response ? response.status : "Not Visited"
            };
        });
    }

    return testState;
}

module.exports = {
    getTestsForStudent,
    getClasses,
    getTestsForClass,
    insertQuestion,
    getTestState
};
