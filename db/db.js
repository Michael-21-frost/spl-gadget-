//===================== Database Connection ========================//
const mysql = require('mysql2');

// Create the pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Use the promise version of the pool
const promisePool = pool.promise();

module.exports = promisePool;  // Export the promise-based pool
