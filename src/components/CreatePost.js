import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Container, Paper, Box, MenuItem, Select, InputLabel, FormControl, Snackbar, CircularProgress, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'; // Adjust the path to match your project structure
import Header from './Header'; // Import Header component
import Footer from './Footer';
import CommentIcon from '@mui/icons-material/Comment'; // Importing Comment icon
import TitleIcon from '@mui/icons-material/Title'; // Importing Title icon

const sections = [
  { title: 'Academic Resources', url: '#' },
  { title: 'Career Services', url: '#' },
  { title: 'Campus', url: '#' },
  { title: 'Culture', url: '#' },
  { title: 'Local Community Resources', url: '#' },
  { title: 'Sports', url: '#' },
  { title: 'Health', url: '#' },
  { title: 'Wellness', url: '#' },
  { title: 'Technology', url: '#' },
  { title: 'Travel', url: '#' },
  { title: 'Alumni', url: '#' },
];

const CreatePost = () => {
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('https://source.unsplash.com/random');
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    setBackgroundImage(`https://source.unsplash.com/random/${window.innerWidth}x${window.innerHeight}`);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to create a post.');
      return;
    }

    setLoading(true);

    const newPost = {
      title: postTitle,
      description: postDescription,
      category: postCategory,
      author: user.username,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setOpenSnackbar(true);
      setTimeout(() => {
        setOpenSnackbar(false);
        navigate('/PostsDisplay');
      }, 2000);

      console.log('Post submitted successfully:', newPost);
    } catch (error) {
      console.error('Failed to submit post:', error);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
      setPostTitle('');
      setPostDescription('');
      setPostCategory('');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <React.Fragment>
      <Header title="School Blogging Platform" sections={sections} />
      <Box
        sx={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          zIndex: -1,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          animation: 'pulse 2s infinite',
        }}
      />
      <Container component="main" maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Create New Post
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Title"
              autoFocus
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              InputProps={{
                style: { fontWeight: 'bold' },
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
              InputProps={{
                style: { fontWeight: 'bold' },
                startAdornment: (
                  <InputAdornment position="start">
                    <CommentIcon color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: 500 }}
              helperText={`${postDescription.length}/500 characters`}
            />
            <Box mt={2} mb={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={postCategory}
                  label="Category"
                  onChange={(e) => setPostCategory(e.target.value)}
                  style={{ fontWeight: 'bold' }}
                >
                  {sections.map((section) => (
                    <MenuItem key={section.title} value={section.title}>
                      {section.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Post'}
            </Button>
          </form>
        </Paper>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={loading ? 'Submitting post...' : 'Post submitted successfully!'}
        sx={{ bottom: 16, left: 16 }}
      />
      <Footer
        title="School Blog Footer"
        description="Empowering students with knowledge and a sense of community."
      />
    </React.Fragment>
  );
};

export default CreatePost;
