const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../sqlconnection');
require('dotenv').config();

// Signup Controller
exports.signup = async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!password) {
        return res.status(400).send('Password is required');
    }

    connection.query('SELECT * FROM chatUsers WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length > 0) {
            return res.status(400).send('Email ID already registered');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser  = { name, email, phone, password: hashedPassword };

            connection.query('INSERT INTO chatUsers SET ?', newUser , (err, results) => {
                if (err) {
                    console.error('Error saving user:', err);
                    return res.status(500).send('Internal server error');
                }
                res.redirect('/login');
            });
        } catch (hashError) {
            console.error('Error hashing password:', hashError);
            return res.status(500).send('Internal server error');
        }
    });
};

// Login Controller
exports.login = async (req, res) => {
    const { email, password } = req.body;

    connection.query('SELECT * FROM chatUsers WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length === 0) {
            return res.status(404).send('User  not found');
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send('User  not authorized');
        }

        const token = jwt.sign({ id: user.id, name: user.name }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
      // Insert user into activeUsers table
      connection.query('INSERT INTO activeUsers (userId) VALUES (?) ON DUPLICATE KEY UPDATE loginTime = CURRENT_TIMESTAMP', [user.id], (err) => {
        if (err) {
            console.error('Error inserting into activeUsers:', err);
            return res.status(500).send('Internal server error');
        }
        res.json({ token });
    });
});
};

// Logout Controller
exports.logout = (req, res) => {
    const userId = req.user.id; 

    connection.query('DELETE FROM activeUsers WHERE userId = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error logging out user:', err);
            return res.status(500).send('Internal server error');
        }
        res.status(200).send('Logged out successfully');
    });
};

// Fetch Active Users Controller
exports.getUsers = (req, res) => {
    connection.query('SELECT chatUsers.id, chatUsers.name FROM activeUsers JOIN chatUsers ON activeUsers.userId = chatUsers.id', (err, results) => {
        if (err) {
            console.error('Error fetching active users:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results); 
    });
};

// Send Message Controller
exports.sendMessage = (req, res) => {
    const { message } = req.body;
    const userId = req.user.id; 
    const newMessage = { userId, message, timestamp: new Date() };
    connection.query('INSERT INTO messages SET ?', newMessage, (err) => {
        if (err) {
            console.error('Error saving message:', err);
            return res.status(500).send('Internal server error');
        }
        res.status(200).send('Message sent');
    });
};

// Fetch All Messages Controller
exports.getMessages = (req, res) => {
    connection.query('SELECT messages.id, messages.message, messages.timestamp, chatUsers.name FROM messages JOIN chatUsers ON messages.userId = chatUsers.id ORDER BY messages.timestamp ASC', (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results); 
    });
};