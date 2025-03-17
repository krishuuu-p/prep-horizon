const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const loadUsersFromExcel = () => {
    const workbook = xlsx.readFile('users.xlsx');  // Read the file
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(sheet);  // Convert to JSON
};

app.post('/login', (req, res) => {
    const { id, password, role } = req.body;

    const users = loadUsersFromExcel();  // Load user data
    const user = users.find(user => user.Username === id && user.Password === password && user.Role === role);

    if (user) {
        res.json({ role: user.Role, dashboard: user["Dashboard_URL"] });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});