const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const { ExifTool } = require('exiftool-vendored');
const authenticateToken = require('../middleware/auth');

const exiftool = new ExifTool();

const tifDir = path.join(__dirname, '../../public/photos/tif');
const jpegDir = path.join(__dirname, '../../public/photos/jpeg');
const metadataFile = path.join(__dirname, '../../public/photos/metadata.json');

// Ensure directories exist
fs.ensureDirSync(tifDir);
fs.ensureDirSync(jpegDir);

// Set up multer for file uploads
const upload = multer({ dest: tifDir });

// Helper to read metadata
async function readPhotoMetadata() {
  if (await fs.pathExists(metadataFile)) {
    return fs.readJson(metadataFile);
  }
  return {};
}

// Helper to write metadata
async function writePhotoMetadata(data) {
  await fs.writeJson(metadataFile, data, { spaces: 2 });
}

// Helper to extract EXIF metadata
async function extractExifMetadata(tifPath) {
  try {
    const tags = await exiftool.read(tifPath);
    const relevantMetadata = {};
    const desiredTags = [
      'ImageWidth',
      'ImageHeight',
      'Make',
      'Model',
      'DateTimeOriginal',
      'Artist',
      'Software',
      'ExposureTime',
      'FNumber',
      'ISO',
      'FocalLength',
      'LensModel',
      'Orientation',
    ];

    desiredTags.forEach(tag => {
      if (tags[tag]) {
        relevantMetadata[tag] = tags[tag].description || tags[tag].toString();
      }
    });
    return relevantMetadata;
  } catch (error) {
    console.error(`Error extracting metadata from ${tifPath}:`, error);
    return {};
  }
}

// GET all photo metadata
router.get('/', async (req, res) => {
  try {
    const metadata = await readPhotoMetadata();
    res.json(Object.values(metadata));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching photo metadata', error: error.message });
  }
});

// POST upload new photo
router.post('/upload', authenticateToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const tempTifPath = req.file.path;
  const originalFileName = req.file.originalname;
  const tifFileName = originalFileName.replace(/\.[^/.]+$/, '') + '.tif'; // Ensure .tif extension
  const finalTifPath = path.join(tifDir, tifFileName);
  const jpegFileName = tifFileName.replace(/\.tif(f)?$/i, '.jpeg');
  const jpegPath = path.join(jpegDir, jpegFileName);

  try {
    // Rename the uploaded file to its original name with .tif extension
    await fs.rename(tempTifPath, finalTifPath);

    // Convert TIFF to JPEG
    await sharp(finalTifPath)
      .jpeg({ quality: 95 })
      .toFile(jpegPath);

    // Extract metadata
    const metadata = await extractExifMetadata(finalTifPath);
    const photoMetadata = await readPhotoMetadata();
    photoMetadata[tifFileName] = { ...metadata, id: tifFileName, title: tifFileName.replace(/\.tif(f)?$/i, ''), jpegUrl: `/photos/jpeg/${jpegFileName}`, tifUrl: `/photos/tif/${tifFileName}` };
    await writePhotoMetadata(photoMetadata);

    res.status(201).json({ message: 'Photo uploaded and processed successfully', photo: photoMetadata[tifFileName] });
  } catch (error) {
    console.error('Error processing uploaded photo:', error);
    // Clean up files if processing fails
    if (await fs.pathExists(finalTifPath)) await fs.remove(finalTifPath);
    if (await fs.pathExists(jpegPath)) await fs.remove(jpegPath);
    res.status(500).json({ message: 'Failed to process photo', error: error.message });
  } finally {
    exiftool.end(); // Ensure exiftool process is ended
  }
});

// DELETE photo
router.delete('/:id', authenticateToken, async (req, res) => {
  const tifFileName = req.params.id;
  const tifPath = path.join(tifDir, tifFileName);
  const jpegFileName = tifFileName.replace(/\.tif(f)?$/i, '.jpeg');
  const jpegPath = path.join(jpegDir, jpegFileName);

  try {
    const photoMetadata = await readPhotoMetadata();
    if (!photoMetadata[tifFileName]) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete files
    if (await fs.pathExists(tifPath)) await fs.remove(tifPath);
    if (await fs.pathExists(jpegPath)) await fs.remove(jpegPath);

    // Delete metadata entry
    delete photoMetadata[tifFileName];
    await writePhotoMetadata(photoMetadata);

    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Failed to delete photo', error: error.message });
  }
});

module.exports = router;
