import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState(null);  // Added state for name
  const [email, setEmail] = useState(null);  // Added state for email

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('userName');  // Retrieve stored name
    const storedEmail = localStorage.getItem('userEmail');  // Retrieve stored email

    if (storedRole) {
      setRole(storedRole);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
    if (storedName) {
      setName(storedName);  // Set the name from localStorage
    }
    if (storedEmail) {
      setEmail(storedEmail);  // Set the email from localStorage
    }
  }, []);

  return (
    <UserContext.Provider value={{ role, setRole, userId, setUserId, name, setName, email, setEmail }}>
      {children}
    </UserContext.Provider>
  );
};
