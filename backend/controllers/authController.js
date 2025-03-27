const loadUsersFromExcel = require('../utils/excelReader');

const loginUser = (req, res) => {
    const { id, password, role } = req.body;
    const users = loadUsersFromExcel();  // Load user data

    const user = users.find(user => 
        user.Username === id && user.Password === password && user.Role === role
    );
    console.log(user);
    if (user) {
        res.json({ role: user.Role, dashboard: user["Dashboard_URL"] });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
};

module.exports = { loginUser };
