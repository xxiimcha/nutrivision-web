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
} from '@mui/material';

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
    <Container>
      <Typography variant="h4" gutterBottom>
        Telemedicine
      </Typography>
      <Box sx={{ border: '1px solid #ccc', borderRadius: '5px', p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Doctor
        </Typography>
        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
    </Container>
  );
};

export default Telemed;
