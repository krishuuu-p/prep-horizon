const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',      // Change if using a remote DB
    user: 'root',           // Replace with your MySQL username
    password: `${process.env.MYSQL_PASSWORD}`,           // Replace with your MySQL password
    database: 'prep_horizon', // Replace with your DB name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise(); // Use promise-based queries
