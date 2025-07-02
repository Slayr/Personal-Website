import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, IconButton, CircularProgress, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/blog');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError('Failed to fetch blog posts.');
      console.error('Fetch blog posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreateDialog = () => {
    setCurrentPost({ id: '', title: '', date: new Date().toISOString().split('T')[0], content: '' });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (post) => {
    setCurrentPost({ ...post, date: new Date(post.date).toISOString().split('T')[0] }); // Format date for input
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPost(null);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPost(prev => ({ ...prev, [name]: value }));
  };

  const handlePaste = async (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault(); // Prevent default paste behavior
        setLoading(true);
        setError(null);
        setSuccess(null);

        const file = items[i].getAsFile();
        const formData = new FormData();
        formData.append('image', file);

        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/blog/upload-image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const imageUrl = data.url;
          const markdownImage = `![alt text](${imageUrl})`;

          // Insert markdown image at cursor position
          const textarea = event.target;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newContent = currentPost.content.substring(0, start) + markdownImage + currentPost.content.substring(end);
          setCurrentPost(prev => ({ ...prev, content: newContent }));
          setSuccess('Image uploaded and inserted!');
        } catch (err) {
          setError(`Image upload failed: ${err.message}`);
          console.error('Image upload error:', err);
        } finally {
          setLoading(false);
        }
        return;
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token');
    const isEditing = currentPost.id && posts.some(p => p.id === currentPost.id);
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `http://localhost:5000/api/blog/${currentPost.id}` : 'http://localhost:5000/api/blog';

    const payload = isEditing ? currentPost : { title: currentPost.title, content: currentPost.content };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess(`Blog post ${method === 'POST' ? 'created' : 'updated'} successfully!`);
      handleCloseDialog();
      fetchPosts();
    } catch (err) {
      setError(`${method === 'POST' ? 'Creation' : 'Update'} failed: ${err.message}`);
      console.error('Blog post submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/blog/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess('Blog post deleted successfully!');
      fetchPosts();
    } catch (err) {
      setError(`Deletion failed: ${err.message}`);
      console.error('Blog post delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Blog Posts</Typography>
      <Button variant="contained" color="primary" onClick={handleOpenCreateDialog} sx={{ mb: 3 }}>
        Create New Post
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

      <List>
        {posts.map((post) => (
          <ListItem
            key={post.id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(post)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(post.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={post.title} secondary={post.date} />
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{currentPost && posts.some(p => p.id === currentPost.id) ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
        <DialogContent>
          {currentPost && posts.some(p => p.id === currentPost.id) && (
            <TextField
              margin="dense"
              name="id"
              label="Post ID"
              type="text"
              fullWidth
              variant="outlined"
              value={currentPost?.id || ''}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
          )}
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={currentPost?.title || ''}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="date"
            fullWidth
            variant="outlined"
            value={currentPost?.date || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{ readOnly: !currentPost || !posts.some(p => p.id === currentPost.id) }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="content"
            label="Content (Markdown supported)"
            type="text"
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={currentPost?.content || ''}
            onChange={handleChange}
            onPaste={handlePaste}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (currentPost && posts.some(p => p.id === currentPost.id) ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogManagement;
