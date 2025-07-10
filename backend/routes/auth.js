const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Import the SQLite database instance

// Login User
router.post('/login', async (req, res) => {
  const { password } = req.body; // Only expect password

  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET not set in environment variables.');
      return res.status(500).send('Server configuration error.');
    }

    // Retrieve the admin user from the database
    const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');

    if (!adminUser) {
      // This should ideally not happen if db.js initializes the admin user
      console.error('Admin user not found in database.');
      return res.status(500).send('Server configuration error.');
    }

    // Compare provided password with the hashed password from the database
    const isMatch = await bcrypt.compare(password, adminUser.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: adminUser.id, // Use the actual ID from the database
      },
    };
    console.log('adminUser.id:', adminUser.id);

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;