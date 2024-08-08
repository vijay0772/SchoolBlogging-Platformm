import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './UserContext'; // Ensure this path is correct
import Login from './components/Login';
import Register from './components/Register';
import Blog from './components/Blog';
import CreatePost from './components/CreatePost';
import PostsDisplay from './components/PostsDisplay';
import Profile from './components/Profile';
import ChatbotComponent from './components/chatbot'; // Import the ChatbotComponent with correct file name
import FetchRecomendation from './components/FetchRecommendation';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/createpost" element={<CreatePost />} />
          <Route path="/postsdisplay" element={<PostsDisplay />} />
          <Route path="/profile" element={<Profile />} />
          {/* Add a route for the ChatbotComponent */}
          <Route path="/chatbot" element={<ChatbotComponent />} />
          <Route path="/FetchRecommendation" element={<FetchRecomendation/>} />
          {/* ... other routes */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
