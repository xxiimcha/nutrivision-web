// ✅ Telemed.jsx (Full component with popup video call)
import React, { useEffect, useState, useContext, useRef } from 'react';
import io from 'socket.io-client';
import {
  Box, Button, Container, TextField, Typography, List, ListItem, ListItemText, Avatar,
  Grid, IconButton, Paper, Card, CardContent, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VideocamIcon from '@mui/icons-material/Videocam';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const socket = io(process.env.REACT_APP_SOCKET_URL);

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
  const [incomingChannel, setIncomingChannel] = useState('');
  const [incomingToken, setIncomingToken] = useState('');
  const messagesEndRef = useRef(null);

  const AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;

  useEffect(() => {
    socket.emit('register-user', userId);

    socket.on('incoming-call', (data) => {
      setIncomingCall(data.callerId);
      setIncomingChannel(data.channelName);
      setIncomingToken(data.token);
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

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter((user) =>
        user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const openCallWindow = (channelName, token) => {
    const callWindow = window.open(
      `/video-call.html?appId=${AGORA_APP_ID}&channelName=${channelName}&token=${token}&uid=${userId}`,
      '_blank',
      'width=800,height=600'
    );
    if (!callWindow) alert('Popup blocked! Please allow popups.');
  };

  const acceptCall = () => {
    setIncomingCall(null);
    openCallWindow(incomingChannel, incomingToken);
  };

  const declineCall = () => {
    setIncomingCall(null);
    setIncomingChannel('');
    setIncomingToken('');
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
                InputProps={{ startAdornment: <SearchIcon position="start" /> }}
                fullWidth sx={{ mb: 2 }}
              />
              <List sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {filteredUsers.length > 0 ? (
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
                        '&:hover': { bgcolor: 'primary.light' },
                      }}
                    >
                      <Avatar>{user.firstName ? user.firstName[0] : 'N/A'}</Avatar>
                      <ListItemText
                        primary={`${user.firstName || 'N/A'} ${user.lastName || ''}`}
                        secondary={userStatus[user._id] === 'online' ? 'Online' : 'Offline'}
                        sx={{ ml: 2 }}
                      />
                      <Box sx={{ ml: 1 }}>
                        <Typography color={userStatus[user._id] === 'online' ? 'green' : 'red'}>●</Typography>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2, borderBottom: '1px solid #ccc' }}>
                <Typography variant="h6">
                  Conversation with {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <IconButton
                  onClick={async () => {
                    const channelName = `${userId}-${selectedUser._id}`;
                    try {
                      const tokenRes = await axios.get(`${process.env.REACT_APP_AGORA_TOKEN_URL}?channelName=${channelName}`);
                      const token = tokenRes.data.token;

                      socket.emit('incoming-call', {
                        callerId: userId,
                        receiverId: selectedUser._id,
                        channelName,
                        token,
                        callType: 'video'
                      });

                      openCallWindow(channelName, token);
                    } catch (err) {
                      console.error('Error getting token or starting call:', err);
                    }
                  }}
                  disabled={userStatus[selectedUser._id] !== 'online'}
                >
                  <VideocamIcon />
                </IconButton>
              </Box>

              <List sx={{ height: '650px', overflowY: 'auto', padding: 2, bgcolor: '#f5f5f5', borderRadius: 3, mb: 2, boxShadow: 2 }}>
                {messages.map((message, index) => {
                  const messageDate = new Date(message.timestamp);
                  let hours = (messageDate.getUTCHours() + 8) % 24;
                  const minutes = messageDate.getUTCMinutes();
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12 || 12;
                  const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
                  const formattedDate = messageDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                  const prev = messages[index - 1];
                  const showDate = !prev || new Date(prev.timestamp).toLocaleDateString() !== messageDate.toLocaleDateString();

                  return (
                    <React.Fragment key={index}>
                      {showDate && (
                        <Typography variant="body2" sx={{ textAlign: 'center', m: '10px 0', fontWeight: 'bold', color: 'grey' }}>
                          {formattedDate}
                        </Typography>
                      )}
                      <ListItem sx={{ justifyContent: message.sender === userId ? 'flex-end' : 'flex-start' }}>
                        <Paper
                          elevation={2}
                          sx={{ padding: 1.5, bgcolor: message.sender === userId ? 'primary.main' : 'grey.300', color: message.sender === userId ? 'primary.contrastText' : 'text.primary', borderRadius: 2, maxWidth: '60%' }}
                        >
                          <Typography variant="body2">{message.text}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>{formattedTime}</Typography>
                        </Paper>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </List>

              <Box display="flex" sx={{ gap: 2 }}>
                <TextField
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <Button onClick={handleSendMessage} variant="contained" sx={{ borderRadius: 3 }}>
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

      <Dialog
        open={!!incomingCall}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: '#0d47a1',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', textAlign: 'center' }}>Incoming Video Call</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 4 }}>{incomingCall} is calling...</Typography>
          <Box display="flex" gap={3}>
            <Button variant="contained" color="error" onClick={declineCall} sx={{ fontSize: '1rem', px: 4 }}>Decline</Button>
            <Button variant="contained" color="success" onClick={acceptCall} sx={{ fontSize: '1rem', px: 4 }}>Accept</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Telemed;
