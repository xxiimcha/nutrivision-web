import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);  // State for profile picture

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    const storedProfilePicture = localStorage.getItem('userProfilePicture');  // Retrieve profile picture from localStorage

    if (storedRole) {
      setRole(storedRole);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
    if (storedName) {
      setName(storedName);
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (storedProfilePicture) {
      setProfilePicture(storedProfilePicture);  // Set profile picture
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ role, setRole, userId, setUserId, name, setName, email, setEmail, profilePicture, setProfilePicture }}
    >
      {children}
    </UserContext.Provider>
  );
};
