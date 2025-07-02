import { useState, useEffect } from 'react';
import { Typography, Box, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/blog/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError('Failed to load blog post.');
        console.error('Fetch blog post error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {post ? (
        <Card
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: '#2E3440', // Nord0 (darker)
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
            <Typography variant="h3" gutterBottom sx={{ fontFamily: 'Space Mono, monospace', color: '#88C0D0' }}>{post.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: 'Space Mono, monospace' }} gutterBottom>{post.date}</Typography>
            <ReactMarkdown
              components={{
                img: ({ node, ...props }) => <img style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '1rem auto' }} {...props} />
              }}
            >{post.content}</ReactMarkdown>
          </CardContent>
        </Card>
      ) : (
        <Typography>Post not found</Typography>
      )}
    </Box>
  );
};

export default BlogPost;
