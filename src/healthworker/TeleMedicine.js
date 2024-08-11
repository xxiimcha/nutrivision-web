import React, { useState } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Telemed = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages((prevMessages) => [...prevMessages, { text: newMessage, sender: 'user' }]);
      setNewMessage('');
    }
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
            {/* Chat list items */}
            {['John Doe', 'Jane Smith', 'Alice Johnson'].map((name, index) => (
              <ListItem button key={index}>
                <ListItemAvatar>
                  <Avatar>{index + 1}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={name} secondary="Last message..." />
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              borderBottom: '1px solid #ccc',
              paddingBottom: 1,
              marginBottom: 2,
            }}
          >
            <Typography variant="h6">Conversation with John Doe</Typography>
          </Box>

          {/* Chat messages */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: 2 }}>
            <List>
              {messages.map((message, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText primary={message.text} secondary={message.sender === 'user' ? 'You' : 'Doctor'} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Box>

          {/* Message input */}
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default Telemed;
