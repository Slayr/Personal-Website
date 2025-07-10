const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../db'); // Import the SQLite database instance
const fs = require('fs');
const path = require('path');

// @route   GET /api/blog
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = db.prepare('SELECT * FROM blog_posts ORDER BY date DESC').all();
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/blog/:id
// @desc    Get single blog post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/blog
// @desc    Create a blog post
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  console.log('req.user.id (blog POST):', req.user.id, 'typeof:', typeof req.user.id);

  try {
    const info = db.prepare('INSERT INTO blog_posts (title, content, author_id) VALUES (?, ?, ?)').run(title, content, req.user.id);
    const newPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(info.lastInsertRowid);
    res.json(newPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/blog/:id
// @desc    Update a blog post
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }

    db.prepare('UPDATE blog_posts SET title = ?, content = ? WHERE id = ?').run(title || post.title, content || post.content, req.params.id);
    const updatedPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    res.json(updatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/blog/:id
// @desc    Delete a blog post
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }

    // Find all image URLs in the content
    const imageUrls = (post.content.match(/\/uploads\/[^)]+/g) || []).map(url => path.basename(url));

    // Start a transaction
    db.transaction(() => {
      // Delete associated photos from the filesystem and the database
      if (imageUrls.length > 0) {
        const deletePhotoStmt = db.prepare('DELETE FROM photos WHERE filepath = ?');
        for (const filename of imageUrls) {
          const photo = db.prepare('SELECT * FROM photos WHERE filepath = ?').get(filename);
          if (photo) {
            const filePathToDelete = path.join(__dirname, '..', 'uploads', filename);
            if (fs.existsSync(filePathToDelete)) {
              fs.unlinkSync(filePathToDelete);
            }
            deletePhotoStmt.run(filename);
          }
        }
      }

      // Delete the blog post itself
      db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
    })();

    res.json({ msg: 'Blog post and associated images removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;