const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = 5000;
const EXCEL_FILE = 'users.xlsx'; // Ensure this file is in the same folder or update the path

app.use(cors());
app.use(express.json());

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

// Registration endpoint: Save new user details after checking for duplicates
app.post('/register', (req, res) => {
  const { username, email, password, role, dashboard } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "Username, email, password, and role are required." });
  }
  
  const users = loadUsersFromExcel();
  const existingUser = users.find(u => u.Username === username || u.Email === email);
  if (existingUser) {
    return res.status(409).json({ message: "User with that username or email already exists." });
  }
  
  const newUser = {
    Username: username,
    Password: password,  // In production, hash the password before storing
    Role: role,
    Dashboard_URL: dashboard || `/${role}`, // Default dashboard URL based on role
    Email: email
  };
  
  users.push(newUser);
  saveUsersToExcel(users);
  
  return res.status(201).json({ message: "User registered successfully." });
});

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
    return res.json({
      role: user.Role,
      dashboard: user.Dashboard_URL
    });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
