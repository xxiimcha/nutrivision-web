// src/nutritionist/Dashboard.js

import React from 'react';
import { Box, Typography } from '@mui/material';

function Dashboard() {
  return (
    <Box p={2}>
      <Typography variant="h4" component="h2">
        Nutritionist Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to the Nutritionist Dashboard. Here you can manage and view your daily tasks.
      </Typography>
    </Box>
  );
}

export default Dashboard;
