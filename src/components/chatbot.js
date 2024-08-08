import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, Container } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // Updated icon for Bot
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'; // Updated icon for User
import axios from 'axios';
import Header from './Header'; // Assuming this component exists
import Footer from './Footer'; // Assuming this component exists

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

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { user: 'You', text: userInput, timestamp: new Date().toLocaleTimeString() };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput('');

    // Simulate an API call for now
    // Replace with actual API call logic as needed
    try {
      // Assuming your backend API expects a POST request to 'http://localhost:3002/api/getSuggestions'
      const response = await axios.post('http://localhost:3002/api/getSuggestions', {
        query: userInput
        // You can add latitude and longitude if your backend requires it
      });

      const botResponse = { user: 'VI', text: response.data.suggestion || "I'm not sure how to respond to that.", timestamp: new Date().toLocaleTimeString() };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      const errorMessage = { user: 'VI', text: 'Sorry, something went wrong. Please try again later.', timestamp: new Date().toLocaleTimeString() };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <React.Fragment>
      <Header title="School Blogging Platform" sections={sections} />
      {/* Background image container */}
      <Box
        sx={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          zIndex: -1,
          backgroundImage: "url('https://source.unsplash.com/random?school/800x600')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Chat interface container */}
      <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Paper elevation={3} sx={{ maxWidth: 600, margin: 'auto', padding: 2, position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>Chat with VI Assistant</Typography>
          <List sx={{ maxHeight: 300, overflow: 'auto', mb: 5 }}>
            {messages.map((msg, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    {msg.user === 'VI' ? <ChatBubbleOutlineIcon /> : <PersonOutlineIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={`${msg.user} (${msg.timestamp})`} secondary={msg.text} />
              </ListItem>
            ))}
            <div ref={endOfMessagesRef} />
          </List>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              sx={{ mr: 1 }}
            />
            <IconButton onClick={handleSendMessage} color="primary"><SendIcon /></IconButton>
          </Box>
        </Paper>
      </Container>
      <Footer title="School Blog Footer" description="Empowering students with knowledge and a sense of community." />
    </React.Fragment>
  );
};

export default ChatComponent;
