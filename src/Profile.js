import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, IconButton, Button, TextField, InputAdornment, Modal } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { storage } from './firebase/firebaseConfig'; // Import your firebase config
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const { userId } = useParams(); // Extract userId from the URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(''); // State for OTP input
  const [otpSent, setOtpSent] = useState(false); // State to track if OTP was sent
  const [newEmail, setNewEmail] = useState(''); // Track the new email before confirming with OTP
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null); // State for handling image selection
  const [otpModalOpen, setOtpModalOpen] = useState(false); // State for OTP modal

  // New state for form errors
  const [errors, setErrors] = useState({});

  // Get the API base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // Fetch the admin data using the userId
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admins/${userId}`);
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

  const validateForm = () => {
    let validationErrors = {};
    if (!firstName.trim()) {
      validationErrors.firstName = 'First Name is required';
    }
    if (!lastName.trim()) {
      validationErrors.lastName = 'Last Name is required';
    }
    if (!email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = 'Email is invalid';
    }
    return validationErrors;
  };

  const validatePasswordChange = () => {
    let validationErrors = {};
    if (!currentPassword) {
      validationErrors.currentPassword = 'Current Password is required';
    }
    if (!newPassword) {
      validationErrors.newPassword = 'New Password is required';
    }
    if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    return validationErrors;
  };

  const handleUpdatePersonalInfo = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (email !== userData.email) {
      // If email is changed, send OTP
      try {
        const response = await fetch(`${API_BASE_URL}/admins/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ firstName, lastName, email }), // Send new email for OTP
        });

        if (!response.ok) {
          throw new Error('Failed to send OTP');
        }

        toast.info('OTP sent to the new email address. Please enter the OTP to confirm the email change.');
        setOtpSent(true);
        setNewEmail(email); // Save the new email for confirmation
        setOtpModalOpen(true); // Open OTP modal
      } catch (error) {
        console.error('Error sending OTP:', error);
        toast.error('Failed to send OTP'); // Show error toast
      }
    } else {
      // If email is not changed, proceed with other updates
      updatePersonalInfo();
    }
  };

  const updatePersonalInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admins/${userId}`, {
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
    } catch (error) {
      console.error('Error updating personal information:', error);
      toast.error('Failed to update personal information'); // Show error toast
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admins/${userId}/verify-otp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp, newEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify OTP');
      }

      toast.success('Email address updated successfully');
      setOtpSent(false);
      setUserData({ ...userData, email: newEmail });
      setOtpModalOpen(false); // Close OTP modal
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP'); // Show error toast
    }
  };

  const handleUpdatePassword = async () => {
    const validationErrors = validatePasswordChange();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/admins/${userId}/change-password`, {
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
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password'); // Show error toast
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUploadPicture = async () => {
    if (!selectedImage) {
      toast.error('Please select an image to upload');
      return;
    }

    const storageRef = ref(storage, `profile-pictures/${userId}_${selectedImage.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedImage);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // You can show upload progress if needed
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Error uploading profile picture:', error);
        toast.error('Failed to upload profile picture');
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          try {
            const response = await fetch(`${API_BASE_URL}/admins/${userId}/upload-profile-picture`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ profilePicture: downloadURL }), // Send the download URL to the backend
            });

            if (!response.ok) {
              throw new Error('Failed to update profile picture URL');
            }

            const data = await response.json();
            setUserData({ ...userData, profilePicture: data.profilePicture }); // Update the profile picture
            toast.success('Profile picture updated successfully');
          } catch (error) {
            console.error('Error saving profile picture URL:', error);
            toast.error('Failed to save profile picture URL');
          }
        });
      }
    );
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
          src={userData?.profilePicture || "/default-avatar.png"} // Ensure this loads the Firebase Storage URL
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
          component="label"
        >
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
          <CameraAltIcon color="primary" />
        </IconButton>
        {selectedImage && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleUploadPicture}
          >
            Upload Picture
          </Button>
        )}
      </Box>

      <Typography variant="h6" sx={{ mt: 2 }}>
        {userData.firstName} {userData.lastName} {/* Display admin's full name */}
      </Typography>
      
      <Typography variant="subtitle1" sx={{ color: 'gray' }}>
        {userData.email} {/* Display admin's email */}
      </Typography>

      {/* Personal Information Section */}
      <Box sx={{ mt: 3, width: '100%', maxWidth: '600px' }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Edit Personal Information
        </Typography>
        <TextField
          fullWidth
          label="First Name"
          variant="outlined"
          margin="normal"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={Boolean(errors.firstName)}
          helperText={errors.firstName}
        />
        <TextField
          fullWidth
          label="Last Name"
          variant="outlined"
          margin="normal"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={Boolean(errors.lastName)}
          helperText={errors.lastName}
        />
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
        <Button
          variant="contained"
          color="success"
          sx={{ mt: 2 }}
          onClick={handleUpdatePersonalInfo}
        >
          Save Changes
        </Button>
        {otpSent && (
          <Modal
            open={otpModalOpen}
            onClose={() => setOtpModalOpen(false)}
            aria-labelledby="otp-modal-title"
            aria-describedby="otp-modal-description"
          >
            <Box sx={{ ...modalStyle }}>
              <Typography id="otp-modal-title" variant="h6" component="h2">
                Enter OTP
              </Typography>
              <TextField
                fullWidth
                label="OTP"
                variant="outlined"
                margin="normal"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
                onClick={handleVerifyOtp}
              >
                Verify OTP
              </Button>
            </Box>
          </Modal>
        )}
      </Box>

      {/* Security Section */}
      <Box sx={{ mt: 3, width: '100%', maxWidth: '600px' }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Change Password
        </Typography>
        <TextField
          fullWidth
          label="Current Password"
          variant="outlined"
          margin="normal"
          type={showCurrentPassword ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={Boolean(errors.currentPassword)}
          helperText={errors.currentPassword}
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
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword}
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
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword}
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
        <Button
          variant="contained"
          color="success"
          sx={{ mt: 2 }}
          onClick={handleUpdatePassword}
        >
          Save Password
        </Button>
      </Box>
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
