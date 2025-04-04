const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const xlsx = require('xlsx');
const fs = require('fs');
const FormData = require('form-data');
const queries = require("./Queries");
const path = require("path");
const app = express();
const PORT = 5002;
const EXCEL_FILE = 'users.xlsx'; // Ensure this file is in the same folder or update the path
const FLASK_API_URL = "http://127.0.0.1:5001/process-pdf";
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // For password hashing
const saltRounds = 10;

// Multer storage setup for file uploads for student and teacher management
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

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
  user: 'root',
  password: 'Prephorizon@123', // Replace with your MySQL password
  database: 'prep_horizon'
});

db.connect((err) => {
  if (err) {
      console.error('Database connection failed:', err);
  } else {
      console.log('Connected to MySQL database.');
  }
});

// Route to save student responses
app.post("/student/submit-test", async (req, res) => {
    try {
        const { student_id, test_id, responses } = req.body;
        const result = await queries.saveStudentResponses(student_id, test_id, responses);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route to get questions for a test
app.get("/test/questions/:test_id", async (req, res) => {
    try {
        const questions = await queries.getQuestionsForTest(req.params.test_id);
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API to handle PDF uploads & send to Flask
app.post("/upload-pdf", upload.single("file"), async (req, res) => {
  try {
      const form = new FormData();
      // If file is provided, append it
      if (req.file) {
          form.append("file", fs.createReadStream(req.file.path), req.file.originalname);
      }
      // Append URL and manual text if provided
      if (req.body.url) {
          form.append("url", req.body.url);
      }
      if (req.body.manual_text) {
          form.append("manual_text", req.body.manual_text);
      }

      // Forward the form data to the Flask API
      const response = await axios.post(FLASK_API_URL, form, {
          headers: form.getHeaders()
      });

      // Clean up the uploaded file if it was saved locally
      if (req.file) {
          fs.unlinkSync(req.file.path);
      }

      res.json(response.data);
  } catch (error) {
      console.error("Error processing input:", error);
      res.status(500).json({ message: "Failed to process input" });
  }
});

// Utility: Load users from the Excel file
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

      // Compare the hashed password with the entered password

      const match = await bcrypt.compare(password, user.password);
    //   const match = (password == user.password);
      if (!match) {
          return res.status(603).json({ message: "Invalid credentials" });
      }

      return res.json({ message: "Login successful", Name: user.name });
  });
});

// Retrieve Password endpoint: Given an email, return the stored password
// WARNING: Returning plaintext passwords is insecure and only for demonstration.
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
    if (!value || isNaN(value)) return value; // Return as-is if not a valid number
    return new Date((value - 25569) * 86400 * 1000).toISOString(); // Convert to ISO format
}

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

// Add a single student (Form Submission)
app.post("/add-student", async (req, res) => {
  const { username, password, name, email } = req.body;

  if (!username || !password || !name || !email) {
      return res.status(400).json({ message: "All fields are required" });
  }

  try {
      // Hash the password before storing
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

// Add multiple students (Excel Upload)
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

          // Hash the password before inserting into the database
          const hashedPassword = await bcrypt.hash(password, 10);

          const query = "INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, 'student')";
          db.query(query, [username, hashedPassword, name, email], (err, result) => {
              if (err) {
                  console.error(`Error inserting ${username}:`, err);
              }
          });
      }

      // Remove the uploaded file after processing
      fs.unlinkSync(filePath); 

      res.status(201).json({ message: `Students added successfully.` });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
  }
});

// Add a single teacher (Form Submission)
app.post("/add-teacher", async (req, res) => {
    const { username, password, name, email } = req.body;
  
    if (!username || !password || !name || !email) {
        return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
        // Hash the password before storing
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
  
// Add multiple teachers (Excel Upload)
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

        // Hash the password before inserting into the database
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, 'teacher')";
        db.query(query, [username, hashedPassword, name, email], (err, result) => {
            if (err) {
                console.error(`Error inserting ${username}:`, err);
            }
        });
    }

    // Remove the uploaded file after processing
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});