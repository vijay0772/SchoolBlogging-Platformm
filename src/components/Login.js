import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getUserDataFromLocalStorage } from '../Utils/localStorageUtils'; // Update the import path if necessary
import { useUser } from '../UserContext'; // Import useUser hook

const personas = ["Student", "Faculty", "Staff", "Moderator", "Administrator"];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersona] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser(); // Use setUser function from useUser hook

  const handleLogin = (event) => {
    event.preventDefault();
    const userData = getUserDataFromLocalStorage();
    
    // Check if user exists
    const userInfo = userData.find(user => user.email === email);
    if (!userInfo) {
      alert("User does not exist. Please register first.");
      return;
    }
    
    // Check if password matches
    if (userInfo.password !== password) {
      alert("Incorrect password. Please try again.");
      return;
    }

    // Check if persona matches
    if (userInfo.persona !== persona) {
      alert("Incorrect persona selected. Please try again.");
      return;
    }

    // Update user state upon successful login
    setUser(userInfo);

    // Redirect to blog page after successful login
    navigate('/blog');
  };

  return (
    <Box style={{ backgroundImage: 'url(https://source.unsplash.com/random?school)', backgroundSize: 'cover', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box style={{ width: '400px', padding: '20px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
        <Typography component="h1" variant="h4" style={{ color: '#000', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
          School Blogging Platform
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ style: { fontWeight: 'bold', color: '#000' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{ style: { fontWeight: 'bold', color: '#000' } }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="persona-label" style={{ fontWeight: 'bold' }}>Persona</InputLabel>
            <Select
              labelId="persona-label"
              id="persona-select"
              value={persona}
              label="Persona"
              onChange={(e) => setPersona(e.target.value)}
              style={{ fontWeight: 'bold', color: '#000' }}
            >
              {personas.map((persona, index) => (
                <MenuItem key={index} value={persona} style={{ fontWeight: 'bold', color: '#000' }}>{persona}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ marginTop: '20px', fontWeight: 'bold' }}
          >
            Sign In
          </Button>
          <Typography variant="body2" align="center" style={{ color: '#000', fontWeight: 'bold', marginTop: '20px' }}>
            Don't have an account? <RouterLink to="/register" style={{ color: '#000', fontWeight: 'bold', textDecoration: 'none' }}>Sign Up</RouterLink>
          </Typography>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
