import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar, Button, IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
  Toolbar, Typography, Drawer, List, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Slide, Divider, Box, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Switch, ListSubheader, ListItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import CreateIcon from '@mui/icons-material/Create';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import ManageUsersIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import FaceIcon from '@mui/icons-material/Face';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { Badge } from '@mui/material';
// Add this import to the top of your Header.js
import RecommendationModal from './FetchRecommendation'; // Adjust the path as necessary

// Mock implementations of localStorage utility functions
const getUserDataFromLocalStorage = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

const saveUserDataToLocalStorage = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

function Header({ sections, title }) {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isManageUsersDialogOpen, setManageUsersDialogOpen] = useState(false);
  // Assume AiAssistDialog related state is not needed based on previous context
  // const [isAiAssistDialogOpen, setAiAssistDialogOpen] = useState(false);
  const [isNotificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [username, setUsername] = useState(user ? user.username : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [password, setPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [isAiAssistDialogOpen, setAiAssistDialogOpen] = useState(false); // New state for AI Assist dialog
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', persona: '' });
  const [isSubscribeOpen, setSubscribeOpen] = useState(false);
  const [subscribedCategories, setSubscribedCategories] = useState(user ? user.subscribedCategories || [] : []);
  const [isRecommendationModalOpen, setRecommendationModalOpen] = useState(false);

  useEffect(() => {
    const userData = getUserDataFromLocalStorage();
    if (Array.isArray(userData)) {
      setUsers(userData);
    } else if (typeof userData === 'object' && userData !== null) {
      setUsers([userData]);
    } else {
      console.error('Unexpected user data:', userData);
    }
  }, []);



  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (user) { // Ensure there is a logged-in user
          const response = await fetch('http://localhost:3001/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: user.username, // Pass the username to the backend
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications); // Assuming the backend returns an array of notifications
          } else {
            throw new Error('Failed to fetch notifications');
          }
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
  
    fetchNotifications();
  
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, [user]); // Re-fetch when the user changes
  







  const handleLogout = () => {
    setUser(null);
    navigate('/login');
    handleMenuClose();
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  const handleProfileClose = () => {
    setProfileDialogOpen(false);
  };

  const handleUpdateProfile = () => {
    setUser({ ...user, username, email, password });
    setProfileMessage('Profile updated successfully!');
    setTimeout(() => {
      setProfileMessage('');
      navigate('/blog');
    }, 2000);
  };

  const handleManageUsers = () => {
    setManageUsersDialogOpen(true);
    handleMenuClose();
  };

  const handleAiAssistClick = () => {
    setAiAssistDialogOpen(true);
    handleMenuClose();
  };

  const handleAiAssistClose = () => {
    setAiAssistDialogOpen(false);
  };

  const handleAddUser = () => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUserDataToLocalStorage(updatedUsers);
    setNewUser({ username: '', email: '', password: '', persona: '' });
  };

  const handleEnableDisableUser = (emailToEnableDisable) => {
    const updatedUsers = users.map((user) => {
      if (user.email === emailToEnableDisable) {
        return { ...user, enabled: !user.enabled };
      }
      return user;
    });
    setUsers(updatedUsers);
    saveUserDataToLocalStorage(updatedUsers);
  };

  const handleSubscribeOpen = () => {
    setSubscribeOpen(true);
  };

  const handleSubscribeClose = () => {
    setSubscribeOpen(false);
  };

  const handleNotificationsClick = () => {
    setNotificationsDialogOpen(true);
  };

  const handleNotificationsClose = () => {
    setNotificationsDialogOpen(false);
  };




  const handleSubscribe = async (category) => {
    try {
      const response = await fetch('http://localhost:3001/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username, // Assuming you have the user's username available
          topic: category,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Update local state to reflect the subscription
        const updatedSubscriptions = [...subscribedCategories, category];
        setSubscribedCategories(updatedSubscriptions);
        setUser({ ...user, subscribedCategories: updatedSubscriptions });
        // Optionally save to local storage or state management
        console.log(data.message); // Or display a success message/notification to the user
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      // Display an error message/notification to the user
    }
  };

  const handleUnsubscribe = async (category) => {
    try {
      const response = await fetch('http://localhost:3001/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          topic: category,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Update local state to reflect the unsubscription
        const updatedSubscriptions = subscribedCategories.filter(cat => cat !== category);
        setSubscribedCategories(updatedSubscriptions);
        setUser({ ...user, subscribedCategories: updatedSubscriptions });
        // Optionally save to local storage or state management
        console.log(data.message); // Or display a success message/notification to the user
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      // Display an error message/notification to the user
    }
  };

  const menuList = () => (
    <div
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <Slide direction="right" in={isDrawerOpen} mountOnEnter unmountOnExit>
          <ListItem button onClick={() => navigate('/CreatePost')}>
            <ListItemIcon>
              <CreateIcon />
            </ListItemIcon>
            <ListItemText primary="Create Post" />
          </ListItem>
        </Slide>
        <Slide direction="right" in={isDrawerOpen} mountOnEnter unmountOnExit>
          <ListItem button onClick={() => navigate('/PostsDisplay')}>
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText primary="View Posts" />
          </ListItem>
        </Slide>
        <Divider />
        <Slide direction="right" in={isDrawerOpen} mountOnEnter unmountOnExit>
        <ListItem button onClick={() => navigate('/chatbot')}>
  <ListItemIcon>
    <FaceIcon /> {/* Use the WbSunnyIcon instead of WeatherIcon */}
  </ListItemIcon>
  <ListItemText primary="AI Assist" />
</ListItem>
      </Slide>
        {user && user.persona === 'Administrator' && (
          <Slide direction="right" in={isDrawerOpen} mountOnEnter unmountOnExit>
            <ListItem button onClick={handleManageUsers}>
              <ListItemIcon>
                <ManageUsersIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Users" />
            </ListItem>
          </Slide>
        )}
      </List>
    </div>
  );
  const handleRecommendedClick = () => {
    console.log('Recommended button clicked');
    setRecommendationModalOpen(true);
};

  return (
    <React.Fragment>
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {user && (
          <Slide direction="down" in={!isDrawerOpen}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Slide>
        )}
        <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer(false)}>
          {menuList()}
        </Drawer>
        <Typography component="h2" variant="h5" color="inherit" align="center" noWrap sx={{ flex: 1 }}>
          {title}
        </Typography>
        {user && (
          <div>
            {/* Updated button without icon and with blue color */}
            <Button
              onClick={handleRecommendedClick}
              sx={{ marginRight: 2, textTransform: 'bold', color: 'inherit', backgroundColor: 'lightblue', '&:hover': { backgroundColor: 'lightblue' } }}
            >
              Recommended for You
            </Button>
            <RecommendationModal open={isRecommendationModalOpen} handleClose={() => setRecommendationModalOpen(false)} />

            <Button
              onClick={handleMenuClick}
              sx={{ textTransform: 'none', color: 'inherit' }}
            >
              <Avatar sx={{ marginRight: 1
}}>
{user.username.charAt(0)}
</Avatar>
{user.username}
</Button>
<Menu
anchorEl={anchorEl}
open={Boolean(anchorEl)}
onClose={handleMenuClose}
>
<MenuItem component={RouterLink} to="/blog">
<ListItemIcon>
  <HomeIcon />
</ListItemIcon>
<ListItemText>Home</ListItemText>
</MenuItem>
<MenuItem onClick={handleNotificationsClick}>
    <ListItemIcon>
      <Badge badgeContent={notifications.length} color="secondary">
        <NotificationsIcon />
      </Badge>
    </ListItemIcon>
    <ListItemText>Notifications</ListItemText>
  </MenuItem>
<MenuItem onClick={handleLogout}>
<ListItemIcon>
  <LogoutIcon />
</ListItemIcon>
<ListItemText>Logout</ListItemText>
</MenuItem>
<MenuItem onClick={handleProfileClick}>
<ListItemIcon>
  <AccountCircleIcon />
</ListItemIcon>
<ListItemText>Profile</ListItemText>
</MenuItem>
<MenuItem onClick={handleSubscribeOpen}>
<ListItemIcon>
  <NotificationsIcon />
</ListItemIcon>
<ListItemText>Subscribe</ListItemText>
</MenuItem>
</Menu>
</div>

)}
</Toolbar>
<Dialog open={isSubscribeOpen} onClose={handleSubscribeClose}>
<DialogTitle>Subscribe to Categories</DialogTitle>
<DialogContent>
{sections.map((section) => (
<Box key={section.title} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
<Typography>{section.title}</Typography>
<Button
variant="contained"
color="primary"
size="small"
onClick={() => subscribedCategories.includes(section.title) ? handleUnsubscribe(section.title) : handleSubscribe(section.title)}
>
{subscribedCategories.includes(section.title) ? 'Unsubscribe' : 'Subscribe'}
</Button>
</Box>
))}
</DialogContent>
<DialogActions>
<Button onClick={handleSubscribeClose} color="primary">
Close
</Button>
</DialogActions>
</Dialog>

{/* Profile Dialog */}
<Dialog open={isProfileDialogOpen} onClose={handleProfileClose}>
<DialogTitle>Update Profile</DialogTitle>
<DialogContent>
<TextField
autoFocus
margin="dense"
id="username"
label="Username"
type="text"
fullWidth
value={username}
onChange={(e) => setUsername(e.target.value)}
/>
<TextField
margin="dense"
id="email"
label="Email Address"
type="email"
fullWidth
value={email}
onChange={(e) => setEmail(e.target.value)}
/>
<TextField
margin="dense"
id="persona"
label="Persona"
type="text"
fullWidth
value={user.persona}
disabled
/>
<TextField
margin="dense"
id="password"
label="Password"
type="password"
fullWidth
value={password}
onChange={(e) => setPassword(e.target.value)}
/>
{profileMessage && (
<Typography variant="body2" color="success" align="center" sx={{ mt: 2 }}>
{profileMessage}
</Typography>
)}
</DialogContent>
<DialogActions>
<Button onClick={handleProfileClose}>Cancel</Button>
<Button onClick={handleUpdateProfile} color="primary">Save</Button>
</DialogActions>
</Dialog>


      {/* Notifications Dialog */}

<Dialog open={isNotificationsDialogOpen} onClose={handleNotificationsClose}>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent>
          <List>
            {notifications.length > 0 ? notifications.map((notification) => (
              <ListItem key={notification.id}>
                <ListItemText primary={notification.message} />
              </ListItem>
            )) : (
              <ListItem>
                <ListItemText primary="No new notifications" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotificationsClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>




{/* Manage Users Dialog */}
<Dialog open={isManageUsersDialogOpen} onClose={() => setManageUsersDialogOpen(false)}>
<DialogTitle>Manage Users</DialogTitle>
<DialogContent>
<TableContainer component={Paper}>
<Table>
<TableHead>
<TableRow>
  <TableCell>Username</TableCell>
  <TableCell>Email</TableCell>
  <TableCell>Persona</TableCell>
  <TableCell>Action</TableCell>
</TableRow>
</TableHead>
<TableBody>
{users.map((user, index) => (
  <TableRow key={index}>
    <TableCell>{user.username}</TableCell>
    <TableCell>{user.email}</TableCell>
    <TableCell>{user.persona}</TableCell>
    <TableCell>
      <Switch
        checked={user.enabled}
        onChange={() => handleEnableDisableUser(user.email)}
      />
    </TableCell>
  </TableRow>
))}
</TableBody>
</Table>
</TableContainer>
<Box mt={2}>
<Typography variant="h6" gutterBottom>Add New User</Typography>
<TextField
margin="normal"
id="new-username"
label="Username"
type="text"
fullWidth
value={newUser.username}
onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
/>
<TextField
margin="normal"
id="new-email"
label="Email"
type="email"
fullWidth
value={newUser.email}
onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
/>
<TextField
margin="normal"
id="new-password"
label="Password"
type="password"
fullWidth
value={newUser.password}
onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
/>
<TextField
margin="normal"
id="new-persona"
label="Persona"
select
fullWidth
value={newUser.persona}
onChange={(e) => setNewUser({ ...newUser, persona: e.target.value })}
>
<MenuItem value="User">User</MenuItem>
<MenuItem value="Administrator">Administrator</MenuItem>
</TextField>
<Button onClick={handleAddUser} variant="contained" color="primary">
Add User
</Button>
</Box>
</DialogContent>
<DialogActions>
<Button onClick={() => setManageUsersDialogOpen(false)}>Close</Button>
</DialogActions>
</Dialog>
<Box sx={{ display: 'flex', justifyContent: 'center', background: '#fafafa', padding: '8px 0' }}>
          {sections.map((section) => (
            <Button
              key={section.title}
              sx={{ margin: '0 10px', textTransform: 'none' }}
              // Here you can add onClick handler if you want these to be interactive
            >
              <Typography variant="subtitle1" color="inherit">
                {section.title}
              </Typography>
            </Button>
          ))}
        </Box>
</React.Fragment>
);
}

Header.propTypes = {
sections: PropTypes.array,
title: PropTypes.string.isRequired,
};

export default Header;

