const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/', (req, res) => {
    const { name, email, phone, password } = req.body
    console.log('User  signed up:', { name, email, phone, password });
    res.send('Sign up successful!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
