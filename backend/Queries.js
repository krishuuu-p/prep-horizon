const pool = require('./db');
async function getActiveTestsForUser(username) {
    try {
        const idQuery = `SELECT id FROM users WHERE username = ?;`;
        const [idResult] = await pool.query(idQuery, [username]);

        if (!idResult || idResult.length === 0) {
            throw new Error("Student not found");
        }

        const classQuery = `SELECT class_id FROM enrollments WHERE user_id = ?;`;
        const [classResult] = await pool.query(classQuery, [idResult[0].id]);

        if (!classResult || classResult.length === 0) {
            return [];
        }

        const classIds = classResult.map(row => row.class_id);

        const activeTestsQuery = `
            SELECT * FROM tests
            WHERE id IN (
                SELECT test_id FROM class_test WHERE class_id IN (?)
            ) AND NOW() BETWEEN start_time AND end_time
            ORDER BY start_time ASC;
        `;

        const [activeTests] = await pool.query(activeTestsQuery, [classIds]);
        // for each test in activeTests, append a field called is_submitted which is true if the test is submitted by the student and false otherwise
        for (let i = 0; i < activeTests.length; i++) {
            const testId = activeTests[i].id;
            const isSubmittedQuery = `
                SELECT is_submitted FROM student_tests
                WHERE student_id = ? AND test_id = ?;
            `;
            const [isSubmittedResult] = await pool.query(isSubmittedQuery, [idResult[0].id, testId]);
            if (isSubmittedResult && isSubmittedResult.length > 0) {
                activeTests[i].is_submitted = isSubmittedResult[0].is_submitted;
            } else {
                activeTests[i].is_submitted = false;
            }
        }
        return activeTests || [];
    } catch (error) {
        throw new Error("Error fetching active tests: " + error.message);
    }
}

async function getUpcomingTestsForUser(username) {
    try {
        const idQuery = `SELECT id FROM users WHERE username = ?;`;
        const [idResult] = await pool.query(idQuery, [username]);

        if (!idResult || idResult.length === 0) {
            throw new Error("Student not found");
        }

        const classQuery = `SELECT class_id FROM enrollments WHERE user_id = ?;`;
        const [classResult] = await pool.query(classQuery, [idResult[0].id]);

        if (!classResult || classResult.length === 0) {
            return [];
        }

        const classIds = classResult.map(row => row.class_id);

        const upcomingTestsQuery = `
            SELECT * FROM tests
            WHERE id IN (
                SELECT test_id FROM class_test WHERE class_id IN (?)
            ) AND start_time > NOW()
            ORDER BY start_time ASC;
        `;

        const [upcomingTests] = await pool.query(upcomingTestsQuery, [classIds]);
        return upcomingTests || [];
    } catch (error) {
        throw new Error("Error fetching upcoming tests: " + error.message);
    }
}


async function getRecentTestsForUser(username) {
    try {
        const idQuery = `SELECT id FROM users WHERE username = ?;`;
        const [idResult] = await pool.query(idQuery, [username]);

        if (!idResult || idResult.length === 0) {
            throw new Error("Student not found");
        }

        const classQuery = `SELECT class_id FROM enrollments WHERE user_id = ?;`;
        const [classResult] = await pool.query(classQuery, [idResult[0].id]);

        if (!classResult || classResult.length === 0) {
            return [];
        }

        const classIds = classResult.map(row => row.class_id);

        const recentTestsQuery = `
            SELECT * FROM tests 
            WHERE id IN (
                SELECT test_id FROM class_test WHERE class_id IN (?)
            ) AND end_time < NOW()
            ORDER BY end_time DESC;
        `;

        const [recentTests] = await pool.query(recentTestsQuery, [classIds]);
        return recentTests || [];
    } catch (error) {
        throw new Error("Error fetching recent tests: " + error.message);
    }
}

