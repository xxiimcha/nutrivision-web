import React, { useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  InputAdornment,
  ListItemAvatar,
  Grid,
  IconButton,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneIcon from '@mui/icons-material/Phone';
import axios from 'axios';
import { UserContext } from '../context/UserContext'; // Assume you have a context for User
import { initiateCall } from '../services/DailyAPI'; // Import Daily.co API-related function

const socket = io(process.env.REACT_APP_API_BASE_URL); // Using environment variable for socket connection

const Telemed = () => {
  const { userId } = useContext(UserContext); // Assume you have a user context that provides the logged-in userId
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Register user in the socket
    socket.emit('register-user', userId);

    // Handle incoming calls
    socket.on('incoming-call', (data) => {
      setIncomingCall(data.callerId);
    });

    return () => {
      socket.off('incoming-call');
    };
  }, [userId]);

  // Fetch users for chat
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users`);
        setUsers(response.data);
        setFilteredUsers(response.data); // Initially show all users
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const filtered = users.filter((user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  // Fetch messages when a user is selected
  const handleUserClick = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/messages/conversation`, {
        params: { user1: userId, user2: user._id },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/messages/send`, {
          sender: userId,
          receiver: selectedUser._id,
          text: newMessage,
        });
        setMessages([...messages, response.data]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message', error);
      }
    }
  };

  // Accept incoming call
  const acceptCall = () => {
    console.log(`Accepting call from ${incomingCall}`);
    setIncomingCall(null); // Reset incoming call after accepting
  };

  // Decline incoming call
  const declineCall = () => {
    console.log(`Declining call from ${incomingCall}`);
    setIncomingCall(null); // Reset incoming call after declining
  };

  return (
    <Container>
      <Grid container spacing={2}>
        {/* Users list */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chats
              </Typography>
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
                margin="normal"
                sx={{ marginBottom: 2 }}
              />
              <List
                sx={{
                  maxHeight: '60vh',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px', // Width of the scrollbar
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f0f0f0', // Background of the scrollbar track
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888', // Color of the scrollbar thumb
                    borderRadius: '10px', // Rounded corners
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#555', // Darker color when hovering
                  },
                }}
              >
                {filteredUsers.map((user) => (
                  <ListItem
                    button
                    key={user._id}
                    onClick={() => handleUserClick(user)}
                    selected={selectedUser?._id === user._id}
                    sx={{
                      bgcolor: selectedUser?._id === user._id ? 'primary.light' : 'background.paper',
                      color: selectedUser?._id === user._id ? 'primary.contrastText' : 'inherit',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>{user.firstName[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${user.firstName} ${user.lastName}`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Chat section */}
        <Grid item xs={12} md={8}>
          {selectedUser ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  padding: 2,
                  borderBottom: '1px solid #ccc',
                }}
              >
                <Typography variant="h6">
                  Conversation with {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Box>
                  <IconButton onClick={() => initiateCall(selectedUser._id, 'video', userId)}>
                    <VideocamIcon />
                  </IconButton>
                  <IconButton onClick={() => initiateCall(selectedUser._id, 'audio', userId)}>
                    <PhoneIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  height: '400px', // Fixed height for the conversation area
                  overflowY: 'auto',
                  padding: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: '10px',
                  mb: 2,
                  '&::-webkit-scrollbar': {
                    width: '8px', // Custom scrollbar width
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f0f0f0', // Background of scrollbar track
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888', // Color of the scrollbar thumb
                    borderRadius: '10px', // Rounded corners for thumb
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#555', // Darker color when hovering
                  },
                }}
              >
                <List>
                  {messages.map((message, index) => (
                    <ListItem key={index} sx={{ justifyContent: message.sender === userId ? 'flex-end' : 'flex-start' }}>
                      <Paper
                        sx={{
                          padding: 1,
                          bgcolor: message.sender === userId ? 'primary.main' : 'grey.300',
                          color: message.sender === userId ? 'primary.contrastText' : 'text.primary',
                          borderRadius: '10px',
                          maxWidth: '70%',
                        }}
                      >
                        <Typography>{message.text}</Typography>
                      </Paper>
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Send Message */}
              <Box display="flex">
                <TextField
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(); // Trigger message sending on Enter key
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                    },
                  }}
                />
                <Button onClick={handleSendMessage} variant="contained" sx={{ ml: 2, borderRadius: '20px' }}>
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Card sx={{ padding: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6">Select a user to chat with.</Typography>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Incoming Call Notification */}
      {incomingCall && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            bgcolor: 'background.paper',
            boxShadow: 3,
            p: 3,
            borderRadius: 2,
            zIndex: 1000,
          }}
        >
          <Typography variant="subtitle1">Incoming call from user {incomingCall}</Typography>
          <Box mt={2}>
            <Button onClick={acceptCall} variant="contained" color="primary" sx={{ mr: 2 }}>
              Accept
            </Button>
            <Button onClick={declineCall} variant="outlined" color="secondary">
              Decline
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Telemed;
