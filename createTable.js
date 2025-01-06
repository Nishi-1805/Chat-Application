const connection = require('./sqlconnection');

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS chatUsers (                    
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL
);

`;

connection.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        return;
    }
    console.log('Table created successfully:', result);
});

connection.end();