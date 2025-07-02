const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const authenticateToken = require('../middleware/auth');

const multer = require('multer');

const blogPostsDir = path.join(__dirname, '../../public/blog-posts');
const blogImagesDir = path.join(__dirname, '../../public/blog-images');

// Ensure blog posts and blog images directories exist
fs.ensureDirSync(blogPostsDir);
fs.ensureDirSync(blogImagesDir);

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, blogImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Helper to read a blog post file
async function readBlogPost(filename) {
  const filePath = path.join(blogPostsDir, filename);
  if (await fs.pathExists(filePath)) {
    const rawContent = await fs.readFile(filePath, 'utf8');
    const id = filename.replace(/\.md$/, '');

    let title = id;
    let date = 'Unknown Date';
    let content = rawContent;

    const lines = rawContent.split('\n');
    let contentStartIndex = 0;

    // Try to extract title from the first line
    if (lines.length > 0 && lines[0].startsWith('#')) {
      title = lines[0].substring(1).trim();
      contentStartIndex++;
    }

    // Try to extract date from the next line
    if (lines.length > contentStartIndex) {
      const dateLineMatch = lines[contentStartIndex].match(/Date:\s*(.*)/i);
      if (dateLineMatch) {
        date = dateLineMatch[1].trim();
        contentStartIndex++;
      }
    }

    // Skip any empty lines immediately following the metadata
    while (lines.length > contentStartIndex && lines[contentStartIndex].trim() === '') {
      contentStartIndex++;
    }

    content = lines.slice(contentStartIndex).join('\n');

    return { id, title, date, content };
  }
  return null;
}

// Helper to get all blog post metadata
async function getAllBlogPostsMetadata() {
  const files = await fs.readdir(blogPostsDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  const posts = await Promise.all(markdownFiles.map(async (filename) => {
    const post = await readBlogPost(filename);
    if (post) {
      // Return only metadata for listing, not full content
      const { content, ...metadata } = post;
      return metadata;
    }
    return null;
  }));
  return posts.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// GET all blog posts (metadata only)
router.get('/', async (req, res) => {
  try {
    const posts = await getAllBlogPostsMetadata();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog posts', error: error.message });
  }
});

// GET a single blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const filename = `${req.params.id}.md`;
    const post = await readBlogPost(filename);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog post', error: error.message });
  }
});

// POST upload blog image
router.post('/upload-image', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }
  const imageUrl = `/blog-images/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
});

// POST create new blog post
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
}

// POST create new blog post
router.post('/', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Missing required fields: title, content' });
  }

  const generatedId = `${slugify(title)}-${Date.now()}`;
  const generatedDate = new Date().toISOString().split('T')[0];

  const filename = `${generatedId}.md`;
  const filePath = path.join(blogPostsDir, filename);

  try {
    // Prepend title and date to the markdown content
    const fullContent = `# ${title}\nDate: ${generatedDate}\n\n${content}`;
    await fs.writeFile(filePath, fullContent, 'utf8');
    res.status(201).json({ message: 'Blog post created successfully', post: { id: generatedId, title, date: generatedDate } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create blog post', error: error.message });
  }
});

// PUT update existing blog post
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, date, content } = req.body;
  const filename = `${req.params.id}.md`;
  const filePath = path.join(blogPostsDir, filename);

  if (!await fs.pathExists(filePath)) {
    return res.status(404).json({ message: 'Blog post not found' });
  }

  if (!title || !date || !content) {
    return res.status(400).json({ message: 'Missing required fields: title, date, content' });
  }

  try {
    const fullContent = `# ${title}\nDate: ${date}\n\n${content}`;
    await fs.writeFile(filePath, fullContent, 'utf8');
    res.status(200).json({ message: 'Blog post updated successfully', post: { id: req.params.id, title, date } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update blog post', error: error.message });
  }
});

// DELETE blog post
router.delete('/:id', authenticateToken, async (req, res) => {
  const filename = `${req.params.id}.md`;
  const filePath = path.join(blogPostsDir, filename);

  if (!await fs.pathExists(filePath)) {
    return res.status(404).json({ message: 'Blog post not found' });
  }

  try {
    await fs.remove(filePath);
    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blog post', error: error.message });
  }
});

module.exports = router;