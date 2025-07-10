require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import cors
const path = require('path'); // Add path module
const app = express();
const port = process.env.PORT || 5000;

require('./db'); // Initialize SQLite database

app.use(express.json());
app.use(cors()); // Use cors middleware

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/photos', require('./routes/photos'));

app.get('/', (req, res) => {
  res.send('Personal Website Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
