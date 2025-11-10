const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

const path = require('path');
const usersFile = path.join(__dirname, 'users.json');

const readUsers = () => {
    try {
        const content = fs.readFileSync(usersFile, 'utf8');
        return content ? JSON.parse(content) : [];
    } catch (err) {
        fs.writeFileSync(usersFile, '[]');
        return [];
    }
};
const saveUsers = (data) => fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));

// Registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.username === username))
    return res.status(400).json({ message: 'User already exists' });

  const hash = bcrypt.hashSync(password, 10);
  users.push({ username, password: hash });
  saveUsers(users);
  res.json({ message: 'Registration successful!' });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Invalid credentials, try again' });

  res.cookie('session', username, { httpOnly: true });
  res.json({ message: 'Login successful!' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
