import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Grid, Card, CardActionArea, CardContent, CardMedia, Button, Stack } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

function FeaturedPost(props) {
  const { post } = props;
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    setLikes(likes + 1); // Increment likes by one
    console.log("Liked!");
  };

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      setComments([...comments, newComment]);
      setNewComment(''); // Reset the comment input field
      handleCloseCommentDialog();
    }
  };

  return (
    <Grid item xs={12} md={6}>
      <CardActionArea component="a" href="#">
        <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <CardContent sx={{ flex: 1 }}>
            <Typography component="h2" variant="h5">
              {post.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {post.date}
            </Typography>
            <Typography variant="subtitle1" paragraph>
              {post.description}
            </Typography>
            <Typography variant="subtitle1" color="primary">
              Continue reading...
            </Typography>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: '100%', height: 160 }}
            image={post.image}
            alt={post.imageLabel}
          />
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ padding: 2 }}>
            <Button startIcon={<FavoriteBorderIcon />} onClick={handleLike}>
              Like ({likes})
            </Button>
            <Button startIcon={<CommentIcon />} onClick={handleOpenCommentDialog}>
              Comment
            </Button>
          </Stack>
        </Card>
      </CardActionArea>
      <Dialog open={isCommentDialogOpen} onClose={handleCloseCommentDialog}>
        <DialogTitle>Add a Comment</DialogTitle>
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
          <Button onClick={handleCloseCommentDialog}>Cancel</Button>
          <Button onClick={handleAddComment}>Add Comment</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

FeaturedPost.propTypes = {
  post: PropTypes.shape({
    date: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    imageLabel: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export default FeaturedPost;
