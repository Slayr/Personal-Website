import { useState, useEffect } from 'react';
import { Typography, Box, Card, CardContent, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/blog`)
      .then(response => response.json())
      .then(data => {
        setPosts(data);
      })
      .catch(error => console.error('Error loading blog posts:', error));
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h2" gutterBottom sx={{ mb: 4 }}>
        Blog
      </Typography>
      <Grid container spacing={5}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} key={post.id}>
            <Card
              component={Link}
              to={`/blog/${post.id}`}
              sx={{
                mb: 3,
                borderRadius: 2,
                bgcolor: '#3B4252', // Nord1
                borderColor: '#4C566A', // Nord3
                borderWidth: '1px',
                borderStyle: 'solid',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.6)',
                  borderColor: '#88C0D0', // Nord8
                },
              }}
            >
              <CardContent>
                <Typography variant="h4" sx={{ fontFamily: 'Space Mono, monospace', color: '#88C0D0' }}>
                  {post.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: 'Space Mono, monospace' }} gutterBottom>{post.date}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Blog;
