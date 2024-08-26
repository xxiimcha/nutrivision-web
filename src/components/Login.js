import * as React from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import logo from '../images/logo.png';

const defaultTheme = createTheme();

export default function SignInSide() {
  const { setRole, setUserId, setName, setEmail } = useContext(UserContext);
  const [step, setStep] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.status === 200) {
        setLoginEmail(email);
        if (response.data.otpRequired) {
          setStep('otp');
        } else {
          const { role, _id, name, email } = response.data;
          console.log('User Role:', role);
          console.log('User Name:', name);
          console.log('User Email:', email);
          console.log('User ID:', _id);
          setRole(role);
          setUserId(_id);
          setName(name);
          setEmail(email);
          localStorage.setItem('userRole', role);
          localStorage.setItem('userId', _id);
          localStorage.setItem('userName', name);
          localStorage.setItem('userEmail', email);
          navigate(`/dashboard/${role.toLowerCase()}`);
        }
      }
    } catch (error) {
      console.error('Invalid credentials:', error);
      alert('Invalid credentials');
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login/verify-otp', { email: loginEmail, otp });
      if (response.status === 200) {
        const { role, _id, name, email } = response.data;
        console.log('User Role:', role);
        console.log('User Name:', name);
        console.log('User Email:', email);
        console.log('User ID:', _id);
        setRole(role);
        setUserId(_id);
        setName(name);
        setEmail(email);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', _id);
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        navigate(`/dashboard/${role.toLowerCase()}`);
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      alert('OTP verification failed');
    }
  };

  const handleForgotPasswordSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/login/forgot-password', { email: forgotPasswordEmail });
      alert('Password reset link sent to your email');
      setForgotPasswordOpen(false);
    } catch (error) {
      console.error('Failed to send password reset link:', error);
      alert('Failed to send password reset link');
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box
            sx={{
              p: 4,
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <img src={logo} alt="Logo" style={{ width: '100px', height: '100px' }} />
              <Typography component="h3" variant="h4" sx={{ mt: 2 }}>
                Welcome!
              </Typography>
            </Box>

            {step === 'login' ? (
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '16px',
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '50px',
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '16px',
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '50px',
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, borderRadius: '50px', boxShadow: 'none' }}
                >
                  Login
                </Button>
                <Link
                  href="#"
                  variant="body2"
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{ display: 'block', textAlign: 'center', mt: 2 }}
                >
                  Forgot password?
                </Link>
              </Box>
            ) : (
              <Box component="form" noValidate onSubmit={handleOtpSubmit} sx={{ mt: 1 }}>
                <Typography variant="h6" align="center">
                  Enter the OTP sent to your email
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="otp"
                  label="OTP"
                  name="otp"
                  autoComplete="otp"
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '16px',
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '50px',
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, borderRadius: '50px', boxShadow: 'none' }}
                >
                  Verify OTP
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="forgotPasswordEmail"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
          <Button onClick={handleForgotPasswordSubmit}>Send Reset Link</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
