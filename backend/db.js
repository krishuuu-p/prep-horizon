const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',      // Change if using a remote DB
    user: 'root',           // Replace with your MySQL username
    password: 'prep123',           // Replace with your MySQL password
    database: 'prep_horizon', // Replace with your DB name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise(); // Use promise-based queries
