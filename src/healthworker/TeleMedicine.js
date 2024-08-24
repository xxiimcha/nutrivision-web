import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  InputAdornment,
  ListItemAvatar,
  Grid,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneIcon from '@mui/icons-material/Phone';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const Telemed = () => {
  const { userId } = useContext(UserContext);  // Get userId from UserContext
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Fetch users from backend
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
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

  const handleSendMessage = async () => {
    console.log('Send button clicked');
    console.log('userId:', userId);
    console.log('selectedUser:', selectedUser);
    console.log('newMessage:', newMessage);

    if (newMessage.trim() !== '' && userId && selectedUser) {
      try {
        const response = await axios.post('http://localhost:5000/api/messages/send', {
          sender: userId,  // Use userId here
          receiver: selectedUser._id,  // Assuming selectedUser is set correctly
          text: newMessage,
        });

        console.log('Message sent:', response.data);

        setMessages([...messages, response.data]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.log('Validation failed: Message not sent.');
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear messages for the new conversation
  };

  return (
    <Container sx={{ height: '100vh', padding: 0 }}>
      <Grid container sx={{ height: '100%' }}>
        {/* Sidebar */}
        <Grid
          item
          xs={12}
          md={4}
          lg={3}
          sx={{
            borderRight: { xs: 'none', md: '1px solid #ccc' },
            padding: 2,
            bgcolor: '#f0f4f8',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
            {/* Display fetched users in the chat list */}
            {users.map((user) => (
              <ListItem button key={user._id} onClick={() => handleUserClick(user)}>
                <ListItemAvatar>
                  <Avatar>{user.email.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.email} secondary="Last message..." />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Chat window */}
        <Grid
          item
          xs={12}
          md={8}
          lg={9}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 2,
          }}
        >
          {/* Chat header */}
          {selectedUser ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ccc',
                paddingBottom: 1,
                marginBottom: 2,
              }}
            >
              <Typography variant="h6">Conversation with {selectedUser.email}</Typography>
              <Box>
                <IconButton color="primary">
                  <VideocamIcon />
                </IconButton>
                <IconButton color="primary">
                  <PhoneIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Typography variant="h6" align="center">
              Select a user to start a conversation
            </Typography>
          )}

          {/* Chat messages */}
          {selectedUser && (
            <Box sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: 2 }}>
              <List>
                {messages.map((message, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText primary={message.text} secondary={message.sender === userId ? 'You' : selectedUser.email} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {/* Message input */}
          {selectedUser && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Type your message..."
                value={newMessage}
                onChange={handleMessageChange}
              />
              <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 2 }}>
                Send
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Telemed;
