const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const xlsx = require('xlsx');
const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');
const FormData = require('form-data');
const queries = require("./Queries");
const path = require("path");
const app = express();
require('dotenv').config();

const PORT = process.env.PORT
const EXCEL_FILE = 'users.xlsx'; 
const FLASK_API_URL = "http://127.0.0.1:5001/process-pdf";

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const upload = multer({ dest: "uploads/" });
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const io = new Server(server, {
    cors: {
     origin: ['http://localhost:3000', 'http://10.81.65.73:3000'],
      methods: ["GET", "POST"]
    }
  });
  
  const usersInRoom = {};
  
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
  
    socket.on("join-room", (roomId) => {
      console.log(`${socket.id} joined ${roomId}`);
      socket.join(roomId);
  
      if (!usersInRoom[roomId]) {
        usersInRoom[roomId] = [];
      }
  
      usersInRoom[roomId].push(socket.id);
  
      const otherUsers = usersInRoom[roomId].filter((id) => id !== socket.id);
      if (otherUsers.length > 0) {
        socket.emit("user-joined", otherUsers[0]); // Tell this user who to call
      }
  
      // Optional cleanup
      socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`);
        usersInRoom[roomId] = usersInRoom[roomId].filter((id) => id !== socket.id);
      });
    });
  
    socket.on("sending-signal", (payload) => {
      io.to(payload.userToSignal).emit("user-signal", {
        signal: payload.signal,
        callerID: payload.callerID
      });
    });
  
    socket.on("returning-signal", (payload) => {
      io.to(payload.callerID).emit("receiving-returned-signal", {
        signal: payload.signal,
        id: socket.id
      });
    });
  });
  
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const uploadUsers = multer({ storage: storage });

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: `${process.env.MYSQL_PASSWORD}`,
    database: 'prep_horizon'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database.');
    }
});

app.post("/student/submit-test", async (req, res) => {
    try {
        const { student_id, test_id, responses } = req.body;
        const result = await queries.saveStudentResponses(student_id, test_id, responses);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get("/test/questions/:test_id", async (req, res) => {
    try {
        const questions = await queries.getQuestionsForTest(req.params.test_id);
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/upload-pdf", upload.single("file"), async (req, res) => {
    try {
        const form = new FormData();
        if (req.file) {
            form.append("file", fs.createReadStream(req.file.path), req.file.originalname);
        }

        if (req.body.url) {
            form.append("url", req.body.url);
        }
        if (req.body.manual_text) {
            form.append("manual_text", req.body.manual_text);
        }

        const response = await axios.post(FLASK_API_URL, form, {
            headers: form.getHeaders()
        });

        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.json(response.data);
    } catch (error) {
        console.error("Error processing input:", error);
        res.status(500).json({ message: "Failed to process input" });
    }
});

function loadUsersFromExcel() {
    try {
        if (fs.existsSync(EXCEL_FILE)) {
            const workbook = xlsx.readFile(EXCEL_FILE);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            return xlsx.utils.sheet_to_json(sheet);
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error reading Excel file:", error);
        return [];
    }
}

app.post('/login', (req, res) => {
    const { id, password, role } = req.body;

    if (!id || !password || !role) {
        return res.status(600).json({ message: "All fields are required" });
    }

    const query = `
      SELECT id, name, username, email, password, role 
      FROM users 
      WHERE (username = ? OR email = ?) AND role = ?
  `;

    db.query(query, [id, id, role], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(601).json({ message: "Server error" });
        }

        if (results.length === 0) {
            return res.status(602).json({ message: "Invalid credentials" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(603).json({ message: "Invalid credentials" });
        }

        return res.json({ message: "Login successful", Name: user.name });
    });
});

app.post('/retrieve-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    const users = loadUsersFromExcel();
    const user = users.find(u => u.Email === email);

    if (!user) {
        return res.status(404).json({ message: "Email not found." });
    }

    return res.json({ password: user.Password });
});

const TEST_FILE = 'testData.xlsx';

function parseExcelDate(value) {
    if (!value || isNaN(value)) return value;
    return new Date((value - 25569) * 86400 * 1000).toISOString();
}

app.get("/get-classes", async (req, res) => {
    try {
        const classes = await queries.getClasses();
        res.json({ classes });
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ message: "Error fetching classes" });
    }
});

app.get("/get-upcoming-tests/:classId", async (req, res) => {
    try {
        const { classId } = req.params;
        const tests = await queries.getTestsForClass(classId);
        res.json({ tests });
    } catch (error) {
        console.error("Error fetching tests:", error);
        res.status(500).json({ message: "Error fetching tests" });
    }
});

app.get("/api/tests/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const tests = await queries.getTestsForStudent(studentId);
        res.json(tests);
    } catch (error) {
        console.error("Error fetching tests:", error);
        res.status(500).json({ message: "Error fetching test data" });
    }
});

app.post("/upload-test-data", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const tests = xlsx.utils.sheet_to_json(sheet, { raw: false });
        const username = req.body.username;

        const idResult = await new Promise((resolve, reject) => {
            const query = `SELECT id FROM users WHERE username = ?;`;
            db.query(query, [username], (err, results) => {
                if (err) {
                    console.error("Error fetching user:", err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        if (!idResult || idResult.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = idResult[0].id;

        if (tests.length === 0) {
            return res.status(400).json({ message: "Empty file or invalid format" });
        }

        for (const test of tests) {
            const { test_name, start_time, end_time, total_marks, classes } = test;
            if (!test_name || !classes || !start_time || !end_time || !total_marks) {
                return res.status(400).json({ message: "Missing fields in uploaded file" });
            }

            const class_codes = classes.split(",").map(c => c.trim());
            const classIds = await new Promise((resolve, reject) => {
                const query = "SELECT id FROM classes WHERE class_code IN (?)";
                db.query(query, [class_codes], (err, results) => {
                    if (err) {
                        console.error("Error fetching class IDs:", err);
                        return reject(err);
                    }
                    resolve(results.map(row => row.id));
                });
            });

            const startDate = parseExcelDate(start_time);
            const endDate = parseExcelDate(end_time);
            const totalMarks = parseInt(total_marks, 10);

            const testInsertQuery = "INSERT INTO tests (test_name, start_time, end_time, total_marks, created_by) VALUES (?, ?, ?, ?, ?)";
            const testInsertResult = await new Promise((resolve, reject) => {
                db.query(testInsertQuery, [test_name, startDate, endDate, totalMarks, userId], (err, result) => {
                    if (err) {
                        console.error(`Error inserting test ${test_name}:`, err);
                        return reject(err);
                    }
                    resolve(result);
                });
            });
            const testId = testInsertResult.insertId;
            
            const classTestQuery = "INSERT INTO class_test (class_id, test_id) VALUES (?, ?)";
            for (const classId of classIds) {
                await new Promise((resolve, reject) => {
                    db.query(classTestQuery, [classId, testId], (err, result) => {
                        if (err) {
                            console.error(`Error inserting test-class relationship:`, err);
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
            }
        }

        // Remove the uploaded file after processing
        fs.unlinkSync(filePath);
        res.status(201).json({ message: "Tests added successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("upload-questions", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    try {
        const { getQuestionsFromDoc } = require("./utils");
        const { classId, testId } = req.body;
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        const questions = getQuestionsFromDoc(filePath);

        for (const question of questions) {
            const query = `
                INSERT INTO questions (test_id, section_id, ques_text, ques_img_url, ques_type, 
                correct_answer, positive_marks, negative_marks) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `;
            const { section_id, ques_text, ques_img_url, ques_type, correct_answer, positive_marks, negative_marks } = question;
            db.query(query, [testId, section_id, ques_text, ques_img_url, ques_type, correct_answer, positive_marks, negative_marks], (err, result) => {
                if (err) {
                    console.error(`Error inserting question:`, err);
                }
            });
        }

        fs.unlinkSync(filePath);
        res.status(201).json({ message: `Questions added successfully.` });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/add-student", async (req, res) => {
    const { username, password, name, email } = req.body;

    if (!username || !password || !name || !email) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, 'student')";
        db.query(query, [username, hashedPassword, name, email], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error adding student" });
            }
            res.status(201).json({ message: "Student added successfully" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/upload-students", uploadUsers.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const students = xlsx.utils.sheet_to_json(sheet);

        if (students.length === 0) {
            return res.status(400).json({ message: "Empty file or invalid format" });
        }

        for (const student of students) {
            const { username, password, name, email } = student;

            if (!username || !password || !name || !email) {
                return res.status(400).json({ message: "Missing fields in uploaded file" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const query = "INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, 'student')";
            db.query(query, [username, hashedPassword, name, email], (err, result) => {
                if (err) {
                    console.error(`Error inserting ${username}:`, err);
                }
            });
        }

        fs.unlinkSync(filePath);

        res.status(201).json({ message: `Students added successfully.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/add-teacher", async (req, res) => {
    const { username, password, name, email } = req.body;

    if (!username || !password || !name || !email) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, 'teacher')";
        db.query(query, [username, hashedPassword, name, email], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error adding teacher" });
            }
            res.status(201).json({ message: "Teacher added successfully" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/upload-teachers", uploadUsers.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const teachers = xlsx.utils.sheet_to_json(sheet);

        if (teachers.length === 0) {
            return res.status(400).json({ message: "Empty file or invalid format" });
        }

        for (const teacher of teachers) {
            const { username, password, name, email } = teacher;

            if (!username || !password || !name || !email) {
                return res.status(400).json({ message: "Missing fields in uploaded file" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const query = "INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, 'teacher')";
            db.query(query, [username, hashedPassword, name, email], (err, result) => {
                if (err) {
                    console.error(`Error inserting ${username}:`, err);
                }
            });
        }

        fs.unlinkSync(filePath);

        res.status(201).json({ message: `Teachers added successfully.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/edit-user/:username", async (req, res) => {
    const { username } = req.params;
    const { name, email, password } = req.body;

    if (!username || (!name && !email && !password)) {
        return res.status(400).json({ message: "Provide at least one field to update" });
    }

    try {
        let updates = [];
        let values = [];

        if (name) {
            updates.push("name = ?");
            values.push(name);
        }
        if (email) {
            updates.push("email = ?");
            values.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push("password = ?");
            values.push(hashedPassword);
        }

        values.push(username);
        const query = `UPDATE users SET ${updates.join(", ")} WHERE username = ?`;

        db.query(query, values, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error updating user" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ message: "User updated successfully" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/upload-edit-users", uploadUsers.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const users = xlsx.utils.sheet_to_json(sheet);

        let errorList = [];

        for (const user of users) {
            const { username, name, email, password } = user;

            if (!username) {
                errorList.push("Username missing for a student record");
                continue;
            }

            let updates = [];
            let values = [];

            if (name) {
                updates.push("name = ?");
                values.push(name);
            }
            if (email) {
                updates.push("email = ?");
                values.push(email);
            }
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.push("password = ?");
                values.push(hashedPassword);
            }

            if (updates.length === 0) {
                errorList.push(`No fields to update for ${username}`);
                continue;
            }

            values.push(username);
            const query = `UPDATE users SET ${updates.join(", ")} WHERE username = ?`;

            db.query(query, values, (err, result) => {
                if (err || result.affectedRows === 0) {
                    errorList.push(`Error updating ${username}: ${err?.message || "Not found"}`);
                }
            });
        }

        fs.unlinkSync(filePath);
        res.json({ message: `Users updated successfully.`, errors: errorList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/delete-user/:username", (req, res) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    const query = "DELETE FROM users WHERE username = ?";
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error deleting user" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    });
});

app.post("/upload-delete-users", uploadUsers.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const users = xlsx.utils.sheet_to_json(sheet);

        let errorList = [];

        for (const user of users) {
            const { username } = user;

            if (!username) {
                errorList.push("Missing username for deletion");
                continue;
            }

            const query = "DELETE FROM users WHERE username = ?";
            db.query(query, [username], (err, result) => {
                if (err || result.affectedRows === 0) {
                    errorList.push(`Error deleting ${username}: ${err?.message || "Not found"}`);
                }
            });
        }

        fs.unlinkSync(filePath);
        res.json({ message: `Deleted users successfully.`, errors: errorList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


app.post("/add-class", async (req, res) => {
    const { class_code, class_name, description } = req.body;
  
    if (!class_code || !class_name) {
        return res.status(400).json({ message: "Class Code and Class Name fields are required" });
    }
  
    try {
        
        const query = "INSERT INTO classes (class_code, class_name, description) VALUES (?, ?, ?)";
        db.query(query, [class_code, class_name, description], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error creating class." });
            }
            res.status(201).json({ message: "Class created successfully" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/edit-class/:class_code", async (req, res) => {
    const {class_code} = req.params;
    const {class_name, description} = req.body;

    if(!class_code || (!class_name && !description)){
        return res.status(400).json({message: "Provide at least one field to update"})
    }

    try{
        let updates = [];
        let values = [];

        if(class_name){
            updates.push("class_name = ?");
            values.push(class_name);
        }

        if(description){
            updates.push("description = ?");
            values.push(description);
        }

        values.push(class_code);
        const query = `UPDATE classes SET ${updates.join(", ")} WHERE class_code = ?`;

        db.query(query, values, (err, result) => {
            if(err) {
                console.error(err);
                return res.status(500).json({message: "Error updating class"});
            }
            if (result.affectedRows === 0){
                return res.status(404).json({message: "Class not found"});
            }
            res.json({message: "Class updated successfully"});
        });
    } catch (error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
  });


  app.post("/delete-class/:class_code", async (req,res) => {
    const {class_code} = req.params;
    
    if(!class_code) {
        return res.status(400).json({message: "Class code is required"});
    }

    const query = `DELETE FROM classes WHERE class_code = ?`;
    db.query(query, [class_code], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({message: "Error deleting class"});
        }
        if (result.affectedRows === 0) {
            return res.status(500).json({message: "Class not found"});
        }
        res.json({message: "Class deleted successfully"});
    });
  });


  app.post("/add-users-to-class", uploadUsers.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const users = xlsx.utils.sheet_to_json(sheet);
        const { class_code } = req.body;

        if(!class_code){
            return res.status(400).json({message: "Class Code is required"});
        }

        if (users.length === 0) {
            return res.status(400).json({ message: "Empty file or invalid format" });
        }

        const dbQuery = (sql, params) => {
            return new Promise((resolve, reject) => {
                db.query(sql, params, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        };

        const classResults = await dbQuery("SELECT id FROM classes WHERE class_code = ?", [class_code]);

        if (classResults.length === 0) {
            return res.status(404).json({ message: "Class not found." });
        }

        const class_id = classResults[0].id;

        for (const user of users) {
            const { username } = user;

            if (!username) {
                return res.status(400).json({ message: "Missing field - username" });
            }

            const userResults = await dbQuery("SELECT id FROM users WHERE username = ?", [username]);

            if (userResults.length === 0) {
                console.warn(`User not found: ${username}`);
                continue;
            }

            const user_id = userResults[0].id;

            try {
                await dbQuery("INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)", [user_id, class_id]);
            } catch (insertError) {
                console.error(`Error adding ${username}:`, insertError);
            }
        }

        fs.unlinkSync(filePath);
        res.status(201).json({ message: "Users added successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


app.post("/remove-users-from-class", uploadUsers.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const users = xlsx.utils.sheet_to_json(sheet);
        const { class_code } = req.body;

        if(!class_code){
            return res.status(400).json({message: "Class Code is required"});
        }

        if (users.length === 0) {
            return res.status(400).json({ message: "Empty file or invalid format" });
        }

        const dbQuery = (sql, params) => {
            return new Promise((resolve, reject) => {
                db.query(sql, params, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        };

        const classResults = await dbQuery("SELECT id FROM classes WHERE class_code = ?", [class_code]);

        if (classResults.length === 0) {
            return res.status(404).json({ message: "Class not found." });
        }

        const class_id = classResults[0].id;

        for (const user of users) {
            const { username } = user;

            if (!username) {
                return res.status(400).json({ message: "Missing field - username" });
            }

            const userResults = await dbQuery("SELECT id FROM users WHERE username = ?", [username]);

            if (userResults.length === 0) {
                console.warn(`User not found: ${username}`);
                continue; 
            }

            const user_id = userResults[0].id;

            try {
                await dbQuery("DELETE FROM enrollments WHERE student_id = ? AND class_id = ?", [user_id, class_id]);
            } catch (deleteError) {
                console.error(`Error removing ${username} from class:`, deleteError);
            }
        }

        fs.unlinkSync(filePath);
        res.status(200).json({ message: "Users removed successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});