async function getTestsForUser(username) {
    try {
        const activeTests = await getActiveTestsForUser(username);
        const upcomingTests = await getUpcomingTestsForUser(username);
        const recentTests = await getRecentTestsForUser(username);

        return {
            activeTests,
            upcomingTests,
            recentTests,
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

async function getTeacherMetrics(username) {
    // metrics consist of number of classes, number of students, number of upcoming tests, number of recent tests
    try {
        const userQuery = 'SELECT id FROM users WHERE username = ?;';
        const [userRows] = await pool.query(userQuery, [username]);
        if (userRows.length === 0) {
            throw new Error("User not found");
        }
        const userId = userRows[0].id;
        // get number of classes, number of students, number of upcoming tests, number of recent tests
        // number of classes will be fetched from enrollments table, number of students will be fetched from enrollments table (enrollments contain both teachers and students), number of upcoming tests will be fetched from tests table, number of recent tests will be fetched from tests table
        // while fetching number of students we will confirm their role is student
        const query = `
        SELECT
            /* number of classes this user is enrolled in/teaching */
            (SELECT COUNT(DISTINCT e.class_id)
            FROM enrollments e
            WHERE e.user_id = ?) AS num_classes,

            /* number of *students* across those same classes */
            (SELECT COUNT(DISTINCT e2.user_id)
            FROM enrollments e2
            JOIN users u ON u.id = e2.user_id
            WHERE e2.class_id IN (
                SELECT class_id
                FROM enrollments
                WHERE user_id = ?
            )
            AND u.role = 'student'
            ) AS num_students,

            /* tests in those classes whose start_time is in the future */
            (SELECT COUNT(*)
            FROM tests t
            JOIN class_test ct ON t.id = ct.test_id
            WHERE ct.class_id IN (
                SELECT class_id
                FROM enrollments
                WHERE user_id = ?
            )
            AND t.start_time > NOW()
            ) AS num_upcoming_tests,

            /* tests in those classes whose end_time is in the past */
            (SELECT COUNT(*)
            FROM tests t
            JOIN class_test ct ON t.id = ct.test_id
            WHERE ct.class_id IN (
                SELECT class_id
                FROM enrollments
                WHERE user_id = ?
            )
            AND t.end_time < NOW()
            ) AS num_recent_tests;
        `;

        const [rows] = await pool.query(query, [userId, userId, userId, userId]);

        return rows[0];
    } catch (error) {
        throw new Error("Error fetching teacher metrics: " + error.message);
    }
}

async function getStudentsForTeacher(username) {
    // first get classes for the teacher, then get students for each class
    try {
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
        const [classRows] = await pool.query(query, [username]);
        if (classRows.length === 0) {
            throw new Error("No classes found for user");
        }
        const classIds = classRows.map(row => row.id);
        // get the students for each class
        const studentsQuery = `
            SELECT u.id, u.username, u.name, u.email 
            FROM users u
            JOIN enrollments e ON u.id = e.user_id
            WHERE e.class_id IN (?) AND u.role = 'student';
        `;
        const [studentRows] = await pool.query(studentsQuery, [classIds]);
        if (studentRows.length === 0) {
            throw new Error("No students found for user");
        }
        // map the students to their classes
        // get the students for each class in the classRows array there is no class_id in the studentRow
        // iterate over the classRows array and for each class, get the students for that class
        let studentsByClass = [];
        for (const classRow of classRows) {
            const classId = classRow.id;
            const studentQuery = `
                SELECT u.id, u.username, u.name, u.email
                FROM users u
                JOIN enrollments e ON u.id = e.user_id
                WHERE e.class_id = ? AND u.role = 'student';
            `
            const [students] = await pool.query(studentQuery, [classId]);
            if (students.length > 0) {
                studentsByClass.push({
                    class: classRow,
                    students: students
                });
            }
        }

        return studentsByClass;
    } catch (error) {
        throw new Error("Error fetching classes for user: " + error.message);
    }
}

async function getUpcomingTestsForClass(classId) {
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

async function getRecentTestPerformance(username) {
    // 1) lookup user
    const [userRows] = await pool.query(
        'SELECT id FROM users WHERE username = ?',
        [username]
    );
    if (!userRows.length) {
        throw new Error(`User “${username}” not found`);
    }

    // 2) fetch & sort the last 3 tests by end_time DESC
    let recentTests = await getRecentTestsForUser(username);
    recentTests = recentTests
        .sort(
            (a, b) => new Date(b.end_time) - new Date(a.end_time)
        )
        .slice(0, 3);

    // 3) for each of those, pull stats and top-scorer
    const performance = await Promise.all(
        recentTests.map(async (test) => {
            const testId = test.id;

            // a) avgScore & numStudents, aliased to camelCase
            const statsQuery = `
          SELECT
            COALESCE(AVG(total_marks), 0) AS avgScore,
            COALESCE(COUNT(*), 0)      AS numStudents
          FROM (
            SELECT student_id, SUM(marks_obtained) AS total_marks
            FROM student_results
            WHERE test_id = ?
            GROUP BY student_id
          ) AS student_scores;
        `;
            const [[{ avgScore, numStudents }]] = await pool.query(statsQuery, [testId]);
            const roundedAvgScore = parseFloat(avgScore.toFixed(2));

            // b) top-scorer + name in one go
            const topQuery = `
          SELECT
            u.name             AS studentName,
            SUM(sr.marks_obtained) AS totalMarks
          FROM student_results sr
          JOIN users u
            ON u.id = sr.student_id
          WHERE sr.test_id = ?
          GROUP BY sr.student_id
          ORDER BY totalMarks DESC
          LIMIT 1;
        `;
            const [topRows] = await pool.query(topQuery, [testId]);

            const topScorer = topRows.length
                ? `${topRows[0].studentName} (${parseFloat(topRows[0].totalMarks.toFixed(2))})`
                : "N/A";

            return {
                testName: test.test_name,
                numStudents,
                avgScore: roundedAvgScore,
                topScorer,
            };
        })
    );

    return performance;
}

async function getRecentTestsForClass(classId) {
    try {
        const query = `
            SELECT * FROM tests 
            WHERE id IN (
                SELECT test_id FROM class_test WHERE class_id = ?
            ) AND end_time < NOW()
            ORDER BY end_time DESC;
        `;
        const [rows] = await pool.query(query, [classId]);
        return rows;
    } catch (error) {
        throw new Error("Error fetching recent tests for class: " + error.message);
    }
}

async function getActiveTestsForClass(classId) {
    try {
        const query = `
            SELECT * FROM tests 
            WHERE id IN (
                SELECT test_id FROM class_test WHERE class_id = ?
            ) AND NOW() BETWEEN start_time AND end_time
            ORDER BY start_time ASC;
        `;
        const [rows] = await pool.query(query, [classId]);
        return rows;
    } catch (error) {
        throw new Error("Error fetching active tests for class: " + error.message);
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

async function getUserId(username) {
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
        
        // get end_time of the test
        const testQuery = `
        SELECT end_time FROM tests
        WHERE id = ?;
    `;
        const [testRows] = await pool.query(testQuery, [testId]);
        if (!testRows || testRows.length === 0) {
            throw new Error("Test not found");
        }
        const endTime = new Date(testRows[0].end_time);

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
                    INSERT INTO student_tests (student_id, test_id, start_time, is_submitted)
                    VALUES (?, ?, ?, false);
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
        return { testState, remainingTime, endTime };
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

async function initializeTest(studentId, testId) {
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

async function saveStudentTestResults(username, testId) {
    console.log("Saving student test results for user:", username, "for test ID:", testId);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // check if username exists in users table
        const userQuery = 'SELECT id FROM users WHERE username = ?;';
        const [userRows] = await connection.query(userQuery, [username]);
        if (userRows.length === 0) {
            throw new Error("User not found");
        }
        const studentId = userRows[0].id;

        // check if testId exists in tests table
        const testQuery = 'SELECT id FROM tests WHERE id = ?;';
        const [testRows] = await connection.query(testQuery, [testId]);
        if (testRows.length === 0) {
            throw new Error("Test not found");
        }

        // check if student has already submitted the test
        const studentTestQuery = `
            SELECT * FROM student_tests
            WHERE student_id = ? AND test_id = ?;
        `;
        const [studentTestRows] = await connection.query(studentTestQuery, [studentId, testId]);
        if (studentTestRows.length === 0) {
            throw new Error("Test not found for the student");
        }
        if (studentTestRows[0].is_submitted) {
            throw new Error("Test already submitted");
        }

        // update the student_tests table to set is_submitted to true
        const updateQuery = `
            UPDATE student_tests
            SET is_submitted = true
            WHERE student_id = ? AND test_id = ?;
        `;
        await connection.query(updateQuery, [studentId, testId]);

        // populate the student_results table according to responses of the student section-wise
        const sectionsQuery = `
            SELECT * FROM sections
            WHERE test_id = ?;
        `;
        const [sectionRows] = await connection.query(sectionsQuery, [testId]);
        if (!sectionRows || sectionRows.length === 0) {
            throw new Error(`No sections found for the test with ID ${testId}`);
        }

        for (const section of sectionRows) {
            const sectionId = section.id;
            const questionsQuery = `
                SELECT * FROM questions
                WHERE test_id = ? AND section_id = ?;
            `;
            const [questionRows] = await connection.query(questionsQuery, [testId, sectionId]);
            if (!questionRows || questionRows.length === 0) {
                throw new Error(`No questions found for the test with ID ${testId} and section ID ${sectionId}`);
            }

            // add student_id, test_id, section_id, marks_obtained (for that whole section) to student_results table
            let totalMarks = 0;
            for (const question of questionRows) {
                const questionId = question.id;
                const responseQuery = `
                    SELECT * FROM student_responses
                    WHERE student_id = ? AND question_id = ?;
                `;
                const [responseRows] = await connection.query(responseQuery, [studentId, questionId]);
                if (!responseRows || responseRows.length === 0) {
                    throw new Error(`No responses found for the test with ID ${testId}, section ID ${sectionId} and question ID ${questionId}`);
                }
                const responseRow = responseRows[0];
                totalMarks += responseRow.marks_obtained;
            }
            const insertQuery = `
                INSERT INTO student_results (student_id, test_id, section_id, marks_obtained)
                VALUES (?, ?, ?, ?);
            `;
            await connection.query(insertQuery, [studentId, testId, sectionId, totalMarks]);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw new Error("Error saving student test results: " + error.message);
    } finally {
        connection.release();
    }
}

async function getRecentTestScores(username) {
    try {
        const userQuery = 'SELECT id FROM users WHERE username = ?;';
        const [userRows] = await pool.query(userQuery, [username]);
        if (userRows.length === 0) {
            throw new Error("User not found");
        }
        const userId = userRows[0].id;
        // get the recent tests for the user
        const recentTests = await getRecentTestsForUser(username);
        if (recentTests.length === 0) {
            throw new Error("No recent tests found for user");
        }

        const testScores = await Promise.all(
            recentTests.map(async (test) => {
                const testId = test.id;
                // we have to calculate total marks obtained by the student in that test by summing up the marks obtained in each section of that test
                const totalMarksQuery = `
                    SELECT SUM(marks_obtained) AS total_marks
                    FROM student_results
                    WHERE student_id = ? AND test_id = ?;
                `;
                const [rows] = await pool.query(totalMarksQuery, [userId, testId]);
                if (rows.length === 0) {
                    throw new Error(`No marks found for the test with ID ${testId}`);
                }
                const totalMarks = rows[0].total_marks;
                return {
                    testName: test.test_name,
                    score: totalMarks ? totalMarks : 0,
                };
            })
        );
        return testScores;
    } catch (error) {
        throw new Error("Error fetching recent test scores: " + error.message);
    }
}

module.exports = {
    getTestsForUser,
    getActiveTestsForUser,
    getUpcomingTestsForUser,
    getRecentTestsForUser,
    getRecentTestPerformance,
    getClasses,
    getClassesForUser,
    getUpcomingTestsForClass,
    getRecentTestsForClass,
    getActiveTestsForClass,
    insertQuestion,
    getTestState,
    saveTestState,
    getTeacherMetrics,
    getStudentsForTeacher,
    saveStudentTestResults,
    getRecentTestScores
};
