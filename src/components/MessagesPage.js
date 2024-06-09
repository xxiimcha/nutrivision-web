import React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

function MessagesPage() {
  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      <Paper elevation={3} style={{ padding: 20 }}>
        <Typography variant="h6" gutterBottom>
          Sender: John Doe
        </Typography>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur, odio eget vehicula eleifend, odio nisi tincidunt urna, eget hendrerit magna erat non nisl. In eget suscipit justo, in egestas tortor.
        </Typography>
      </Paper>
      <Paper elevation={3} style={{ padding: 20, marginTop: 20 }}>
        <Typography variant="h6" gutterBottom>
          Sender: Jane Smith
        </Typography>
        <Typography variant="body1">
          Pellentesque ac ex non ex condimentum pharetra a eget arcu. Phasellus posuere rhoncus dui. Praesent id erat arcu. Sed ac libero nec mauris vehicula laoreet. Vivamus pellentesque dictum sapien.
        </Typography>
      </Paper>
    </div>
  );
}

export default MessagesPage;
