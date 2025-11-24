require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

const usersFile = path.join(__dirname, 'users.json');

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your 2FA OTP Code',
      html: `
        <h2>Two-Factor Authentication</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email sending error:', err);
    return false;
  }
};

app.post('/register', (req, res) => {
  const { email, username, password } = req.body;
  const users = readUsers();

  if ((users.find(u => u.email === email)) || (users.find(u => u.username === username)))
    return res.status(400).json({ message: 'User already exists' });

  const hash = bcrypt.hashSync(password, 10);
  users.push({ email, username, password: hash, twoFAEnabled: false, otpSecret: null });
  saveUsers(users);
  res.json({ message: 'Registration successful!' });
});

app.post('/login', async (req, res) => {
  const { email, username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Invalid credentials, try again' });

  // Generate OTP and send via email
  const otp = generateOTP();
  const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Store OTP temporarily in user object
  const userIndex = users.findIndex(u => u.username === username);
  users[userIndex].pendingOTP = otp;
  users[userIndex].otpExpiry = otpExpiry;
  saveUsers(users);

  const emailSent = await sendOTPEmail(email, otp);

  if (!emailSent) {
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }

  res.json({ message: 'OTP sent to your email', requiresOTP: true, email });
});

// OTP Verification
app.post('/verify-otp', (req, res) => {
  const { username, otp } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  if (!user.pendingOTP || Date.now() > user.otpExpiry) {
    return res.status(401).json({ message: 'OTP expired. Please login again.' });
  }

  if (user.pendingOTP !== otp) {
    return res.status(401).json({ message: 'Invalid OTP' });
  }

  const userIndex = users.findIndex(u => u.username === username);
  delete users[userIndex].pendingOTP;
  delete users[userIndex].otpExpiry;
  saveUsers(users);

  res.cookie('session', user.email, { httpOnly: true });
  res.json({ message: 'Login successful!' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
