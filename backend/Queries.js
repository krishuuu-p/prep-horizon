const pool = require('./db');

async function getTestsForStudent(studentId) {
    try {
        const idQuery = `SELECT id FROM users WHERE username = ?;`;
        const [idResult] = await pool.query(idQuery, [studentId]);

        if (!idResult || idResult.length === 0) {
            throw new Error("Student not found");
        }

        const classQuery = `SELECT class_id FROM enrollments WHERE user_id = ?;`;
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

async function getClassesForUser(username) {
    try {
        // return error if username not found in users table
        const userQuery = 'SELECT id FROM users WHERE username = ?;';
        const [userRows] = await pool.query(userQuery, [username]);
        if (userRows.length === 0) {
            throw new Error("User not found");
        }
        // get the classes for the user
        const query = `
            SELECT c.id, c.class_code, c.class_name, c.description 
            FROM classes c
            JOIN enrollments e ON c.id = e.class_id
            JOIN users u ON e.user_id = u.id
            WHERE u.username = ?;
        `;
        const [rows] = await pool.query(query, [username]);
        return rows;
    } catch (error) {
        throw new Error("Error fetching classes for user: " + error.message);
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

async function getUserId (username) {
    try {
        const query = `SELECT id FROM users WHERE username = ?;`;
        const [rows] = await pool.query(query, [username]);
        if (rows.length === 0) {
            throw new Error("User not found");
        }
        return rows[0].id;
    } catch (error) {
        throw new Error("Error fetching user ID: " + error.message);
    }
}

async function getTestState(studentUsername, testId) {
    try {
        const studentId = await getUserId(studentUsername);
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
            if (!responseRows || responseRows.length === 0) {
                // student is clicking on start test for the first time, so we need to initialize the test
                await initializeTest(studentId, testId);
                // get the start time of the test and store it in the many to many table between students and tests
                const startTime = new Date();
                const insertQuery = `
                    INSERT INTO student_tests (student_id, test_id, start_time)
                    VALUES (?, ?, ?);
                `;
                await pool.query(insertQuery, [studentId, testId, startTime]);

            }

            const allOptionsQuery = `
            SELECT * FROM options
            WHERE question_id IN (${placeholders});
        `;
            [allOptionRows] = await pool.query(allOptionsQuery, questionIds);
        }

        // get remaining time for the test by fetching the start time from the student_tests table, duration of the test from the tests table and subtracting the time elapsed from the start time to now
        const startTimeQuery = `
        SELECT start_time FROM student_tests
        WHERE student_id = ? AND test_id = ?;
    `;
        const [startTimeRows] = await pool.query(startTimeQuery, [studentId, testId]);
        if (!startTimeRows || startTimeRows.length === 0) {
            throw new Error("Test not found for the student");
        }
        const startTime = new Date(startTimeRows[0].start_time);
        const testDurationQuery = `
        SELECT duration FROM tests
        WHERE id = ?;
    `;
        const [testDurationRows] = await pool.query(testDurationQuery, [testId]);
        if (!testDurationRows || testDurationRows.length === 0) {
            throw new Error("Test not found");
        }
        const testDuration = testDurationRows[0].duration * 1000; // convert to milliseconds
        const currentTime = new Date();
        const timeElapsed = currentTime - startTime; 
        // get remaining time in seconds
        const remainingTime = Math.max(0, Math.floor((testDuration - timeElapsed) / 1000));

        // get the sections for the test
        const sectionsQuery = `
        SELECT * FROM sections
        WHERE test_id = ?;
    `;
        const [sectionRows] = await pool.query(sectionsQuery, [testId]);

        let testState = {};
        for (const row of sectionRows) {
            const sectionName = row.section_name;
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
                } else if (question.ques_type === "multi_correct") {
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
        // return the test state with remaining time
        return {testState, remainingTime};
    }
    catch (error) {
        throw new Error("Error fetching test state: " + error.message);
    }
}

async function saveTestState(studentUsername, testId, sections) {
    try {
        console.log("Saving test state for student:", studentUsername, "for test ID:", testId);
        // console.log("Sections:", sections);
        const studentId = await getUserId(studentUsername);
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
        if (questionIds.length > 0) {
            const responsesQuery = `
                SELECT * FROM student_responses
                WHERE student_id = ? AND question_id IN (${placeholders});
            `;
            [responseRows] = await pool.query(responsesQuery, [studentId, ...questionIds]);
        }
        // console.log("Response rows:", responseRows);
        for (const sectionName in sections) {
            const sectionQuestions = sections[sectionName];
            for (const question of sectionQuestions) {
                const questionRow = questionRows.find(q => q.ques_text === question.question);
                if (!questionRow) continue; // Skip if the question is not found

                const responseRow = responseRows.find(res => res.question_id === questionRow.id);
                if (responseRow) {
                    // Update existing response
                    if (question.type === "numerical") {
                        const updateQuery = `
                            UPDATE student_responses SET 
                            status = ?, numerical_answer = ? , is_correct = ?, marks_obtained = ?
                            WHERE student_id = ? AND question_id = ?;
                        `;
                        const isCorrect = question.answer === question.useranswer ? 1 : 0;
                        const marksObtained = isCorrect ? questionRow.positive_marks : (-1 * questionRow.negative_marks);
                        await pool.query(updateQuery, [
                            question.status,
                            question.useranswer,
                            isCorrect,
                            marksObtained,
                            studentId,
                            questionRow.id
                        ]);
                    }
                    else if (question.type === "single_correct") {
                        const updateQuery = `
                            UPDATE student_responses SET 
                            status = ?, 
                            selected_option_id_1 = ?, 
                            is_correct = ?,
                            marks_obtained = ?
                            WHERE student_id = ? AND question_id = ?;
                        `;
                        if (!question.useranswer) {
                            // set selected_option_id_1 to null if useranswer is null
                            await pool.query(updateQuery, [
                                question.status,
                                null,
                                0,
                                0,
                                studentId,
                                questionRow.id
                            ]);
                        }
                        else {
                            // get new option's id from the options table, useranswer will contain the option key
                            const optionQuery = `
                                SELECT id FROM options WHERE question_id = ? AND option_key = ?;
                            `;
                            const [optionRows] = await pool.query(optionQuery, [questionRow.id, question.useranswer]);
                            const selectedOptionId = optionRows.length > 0 ? optionRows[0].id : null;
                            // check the answer
                            const isCorrect = question.answer === question.useranswer ? 1 : 0;
                            const marksObtained = isCorrect ? questionRow.positive_marks : (-1 * questionRow.negative_marks);
                            // set selected_option_id_1 to the new option's id
                            await pool.query(updateQuery, [
                                question.status,
                                selectedOptionId,
                                isCorrect,
                                marksObtained,
                                studentId,
                                questionRow.id
                            ]);
                        }
                    }
                    else if (question.type === "multi_correct") {
                        // console.log("This is multi correct question", question);
                        const updateQuery = `
                            UPDATE student_responses SET 
                            status = ?, 
                            selected_option_id_1 = ?, 
                            selected_option_id_2 = ?, 
                            selected_option_id_3 = ?, 
                            selected_option_id_4 = ?,
                            is_correct = ?,
                            marks_obtained = ?
                            WHERE student_id = ? AND question_id = ?;
                        `;
                        if (!question.useranswer || question.useranswer.length === 0) {
                            // set all selected_option_ids to null if useranswer is null
                            await pool.query(updateQuery, [
                                question.status,
                                null,
                                null,
                                null,
                                null,
                                0,
                                0,
                                studentId,
                                questionRow.id
                            ]);
                        }
                        else {
                            // get new options' ids from the options table, useranswer will contain the array of option keys
                            const optionQuery = `
                                SELECT id FROM options WHERE question_id = ? AND option_key IN (?);
                            `;
                            const [optionRows] = await pool.query(optionQuery, [questionRow.id, question.useranswer]);
                            const selectedOptionIds = optionRows.map(opt => opt.id);
                            while (selectedOptionIds.length < 4) {
                                selectedOptionIds.push(null);
                            }
                            
                            // check the answer
                            const correctAnswers = question.answer;
                            // console.log("These are correct answers", correctAnswers);
                            // console.log("These are selected answers", question.useranswer);
                            const isCorrect = correctAnswers.every(ans => question.useranswer.includes(ans)) ? 1 : 0;
                            const marksObtained = isCorrect ? questionRow.positive_marks : (-1 * questionRow.negative_marks);
                            // set selected_option_ids to the new options' ids
                            await pool.query(updateQuery, [
                                question.status,
                                selectedOptionIds[0],
                                selectedOptionIds[1],
                                selectedOptionIds[2],
                                selectedOptionIds[3],
                                isCorrect,
                                marksObtained,
                                studentId,
                                questionRow.id
                            ]);
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        throw new Error("Error saving test state: " + error.message);
    }
}

async function initializeTest (studentId, testId) {
    // for each question in the test, insert a row in student_responses table with default values
    try {
        const questionsQuery = `
            SELECT * FROM questions
            WHERE test_id = ?;
        `;

        const [questionRows] = await pool.query(questionsQuery, [testId]);
        if (!questionRows || questionRows.length === 0) {
            throw new Error(`No questions found for the test with ID ${testId}`);
        }

        for (const question of questionRows) {
            const insertQuery = `
                INSERT INTO student_responses (student_id, question_id, status, numerical_answer, selected_option_id_1, selected_option_id_2, selected_option_id_3, selected_option_id_4)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `;
            await pool.query(insertQuery, [
                studentId,
                question.id,
                "Not Visited",
                null,
                null,
                null,
                null,
                null
            ]);
        }
    } catch (error) {
        throw new Error("Error initializing test: " + error.message);
    }
}

module.exports = {
    getTestsForStudent,
    getClasses,
    getClassesForUser,
    getTestsForClass,
    insertQuestion,
    getTestState,
    saveTestState
};
