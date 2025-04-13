// src/nutritionist/NutritionalStatus.js

import React from 'react';
import { Box, Typography } from '@mui/material';

function NutritionalStatus() {
  return (
    <Box p={2}>
      <Typography variant="h4" component="h2">
        Nutritional Status
      </Typography>
      <Typography variant="body1">
        Track and manage the nutritional status of your patients.
      </Typography>
    </Box>
  );
}

export default NutritionalStatus;
