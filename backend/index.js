const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const xlsx = require('xlsx');
const fs = require('fs');
const FormData = require('form-data');
const app = express();
const PORT = 5000;
const EXCEL_FILE = 'users.xlsx'; // Ensure this file is in the same folder or update the path
const FLASK_API_URL = "http://127.0.0.1:5001/process-pdf";
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // For password hashing

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
  user: 'root',
  password: 'prep123', // Replace with your MySQL password
  database: 'prep_horizon'
});

db.connect((err) => {
  if (err) {
      console.error('Database connection failed:', err);
  } else {
      console.log('Connected to MySQL database.');
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

// Utility: Save users to the Excel file
function saveUsersToExcel(users) {
  try {
    const worksheet = xlsx.utils.json_to_sheet(users);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Users');
    xlsx.writeFile(workbook, EXCEL_FILE);
  } catch (error) {
    console.error("Error writing to Excel file:", error);
  }
}

// Login endpoint: Authenticate user by username/email, password, and role
app.post('/login', (req, res) => {
  const { id, password, role } = req.body;
  const users = loadUsersFromExcel();
  const user = users.find(u =>
    (u.Username === id || u.Email === id) &&
    u.Password === password &&
    u.Role === role
  );
  
  if (user) {
    const Name = user.Name;
    return res.json({ message: "Login successful", Name });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

app.post('/register', (req, res) => {
  
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

app.get('/api/tests', (req, res) => {
    try {
        if (!fs.existsSync(TEST_FILE)) {
            return res.status(404).json({ message: "Test data file not found" });
        }

        const workbook = xlsx.readFile(TEST_FILE);
        const sheets = workbook.Sheets;

        function processSheet(sheet) {
            if (!sheet) return [];
            let json = xlsx.utils.sheet_to_json(sheet, { raw: false });
            return json.map(test => ({
                ...test,
                "Start Date": parseExcelDate(test["Start Date"]),
                "Start Time": parseExcelDate(test["Start Time"]),
                "End Date": parseExcelDate(test["End Date"]),
                "End Time": parseExcelDate(test["End Time"])
            }));
        }

        const activeTests = processSheet(sheets["Active Tests"]);
        const upcomingTests = processSheet(sheets["Upcoming Tests"]);
        const recentTests = processSheet(sheets["Recent Tests"]);

        res.json({ activeTests, upcomingTests, recentTests });
    } catch (error) {
        console.error("Error reading test file:", error);
        res.status(500).json({ message: "Error loading test data" });
    }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});