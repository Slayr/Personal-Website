import { Typography, Box, Paper, Grid, Avatar } from '@mui/material';

const About = () => (
  <Box>
    <Typography variant="h2" gutterBottom>
      About Me
    </Typography>
    <Paper sx={{ p: 4 }}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar
            alt="Rishi"
            src="https://source.unsplash.com/random?portrait"
            sx={{ width: 200, height: 200, margin: '0 auto' }}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h4">Rishi</Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Full-Stack Developer & Photographer
          </Typography>
          <Typography paragraph>
            I am a passionate and creative individual with a love for both technology and art. My journey in web development has been driven by a desire to build beautiful and functional applications, while my photography allows me to capture the world through a unique lens.
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Skills</Typography>
        <Typography>React, Node.js, JavaScript, Python, HTML, CSS, Material-UI</Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Experience</Typography>
        <Typography variant="h6">Full-Stack Developer</Typography>
        <Typography variant="subtitle1" color="text.secondary">Tech Solutions Inc. | 2022 - Present</Typography>
        <Typography>Developed and maintained web applications using the MERN stack. Collaborated with cross-functional teams to deliver high-quality products.</Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Education</Typography>
        <Typography variant="h6">Bachelor of Science in Computer Science</Typography>
        <Typography variant="subtitle1" color="text.secondary">University of Technology | 2018 - 2022</Typography>
      </Box>
    </Paper>
  </Box>
);

export default About;
