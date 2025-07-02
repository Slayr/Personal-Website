import { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardMedia, Modal, Fade, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LensIcon from '@mui/icons-material/Lens';
import ShutterSpeedIcon from '@mui/icons-material/ShutterSpeed';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import StraightenIcon from '@mui/icons-material/Straighten';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 1200,
  height: '90vh', // Fixed height
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  overflow: 'hidden', // Prevent scrolling
};

const Photography = () => {
  const [open, setOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/photos')
      .then(response => response.json())
      .then(data => {
        setPhotos(data);
      })
      .catch(error => console.error('Error loading photo metadata:', error));
  }, []);

  const handleOpen = (photo) => {
    setSelectedPhoto(photo);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateTimeString; // Return original if parsing fails
    }
  };

  const metadataMap = {
    Model: { label: 'Camera Model', icon: <CameraAltIcon /> },
    DateTimeOriginal: { label: 'Date Taken', icon: <DateRangeIcon />, formatter: formatDateTime },
    ExposureTime: { label: 'Shutter Speed', icon: <ShutterSpeedIcon /> },
    FNumber: { label: 'Aperture', icon: <LensIcon /> },
    ISO: { label: 'ISO', icon: <AspectRatioIcon /> },
    FocalLength: { label: 'Focal Length', icon: <StraightenIcon /> },
  };

  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Photography
      </Typography>
      <Grid container spacing={4}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo.id}>
            <Card onClick={() => handleOpen(photo)} sx={{ cursor: 'pointer' }}>
              <CardMedia
                component="img"
                height="250"
                image={photo.jpegUrl}
                alt={photo.title}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
      >
        <Fade in={open}>
          <Box sx={style}>
            {selectedPhoto && (
              <>
                <Box sx={{ flex: 2, mr: { md: 4 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={selectedPhoto.jpegUrl} alt={selectedPhoto.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </Box>
                <Box sx={{ flex: 1, mt: { xs: 4, md: 0 }, overflowY: 'auto' }}>
                  <Typography variant="h4" gutterBottom>{selectedPhoto.title}</Typography>
                  <List dense>
                    {Object.entries(selectedPhoto).map(([key, value]) => {
                      if (metadataMap[key]) {
                        const displayValue = metadataMap[key].formatter ? metadataMap[key].formatter(value) : value;
                        return (
                          <ListItem key={key}>
                            <ListItemIcon>
                              {metadataMap[key].icon}
                            </ListItemIcon>
                            <ListItemText primary={metadataMap[key].label} secondary={displayValue} />
                          </ListItem>
                        );
                      }
                      return null;
                    })}
                  </List>
                  {selectedPhoto.tifUrl && (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      href={selectedPhoto.tifUrl}
                      download={selectedPhoto.id}
                    >
                      Download Original TIFF
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Photography;
