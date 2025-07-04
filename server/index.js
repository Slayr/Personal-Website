const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const blogRoutes = require('./routes/blog');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/blog', blogRoutes);

app.get('/', (req, res) => {
  res.send('Personal Website Backend is running!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}. Access it from other devices on the network via the Pi's IP address.`);
});
