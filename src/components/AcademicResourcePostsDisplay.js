import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Fade, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box, Avatar } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';
import { useUser } from '../UserContext'; // Import useUser hook
import { CssBaseline, Paper, Link, useMediaQuery } from '@mui/material'; // Remove Button import
import { useTheme } from '@mui/material/styles';
import Header from './Header'; // Import the Header component
import Footer from './Footer'; // Import the Footer component

const AcademicResourcePostsDisplay = () => {
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [checked, setChecked] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { user: currentUser } = useUser(); // Use the useUser hook to access the current user
  const matches = useMediaQuery(theme.breakpoints.up('md')); // Use the useMediaQuery hook

  useEffect(() => {
    let loadedPosts = JSON.parse(localStorage.getItem('academicPosts')) || []; // Load posts from 'academicPosts' key
    const userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
    const comments = JSON.parse(localStorage.getItem('comments')) || {};

    loadedPosts = loadedPosts.map(post => ({
      ...post,
      liked: userLikes[post.id]?.includes(currentUser.username),
      likes: userLikes[post.id]?.length || 0,
      comments: comments[post.id] || [],
    }));

    setPosts(loadedPosts);
    setChecked(true);
  }, [currentUser]);

  const handleLike = (postId) => {
    const userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
    if (userLikes[postId]?.includes(currentUser.username)) {
      // User has already liked this post
      return;
    }
    const updatedLikes = userLikes[postId] ? [...userLikes[postId], currentUser.username] : [currentUser.username];
    localStorage.setItem('userLikes', JSON.stringify({ ...userLikes, [postId]: updatedLikes }));

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, liked: true, likes: post.likes + 1 };
      }
      return post;
    }));
  };

  const handleOpenComments = (postId) => {
    setCurrentPostId(postId);
    setOpenCommentDialog(true);
  };

  const handleCloseComments = () => {
    setOpenCommentDialog(false);
    setCurrentPostId(null);
    setNewComment('');
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comments = JSON.parse(localStorage.getItem('comments')) || {};
      const updatedComments = {
        ...comments,
        [currentPostId]: [...(comments[currentPostId] || []), { text: newComment, author: currentUser.username }], // Include the current user's username
      };

      localStorage.setItem('comments', JSON.stringify(updatedComments));

      setPosts(posts.map(post => {
        if (post.id === currentPostId) {
          return { ...post, comments: [...post.comments, { text: newComment, author: currentUser.username }] };
        }
        return post;
      }));

      setNewComment('');
      handleCloseComments();
    }
  };

  return (
    <React.Fragment>
      {/* Integrate Header component with the appropriate props */}
      <Header title="Academic Resources" /> {/* Set title to "Academic Resources" */}
      <CssBaseline /> {/* Apply baseline styles */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Academic Resource Posts
        </Typography>
        <Grid container spacing={4}>
          {posts.map((post, index) => (
            <Fade in={checked} style={{ transitionDelay: `${index * 100}ms` }} key={post.id}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={post.image || 'https://source.unsplash.com/random'}
                    alt={post.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {post.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {post.description}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category: {post.category}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Posted by: {post.author}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Button startIcon={post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />} onClick={() => handleLike(post.id)}>
                        Like ({post.likes})
                      </Button>
                      <Button startIcon={<CommentIcon />} onClick={() => handleOpenComments(post.id)}>
                        Comment
                      </Button>
                    </Box>
                    {post.comments.map((comment, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{comment.author.charAt(0)}</Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {`${comment.author}: ${comment.text}`}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Fade>
          ))}
        </Grid>
        <Dialog open={openCommentDialog} onClose={handleCloseComments} maxWidth="sm" fullWidth>
          <DialogTitle>Add a comment</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Comment"
              type="text"
              fullWidth
              variant="standard"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddComment}>Add Comment</Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Footer title="Academic Resources Footer" />
    </React.Fragment>
  );
};

export default AcademicResourcePostsDisplay;
