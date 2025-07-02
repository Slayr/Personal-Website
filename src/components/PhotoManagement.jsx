import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardMedia, CardContent, CircularProgress, Alert, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const PhotoManagement = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/photos');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPhotos(data);
    } catch (err) {
      setError('Failed to fetch photos.');
      console.error('Fetch photos error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/photos/upload', {
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

      setSuccess('Photo uploaded successfully!');
      setSelectedFile(null);
      fetchPhotos(); // Refresh photo list
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess('Photo deleted successfully!');
      fetchPhotos(); // Refresh photo list
    } catch (err) {
      setError(`Deletion failed: ${err.message}`);
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Photos</Typography>
      <Box sx={{ mb: 3 }}>
        <input
          type="file"
          accept=".tif,.tiff"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="photo-upload-button"
        />
        <label htmlFor="photo-upload-button">
          <Button variant="contained" component="span">
            Select TIFF Photo
          </Button>
        </label>
        {selectedFile && <Typography sx={{ ml: 2, display: 'inline' }}>{selectedFile.name}</Typography>}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          sx={{ ml: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload Photo'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={photo.jpegUrl}
                alt={photo.title}
                sx={{ objectFit: 'contain' }}
              />
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">{photo.title}</Typography>
                <IconButton onClick={() => handleDelete(photo.id)} color="error" disabled={loading}>
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PhotoManagement;
