import React from 'react';
import { Box, Typography, Button, Avatar, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      
      <Box sx={{ position: 'relative', mt: 2 }}>
        <Avatar
          alt="Profile Picture"
          src="/default-avatar.png" // Replace with actual image path or URL
          sx={{ width: 100, height: 100 }}
        />
        <IconButton
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            right: 0, 
            bgcolor: 'white', 
            borderRadius: '50%', 
            boxShadow: 3,
          }}
          aria-label="Change Profile Picture"
        >
          <CameraAltIcon color="primary" />
        </IconButton>
      </Box>

      <Typography variant="h6" sx={{ mt: 2 }}>
        Admin
      </Typography>
      
      <Typography variant="subtitle1" sx={{ color: 'gray' }}>
        admin@example.com
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'gray', mt: 1 }}>
        Role
      </Typography>

      <Button
        variant="outlined"
        sx={{ mt: 3, width: '200px', borderColor: '#3f51b5', color: '#3f51b5' }}
        onClick={() => navigate('/personal-information')}
      >
        Personal Information
      </Button>

      <Button
        variant="outlined"
        sx={{ mt: 2, width: '200px', borderColor: '#3f51b5', color: '#3f51b5' }}
        onClick={() => navigate('/security')}
      >
        Security
      </Button>
    </Box>
  );
};

export default Profile;
