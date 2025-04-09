import React from 'react';
import { Box, Typography } from '@mui/material';

function Dashboard() {
  return (
    <Box p={2}>
      <Typography variant="h4" component="h2">
        Health Worker Dashboard
      </Typography>
      <Typography variant="body1">
        This is the dashboard page for health workers.
      </Typography>
    </Box>
  );
}

export default Dashboard;
