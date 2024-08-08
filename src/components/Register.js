import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getUserDataFromLocalStorage, saveUserDataToLocalStorage } from '../Utils/localStorageUtils';

const personas = ["Student", "Faculty", "Staff", "Moderator", "Administrator"];

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersona] = useState('');
  const navigate = useNavigate();

  const handleRegister = (event) => {
    event.preventDefault();
    let userData = getUserDataFromLocalStorage();
  
    // Ensure userData is an array
    if (!Array.isArray(userData)) {
      userData = [];
    }

    // Check if username already exists
    const existingUser = userData.find(user => user.username === username);
    if (existingUser) {
      alert("Username already exists. Please choose another username.");
      return;
    }
    
    // Update users data with new user
    const newUser = { username, email, password, persona };
    userData.push(newUser);
    saveUserDataToLocalStorage(userData);

    // Redirect to login page
    navigate('/login');
  };

  return (
    <Box style={{ backgroundImage: 'url(https://source.unsplash.com/random?school)', backgroundSize: 'cover', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box style={{ width: '400px', padding: '20px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
        <Typography component="h1" variant="h4" style={{ color: '#000', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
          Sign up
        </Typography>
        <form onSubmit={handleRegister}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{ style: { fontWeight: 'bold', color: '#000' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{ style: { fontWeight: 'bold', color: '#000' } }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="persona-label" style={{ fontWeight: 'bold' }}>Persona</InputLabel>
            <Select
              labelId="persona-label"
              id="persona"
              value={persona}
              label="Persona"
              onChange={(e) => setPersona(e.target.value)}
              style={{ fontWeight: 'bold', color: '#000' }}
            >
              {personas.map((role, index) => (
                <MenuItem key={index} value={role} style={{ fontWeight: 'bold', color: '#000' }}>{role}</MenuItem>
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
            Sign Up
          </Button>
          <Typography variant="body2" align="center" style={{ color: '#000', fontWeight: 'bold', marginTop: '20px' }}>
            Already have an account? <RouterLink to="/login" style={{ color: '#000', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</RouterLink>
          </Typography>
        </form>
      </Box>
    </Box>
  );
};

export default Register;
