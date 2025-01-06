const connection = require('./sqlconnection');

// SQL query to create chatUsers table
const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS chatUsers (                    
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(15) NOT NULL,
        password VARCHAR(255) NOT NULL
    );
`;

// SQL query to create messages table
const createMessagesTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES chatUsers(id) ON DELETE CASCADE
    );
`;

// SQL query to create activeUsers table
const createActiveUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS activeUsers (
        userId INT NOT NULL,
        loginTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES chatUsers(id) ON DELETE CASCADE,
        PRIMARY KEY (userId)
    );
`;

// Create chatUsers table
connection.query(createUsersTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating chatUsers table:', err);
        return;
    }
    console.log('chatUsers table created successfully:', result);
});

// Create messages table
connection.query(createMessagesTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating messages table:', err);
        return;
    }
    console.log('messages table created successfully:', result);
});

// Create activeUsers table
connection.query(createActiveUsersTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating activeUsers table:', err);
        return;
    }
    console.log('activeUsers table created successfully:', result);
});

// Close the connection
connection.end();