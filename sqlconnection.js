// sqlConnection.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: 'Rajran@21210703', // replace with your MySQL password
    database: 'node-connect' // replace with your database name
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

module.exports = connection;