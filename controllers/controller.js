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

        const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
        res.json({ token });
    });
};