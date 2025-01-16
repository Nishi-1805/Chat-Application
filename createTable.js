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

// SQL query to create Groups table
const createGroupsTableQuery = `
    CREATE TABLE IF NOT EXISTS \`Groups\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        admin_id INT NOT NULL,  
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES chatUsers(id) ON DELETE CASCADE  
    );
`;

// SQL query to create GroupMembers table
const createGroupMembersTableQuery = `
    CREATE TABLE IF NOT EXISTS GroupMembers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES \`Groups\`(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES chatUsers(id) ON DELETE CASCADE
    );
`;

// SQL query to create GroupMessages table
const createGroupMessagesTableQuery = `
    CREATE TABLE IF NOT EXISTS GroupMessages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES \`Groups\`(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES chatUsers(id) ON DELETE CASCADE
    );
`;

// SQL query to create GroupInvitations table
const createGroupInvitationsQuery = `
CREATE TABLE IF NOT EXISTS GroupInvitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES \`Groups\`(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES chatUsers(id) ON DELETE CASCADE
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

// Create Groups table
connection.query(createGroupsTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating Groups table:', err);
        return;
    }
    console.log('Groups table created successfully:', result);
});

// Create GroupMembers table
connection.query(createGroupMembersTableQuery, (err, result) => {
    if ( err) {
        console.error('Error creating GroupMembers table:', err);
        return;
    }
    console.log('GroupMembers table created successfully:', result);
});

// Create GroupMessages table
connection.query(createGroupMessagesTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating GroupMessages table:', err);
        return;
    }
    console.log('GroupMessages table created successfully:', result);
});

// Create GroupInvitations table
connection.query(createGroupInvitationsQuery, (err, result) => {
    if (err) {
        console.error('Error creating GroupInvitations table:', err);
        return;
    }
    console.log('GroupInvitations table created successfully:', result);
});

// Close the connection
connection.end();