// src/nutritionist/Notifications.js

import React from 'react';
import { Box, Typography } from '@mui/material';

function Notifications() {
  return (
    <Box p={2}>
      <Typography variant="h4" component="h2">
        Notifications
      </Typography>
      <Typography variant="body1">
        Here are your notifications.
      </Typography>
    </Box>
  );
}

export default Notifications;
