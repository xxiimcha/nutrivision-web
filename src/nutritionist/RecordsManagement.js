// src/nutritionist/RecordsManagement.js

import React from 'react';
import { Box, Typography } from '@mui/material';

function RecordsManagement() {
  return (
    <Box p={2}>
      <Typography variant="h4" component="h2">
        Records Management
      </Typography>
      <Typography variant="body1">
        Manage and review records related to your patients.
      </Typography>
    </Box>
  );
}

export default RecordsManagement;
