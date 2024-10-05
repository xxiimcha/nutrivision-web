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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneIcon from '@mui/icons-material/Phone';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import DailyIframe from '@daily-co/daily-js'; // Import Daily.co JS library

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const socket = io('http://localhost:5000'); // Connect to your Socket.io server

const Telemed = () => {
  const { userId } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [callFrame, setCallFrame] = useState(null); // Store Daily call frame
  const [isInCall, setIsInCall] = useState(false);  // Track call status

  const dailyAPIKey = '81ad64c2ef801f352d0b403f1b93cd5e93458e6dbe75d877c85be87c29173aba'; // Your Daily.co API key

  // Fetch missed calls and notifications
  useEffect(() => {
    const fetchCallData = async () => {
      try {
        const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications/${userId}`);
        setNotifications(notificationsResponse.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchCallData();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      socket.emit('register-user', userId);
    }

    socket.on('incoming-call', (data) => {
      setIncomingCall(data.callerId);
    });

    return () => {
      socket.off('incoming-call');
    };
  }, [userId]);

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  // Send message function
  const handleSendMessage = async () => {
    if (newMessage.trim() !== '' && userId && selectedUser) {
      try {
        const response = await axios.post(`${API_BASE_URL}/messages/send`, {
          sender: userId,
          receiver: selectedUser._id,
          text: newMessage,
        });
        setMessages([...messages, response.data]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  // Fetch and display messages with the selected user
  const handleUserClick = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/conversation`, {
        params: {
          user1: userId,
          user2: user._id,
        },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Initiate a call using Daily.co API
  const initiateCall = async (callType) => {
    try {
      const roomResponse = await axios.post(
        'https://api.daily.co/v1/rooms',
        {
          properties: {
            enable_screenshare: true,
            enable_chat: true,
            max_participants: 2,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${dailyAPIKey}`,
          },
        }
      );
      
      const roomUrl = roomResponse.data.url;

      // Open a new window with the call URL
      const newWindow = window.open(roomUrl, '_blank', 'width=800,height=600');
      if (newWindow) {
        newWindow.focus(); // Bring the new window to the front
      }

      // Emit socket event for call initiation
      socket.emit('call-user', { callerId: userId, receiverId: selectedUser._id, callType });
    } catch (error) {
      console.error('Error initiating call with Daily.co:', error);
    }
  };


  // End/Leave the call
  const leaveCall = () => {
    if (callFrame) {
      callFrame.leave();  // Disconnect from the call
      setCallFrame(null); // Reset call frame
      setIsInCall(false); // Update call status
    }
  };

  // Call actions
  const acceptCall = () => {
    socket.emit('accept-call', { callerId: incomingCall, receiverId: userId });
    setIncomingCall(null);
  };

  const declineCall = () => {
    socket.emit('decline-call', { callerId: incomingCall, receiverId: userId });
    setIncomingCall(null);
  };

  // Display the latest message from a user
  const getLatestMessage = (user) => {
    const relevantMessages = messages.filter(
      (message) =>
        (message.sender === userId && message.receiver === user._id) ||
        (message.sender === user._id && message.receiver === userId)
    );
    if (relevantMessages.length === 0) {
      return 'Start conversation';
    }
    const latestMessage = relevantMessages.reduce((latest, current) => {
      return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
    });
    return latestMessage.text;
  };

  return (
    <Container sx={{ height: '100vh', padding: 0 }}>
      <Grid container sx={{ height: '100%' }}>
        <Grid item xs={12} md={4} lg={3} sx={{ borderRight: { xs: 'none', md: '1px solid #ccc' }, padding: 2, bgcolor: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Chats
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Search user..."
            fullWidth
            size="small"
            sx={{ marginBottom: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <List>
            {users.map((user) => (
              <ListItem
                button
                key={user._id}
                onClick={() => handleUserClick(user)}
                selected={selectedUser?._id === user._id}
                sx={{ bgcolor: selectedUser?._id === user._id ? 'primary.light' : 'inherit', color: selectedUser?._id === user._id ? 'primary.contrastText' : 'inherit' }}
              >
                <ListItemAvatar>
                  <Avatar>{user.firstName?.charAt(0).toUpperCase() || 'U'}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={`${user.firstName || 'Unknown'} ${user.lastName || ''}`.trim()} secondary={getLatestMessage(user)} />
              </ListItem>
            ))}
          </List>
        </Grid>

        <Grid item xs={12} md={8} lg={9} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 2 }}>
          {selectedUser ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: 1, marginBottom: 2 }}>
              <Typography variant="h6">
                Conversation with {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()}
              </Typography>
              <Box>
                <IconButton color="primary" onClick={() => initiateCall('video')}>
                  <VideocamIcon />
                </IconButton>
                <IconButton color="primary" onClick={() => initiateCall('audio')}>
                  <PhoneIcon />
                </IconButton>
                {/* Display the leave button when a call is in progress */}
                {isInCall && (
                  <Button variant="contained" color="secondary" onClick={leaveCall}>
                    Leave Call
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Typography variant="h6" align="center">
              Select a user to start a conversation
            </Typography>
          )}

          {selectedUser && (
            <Box sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: 2 }}>
              <List>
                {messages.map((message, index) => (
                  <ListItem key={index} sx={{ display: 'flex', justifyContent: message.sender === userId ? 'flex-end' : 'flex-start' }}>
                    <Paper
                      sx={{
                        padding: 1,
                        maxWidth: '70%',
                        bgcolor: message.sender === userId ? 'primary.main' : 'grey.300',
                        color: message.sender === userId ? 'primary.contrastText' : 'text.primary',
                        borderRadius: '10px',
                        wordWrap: 'break-word',
                      }}
                    >
                      <Typography variant="body2">{message.text}</Typography>
                    </Paper>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {selectedUser && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Type your message..."
                value={newMessage}
                onChange={handleMessageChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 2, borderRadius: '20px', minWidth: '100px' }}>
                Send
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      {incomingCall && (
        <div>
          <p>Incoming call from user {incomingCall}!</p>
          <Button onClick={acceptCall} variant="contained" color="primary" sx={{ mr: 2 }}>
            Accept
          </Button>
          <Button onClick={declineCall} variant="outlined" color="secondary">
            Decline
          </Button>
        </div>
      )}

      {notifications.length > 0 && (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Notifications:
          </Typography>
          <List>
            {notifications.map((notification, index) => (
              <ListItem key={index}>
                <ListItemText primary={notification.title} secondary={notification.message} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
};

export default Telemed;
