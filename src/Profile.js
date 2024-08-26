import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, IconButton, Button, Modal, TextField, InputAdornment } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const { userId } = useParams(); // Extract userId from the URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPersonalInfo, setOpenPersonalInfo] = useState(false);
  const [openSecurity, setOpenSecurity] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Fetch the admin data using the userId
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admins/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched user data:', data);
        setUserData(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
        toast.error('Failed to load user data'); // Show error toast
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleOpenPersonalInfo = () => setOpenPersonalInfo(true);
  const handleClosePersonalInfo = () => setOpenPersonalInfo(false);

  const handleOpenSecurity = () => setOpenSecurity(true);
  const handleCloseSecurity = () => setOpenSecurity(false);

  const handleUpdatePersonalInfo = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admins/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      if (!response.ok) {
        throw new Error('Failed to update personal information');
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      toast.success('Personal information updated successfully'); // Show success toast
      handleClosePersonalInfo();
    } catch (error) {
      console.error('Error updating personal information:', error);
      toast.error('Failed to update personal information'); // Show error toast
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admins/${userId}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      toast.success('Password updated successfully'); // Show success toast
      
      // Clear the password fields after successful update
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      handleCloseSecurity();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password'); // Show error toast
    }
  };

  const toggleShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  if (loading) {
    return <Typography>Loading...</Typography>; // Show a loading state while fetching data
  }

  if (error) {
    return <Typography>Error: {error}</Typography>; // Show error if fetching fails
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      
      <Box sx={{ position: 'relative', mt: 2 }}>
        <Avatar
          alt="Profile Picture"
          src={userData.profilePicture || "/default-avatar.png"} // Display admin's profile picture
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
        {userData.firstName} {userData.lastName} {/* Display admin's full name */}
      </Typography>
      
      <Typography variant="subtitle1" sx={{ color: 'gray' }}>
        {userData.email} {/* Display admin's email */}
      </Typography>

      <Button
        variant="outlined"
        sx={{ mt: 3, width: '200px', borderColor: '#3f51b5', color: '#3f51b5' }}
        onClick={handleOpenPersonalInfo}
      >
        Personal Information
      </Button>

      <Button
        variant="outlined"
        sx={{ mt: 2, width: '200px', borderColor: '#3f51b5', color: '#3f51b5' }}
        onClick={handleOpenSecurity}
      >
        Security
      </Button>

      {/* Personal Information Modal */}
      <Modal
        open={openPersonalInfo}
        onClose={handleClosePersonalInfo}
        aria-labelledby="personal-info-modal-title"
        aria-describedby="personal-info-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography id="personal-info-modal-title" variant="h6" component="h2">
            Change Personal Information
          </Typography>
          <TextField
            fullWidth
            label="First Name"
            variant="outlined"
            margin="normal"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            fullWidth
            label="Last Name"
            variant="outlined"
            margin="normal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={handleUpdatePersonalInfo}>
            Save
          </Button>
        </Box>
      </Modal>

      {/* Security Modal */}
      <Modal
        open={openSecurity}
        onClose={handleCloseSecurity}
        aria-labelledby="security-modal-title"
        aria-describedby="security-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography id="security-modal-title" variant="h6" component="h2">
            Security
          </Typography>
          <TextField
            fullWidth
            label="Current Password"
            variant="outlined"
            margin="normal"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowCurrentPassword} edge="end">
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            variant="outlined"
            margin="normal"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowNewPassword} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            variant="outlined"
            margin="normal"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowConfirmPassword} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={handleUpdatePassword}>
            Save
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

// Modal styling
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
};

export default Profile;
