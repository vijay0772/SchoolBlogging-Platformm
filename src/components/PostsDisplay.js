import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia,
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Box, InputAdornment, CircularProgress, FormControlLabel, Switch
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import SearchIcon from '@mui/icons-material/Search';
import Header from './Header';
import Footer from './Footer';
import { sections } from './Blog';
import { useUser } from '../UserContext';

const PostsDisplay = () => {
  const [posts, setPosts] = useState([]);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [currentPostId, setCurrentPostId] = useState('');
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    fetchPosts();
  }, []);

  const saveCommentsToLocal = (postId, commentToAdd) => {
    const existingComments = JSON.parse(localStorage.getItem('comments')) || {};
    const commentsForPost = existingComments[postId] || [];
    commentsForPost.push(commentToAdd);
    existingComments[postId] = commentsForPost;
    localStorage.setItem('comments', JSON.stringify(existingComments));
    // Immediately update the posts state to reflect the new comment
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...(post.comments || []), commentToAdd] };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

  const [suggestionEnabled, setSuggestionEnabled] = useState(false); // Corrected variable names for the toggle switch

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/posts');
      if (!response.ok) throw new Error('Network response was not ok');
      let data = await response.json();
      // Merge local comments with posts data
      data = data.map(post => ({
        ...post,
        comments: JSON.parse(localStorage.getItem('comments'))?.[post.id] || [],
      }));
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };
  const handleLike = async (postId) => {
    // Implementation remains the same
  };
  const handleAddComment = async () => {
    if (newComment.trim()) {
      const commentToAdd = { text: newComment, author: user.username, date: new Date().toISOString() };
      saveCommentsToLocal(currentPostId, commentToAdd);
      setNewComment('');
      setOpenCommentDialog(false);
      // Update the local state to immediately reflect the new comment
      const updatedPosts = posts.map(post => {
        if (post.id === currentPostId) {
          const updatedComments = [...post.comments, commentToAdd];
          return { ...post, comments: updatedComments };
        }
        return post;
      });
      setPosts(updatedPosts);
    }
  };
  const handleToggleChange = (event) => {
    setSuggestionEnabled(event.target.checked);
    if (event.target.checked) {
      // If the toggle is turned on, try to generate a suggestion for the current post's category
      const category = posts.find(post => post.id === currentPostId)?.category;
      if (category) {
        handleGenerateSuggestion(category);
      }
    }
  };



  const handleGenerateSuggestion = async (category) => {
    setLoadingSuggestion(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      const data = await response.json();
      if (data && data.suggestion) {
        setNewComment(data.suggestion);
      }
    } catch (error) {
      console.error('Failed to generate suggestion:', error);
    } finally {
      setLoadingSuggestion(false);
      // Turn off the toggle switch after generating a suggestion
      setSuggestionEnabled(false);
    }
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

  return (
      <React.Fragment>
        <Header title="School Blogging Platform" sections={sections} />
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" gutterBottom>School Blogging Posts</Typography>
            <TextField
              variant="outlined"
              placeholder="Search posts..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Grid container spacing={4}>
            {posts.filter(post => 
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={post.image || 'https://source.unsplash.com/random?school'}
                    alt={post.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">{post.title}</Typography>
                    <Typography variant="body2" color="textSecondary">{post.description}</Typography>
                    <Typography variant="body2" color="textSecondary">Category: {post.category}</Typography>
                    <Typography variant="body2" color="textSecondary">Author: {post.author}</Typography>
                    {post.comments && post.comments.map((comment, index) => (
                      <Box key={index} mt={2}>
                        <Typography variant="body2" color="textSecondary">
                          {comment.author}: {comment.text}
                        </Typography>
                      </Box>
                    ))}
                    <Button startIcon={<FavoriteIcon />} onClick={() => handleLike(post.id)}>Like</Button>
                    <Button startIcon={<CommentIcon />} onClick={() => handleOpenComments(post.id)}>Comment</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
        <Dialog open={openCommentDialog} onClose={handleCloseComments}>
        <DialogTitle>Add a Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Comment"
            type="text"
            fullWidth
            variant="outlined"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          {loadingSuggestion && <CircularProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComments}>Cancel</Button>
          <Button onClick={handleAddComment}>Add Comment</Button>
          {/* Corrected Toggle Switch for Suggestion */}
          <FormControlLabel
            control={
              <Switch
                checked={suggestionEnabled}
                onChange={handleToggleChange}
              />
            }
            label="Auto-generate Suggestion"
          />
        </DialogActions>
      </Dialog>
        <Footer title="School blog Footer" description="Something here to give the footer a purpose!" />
      </React.Fragment>
    );
  };
  
  export default PostsDisplay;