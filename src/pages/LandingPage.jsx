import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage = () => (
  <Box
    sx={{
      
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography variant="h1" gutterBottom>
        Rishi
      </Typography>
      <Typography variant="h4" component="p" gutterBottom>
        Photographer, Developer, and Writer
      </Typography>
      <Button variant="contained" color="secondary" component={Link} to="/about" sx={{ mt: 4 }}>
        Discover My Work
      </Button>
    </Box>
  </Box>
);

export default LandingPage;
