import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [subscribedCategories, setSubscribedCategories] = useState([]);

  useEffect(() => {
    // Listen for user changes and update local storage accordingly
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user data from local storage
    setUser(null); // Update state
  };

  return (
    <UserContext.Provider value={{ user, setUser, handleLogout, subscribedCategories, setSubscribedCategories }}>
      {children}
    </UserContext.Provider>
  );
};
