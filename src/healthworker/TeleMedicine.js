import React, { useEffect, useState, useContext, useRef } from 'react';
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
  Grid,
  IconButton,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VideocamIcon from '@mui/icons-material/Videocam';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { initiateCall } from '../services/DailyAPI';

const socket = io(process.env.REACT_APP_API_BASE_URL);

const Telemed = () => {
  const { userId } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatus, setUserStatus] = useState({}); 
  const messagesEndRef = useRef(null); // Reference for scrolling to bottom

  useEffect(() => {
    socket.emit('register-user', userId);
    socket.on('incoming-call', (data) => {
      setIncomingCall(data.callerId);
    });

    return () => {
      socket.off('incoming-call');
    };
  }, [userId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users`);
        setUsers(response.data);
        setFilteredUsers(response.data);
  
        const statusMap = {};
        response.data.forEach(user => {
          statusMap[user._id] = user.status;
        });
        setUserStatus(statusMap);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };
    fetchUsers();
  }, []);  

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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Call scrollToBottom every time messages are updated
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const acceptCall = () => {
    console.log(`Accepting call from ${incomingCall}`);
    setIncomingCall(null);
  };

  const declineCall = () => {
    console.log(`Declining call from ${incomingCall}`);
    setIncomingCall(null);
  };

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Chats</Typography>
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user..."
                InputProps={{
                  startAdornment: <SearchIcon position="start" />,
                }}
                fullWidth
                sx={{ mb: 2 }}
              />
              <List sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <ListItem
                        button
                        key={user._id}
                        onClick={() => handleUserClick(user)}
                        selected={selectedUser?._id === user._id}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: selectedUser?._id === user._id ? 'primary.light' : 'background.paper',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        }}
                      >
                        <Avatar>{user.firstName ? user.firstName[0] : 'N/A'}</Avatar>
                        <ListItemText
                          primary={`${user.firstName || 'N/A'} ${user.lastName || ''}`}
                          secondary={userStatus[user._id] === 'online' ? 'Online' : 'Offline'}
                          sx={{ ml: 2 }}
                        />
                        <Box sx={{ ml: 1 }}>
                          {userStatus[user._id] === 'online' ? (
                            <Typography color="green">●</Typography>
                          ) : (
                            <Typography color="red">●</Typography>
                          )}
                        </Box>
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">No users found.</Typography>
                  )}
              </List>
            </CardContent>
          </Card>
        </Grid>

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
                {selectedUser && (
                  <Typography variant="h6">
                    Conversation with {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                )}
                <Box>
                  <IconButton
                    onClick={() => initiateCall(selectedUser._id, 'video', userId)}
                    disabled={userStatus[selectedUser._id] !== 'online'}
                  >
                    <VideocamIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <List
                sx={{
                  height: '650px', // Fixed height
                  overflowY: 'auto',
                  padding: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 3,
                  mb: 2,
                  boxShadow: 2,
                }}
              >
                {messages && messages.length > 0 ? (
                  messages.map((message, index) => {
                    const messageDate = new Date(message.timestamp);
                    let hours = messageDate.getUTCHours(); // Get the UTC hours
                    let minutes = messageDate.getUTCMinutes(); // Get the UTC minutes
                    hours = (hours + 8) % 24;
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // Convert hour '0' to '12'

                    // Format the time string
                    const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

                    // Format the date part
                    const formattedDate = messageDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    // Get the previous message's date (if exists)
                    const previousMessage = messages[index - 1];
                    const previousMessageDate = previousMessage
                      ? new Date(previousMessage.timestamp)
                      : null;
                    const formattedPreviousDate = previousMessageDate
                      ? previousMessageDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : null;

                    // Only show the date divider if the date is different from the previous message's date
                    const showDateDivider = !previousMessage || formattedDate !== formattedPreviousDate;

                    return (
                      <React.Fragment key={index}>
                        {/* Date Divider */}
                        {showDateDivider && (
                          <Typography
                            variant="body2"
                            sx={{
                              textAlign: 'center',
                              margin: '10px 0',
                              fontWeight: 'bold',
                              color: 'grey',
                            }}
                          >
                            {formattedDate}
                          </Typography>
                        )}

                        {/* Message */}
                        <ListItem sx={{ justifyContent: message.sender === userId ? 'flex-end' : 'flex-start' }}>
                          <Paper
                            elevation={2}
                            sx={{
                              padding: 1.5,
                              bgcolor: message.sender === userId ? 'primary.main' : 'grey.300',
                              color: message.sender === userId ? 'primary.contrastText' : 'text.primary',
                              borderRadius: 2,
                              maxWidth: '60%',
                            }}
                          >
                            <Typography variant="body2">{message.text}</Typography>
                            <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', mt: 1 }}>
                              {formattedTime}
                            </Typography>
                          </Paper>
                        </ListItem>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="textSecondary">No messages yet.</Typography>
                )}
                <div ref={messagesEndRef} />
              </List>

              <Box display="flex" sx={{ gap: 2 }}>
                <TextField
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent the default action of the Enter key
                      handleSendMessage(); // Trigger the send message function
                    }
                  }}
                  placeholder="Type a message..."
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <Button
                  onClick={handleSendMessage}
                  variant="contained"
                  sx={{ borderRadius: 3 }}
                >
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Card elevation={3} sx={{ padding: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6">Select a user to chat with.</Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Telemed;
