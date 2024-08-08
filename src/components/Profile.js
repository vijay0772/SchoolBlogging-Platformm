// Profile.js
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useUser } from '../UserContext';

const Profile = () => {
  const { user, setUser } = useUser();
  const [userData, setUserData] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevUserData => ({
      ...prevUserData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update user data in local storage
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert('Profile updated successfully!');
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          name="username"
          label="Username"
          value={userData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="email"
          label="Email"
          value={userData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="persona"
          label="Persona"
          value={userData.persona}
          disabled
          fullWidth
          margin="normal"
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={userData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">Update</Button>
      </Box>
    </Container>
  );
};

export default Profile;
