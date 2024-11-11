const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const connection = require('./sqlconnection'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/', async (req, res) => {
    const { name, email, phone, password } = req.body;

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
                res.status(201).send('Sign up successful!');
            });
        } catch (hashError) {
            console.error('Error hashing password:', hashError);
            return res.status(500).send('Internal server error');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
