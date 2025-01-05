const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer'); // Import multer
const connection = require('./sqlconnection'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for handling form data
const upload = multer(); // Create an instance of multer

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Update the endpoint to /signup and use multer to handle the form data
app.post('/signup', upload.none(), async (req, res) => {
    const { name, email, phone, password } = req.body;

    // Debugging: Log the received data
    console.log('Received data:', { name, email, phone, password });

    // Check if the user already exists
    connection.query('SELECT * FROM chatUsers WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length > 0) {
            return res.status(400).send('User  already exists, Please Login');
        }

        // Hash the password
        try {
            if (!password) {
                throw new Error('Password is required');
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user into the database
            const newUser  = { name, email, phone, password: hashedPassword };
            connection.query('INSERT INTO chatUsers SET ?', newUser , (err, results) => {
                if (err) {
                    console.error('Error saving user:', err);
                    return res.status(500).send('Internal server error');
                }
                res.status(201).send('Successfully signed up!');
            });
        } catch (hashError) {
            console.error('Error hashing password:', hashError);
            return res.status(500).send('Internal server error');
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});