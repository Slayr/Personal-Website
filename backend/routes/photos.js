const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('../db'); // Import the SQLite database instance
const auth = require('../middleware/authMiddleware');

// Set up multer storage
const storage = multer.memoryStorage(); // Store file in memory as a Buffer
const upload = multer({ storage: storage });

// @route   POST /api/photos/upload
// @desc    Upload a photo, convert to JPEG, extract metadata
// @access  Private (Admin)
router.post('/upload', auth, upload.single('photo'), async (req, res) => {
  const { source } = req.body; // 'portfolio' or 'blog'
  console.log('req.user.id (photo POST):', req.user.id, 'typeof:', typeof req.user.id);
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const originalname = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const uploadDir = path.join(__dirname, '..', 'uploads');

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process image with sharp
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();

    // Generate a unique filename for the JPEG
    const filename = `${Date.now()}-${path.parse(originalname).name}.jpeg`;
    const filepath = path.join(uploadDir, filename);

    // Convert to high-quality JPEG and save
    await image
      .jpeg({ quality: 100, chromaSubsampling: '4:4:4' }) // Max quality JPEG
      .toFile(filepath);

    // Save photo info to database, storing only the filename for the path
    const info = db.prepare('INSERT INTO photos (filename, filepath, source, metadata, uploaded_by_id) VALUES (?, ?, ?, ?, ?)').run(
      originalname,
      filename, // Store only the filename
      source || 'portfolio',
      JSON.stringify(metadata),
      req.user.id
    );
    const newPhoto = db.prepare('SELECT * FROM photos WHERE id = ?').get(info.lastInsertRowid);

    res.json({ msg: 'Photo uploaded and processed successfully', photo: newPhoto });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/photos
// @desc    Get all photos with metadata
// @access  Public
router.get('/', async (req, res) => {
  try {
    const photos = db.prepare("SELECT * FROM photos WHERE source = 'portfolio' ORDER BY upload_date DESC").all();
    // Parse metadata back to object
    const parsedPhotos = photos.map(photo => ({
      ...photo,
      metadata: JSON.parse(photo.metadata)
    }));
    res.json(parsedPhotos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/photos/:id
// @desc    Get single photo by ID with metadata
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    if (!photo) {
      return res.status(404).json({ msg: 'Photo not found' });
    }
    // Parse metadata back to object
    const parsedPhoto = { ...photo, metadata: JSON.parse(photo.metadata) };
    res.json(parsedPhoto);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/photos/:id/rename
// @desc    Rename a photo
// @access  Private (Admin)
router.put('/:id/rename', auth, async (req, res) => {
  const { newName } = req.body;
  try {
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    if (!photo) {
      return res.status(404).json({ msg: 'Photo not found' });
    }

    db.prepare('UPDATE photos SET filename = ? WHERE id = ?').run(newName, req.params.id);
    const updatedPhoto = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    res.json(updatedPhoto);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/photos/:id
// @desc    Delete a photo and its file
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    if (!photo) {
      return res.status(404).json({ msg: 'Photo not found' });
    }

    // Delete the file from the filesystem
    // Correctly join the path to the uploads directory
    const filePathToDelete = path.join(__dirname, '..', 'uploads', photo.filepath);
    if (fs.existsSync(filePathToDelete)) {
      fs.unlinkSync(filePathToDelete);
    }

    db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
    res.json({ msg: 'Photo removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
