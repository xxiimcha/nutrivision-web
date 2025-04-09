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
import { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import logo from '../images/logo.png'
import cemboLogo from '../images/cembo-logo.png'
import loginBg from '../images/login-bg.png';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton'; 
import OtpIcon from '../images/otp.png';

const defaultTheme = createTheme();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function SignInSide() {
  const { setRole, setUserId, setName, setEmail } = useContext(UserContext);
  const [step, setStep] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [otp, setOtp] =  useState(new Array(6).fill(''));
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [countdown, setCountdown] = useState(30); // Added countdown
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    const value = element.value;
    if (/^[0-9]$/.test(value)) {
      // Set the value for this index in the OTP array
      let newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      console.log("otp ", newOtp);

      // Move focus to the next input field
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    } else if (value === '') {
      // Allow clearing the input
      let newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      console.log("otp ", newOtp);
    }


  };

  const handleKeyDown = (e, index) => {
    // Handle backspace to move focus to the previous input
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleResendOtp = async () => {
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login/resend-otp`, { email: loginEmail });
      
      if (response.status === 200) {
          startCountdown();
          alert('otp sent successfully')

      }
    } catch (error) {
      console.error('Error sending otp:', error);
      alert('Invalid credentials');
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
   
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

 

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      if (response.status === 200) {
        setLoginEmail(email);
        if (response.data.otpRequired) {
          setStep('otp');
          startCountdown();
        } else {
          const { role, _id, name, email } = response.data;
          setRole(role);
          setUserId(_id);
          setName(name);
          setEmail(email);
          localStorage.setItem('userRole', role);
          localStorage.setItem('userId', _id);
          localStorage.setItem('userName', name);
          localStorage.setItem('userEmail', email);
          navigate(`/dashboard`);
        }
      }
    } catch (error) {
      console.error('Invalid credentials:', error);
      alert('Invalid credentials');
    }
  };

  const startCountdown = () => {
    setIsLoading(true)
    let timer = 30;
    const countdownInterval = setInterval(() => {
      timer--;
      setCountdown(timer);
      if (timer <= 0) {
        clearInterval(countdownInterval);
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();

    const otpString = otp.join('');
    console.log(otpString);

    try {
      const response = await axios.post(`${API_BASE_URL}/login/verify-otp`, { email: loginEmail, otp: otpString });
      if (response.status === 200) {
        const { role, _id, name, email } = response.data;
        setRole(role);
        setUserId(_id);
        setName(name);
        setEmail(email);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', _id);
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        navigate(`/dashboard`);
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
      await axios.post(`${API_BASE_URL}/login/forgot-password`, { email: forgotPasswordEmail });
      alert('Password reset link sent to your email');
      setForgotPasswordOpen(false);
    } catch (error) {
      console.error('Failed to send password reset link:', error);
      alert('Failed to send password reset link');
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box component="main" sx={{display: 'flex', height: '100vh' }}>
        <CssBaseline />
        <Box    
          sx={{
            width: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: `url(${loginBg})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        > 
          <Box
            component="img"
            src={cemboLogo}
            alt="Cembo Logo"
            sx={{
                   // Adjust as necessary
              width: '50%',       // Adjust the width of the image
              height: 'auto',
            }}
          />
                
        </Box>
         

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50%', backgroundColor: '#D9E5F7'}}>

        {step === 'login' ? (
        <Box
        component={Paper}
        elevation={6}
        sx={{
          mx: 15,
          height: '90%',
          borderRadius: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', // Centering content vertically and horizontally
        }}
      >
        <Box
          sx={{
            my: 4,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={logo} alt="Logo" style={{ width: '150px', height: '150px' }} />
          <Typography
            component="h1"
            variant="h5"
            sx={{
              fontWeight: 'bold',
              fontSize: '32px',
              mt: 2,
              mb: 2,
            }}
          >
            {step === 'login' ? 'Welcome!' : 'OTP Verification'}
          </Typography>
      
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
                '& .MuiOutlinedInput-root': {
                  borderRadius: 10, // Apply borderRadius to the root input field
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'} // Toggle between text and password
              id="password"
              autoComplete="current-password"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 10, // Apply borderRadius to the root input field
                },
              }}
              InputProps={{
                // Add an adornment to show the icon inside the input
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Link
              href="#"
              variant="body2"
              onClick={() => setForgotPasswordOpen(true)}
              sx={{ display: 'block', textAlign: 'right', mb: 2 }}
            >
              Forgot password?
            </Link>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mb: 2, py: 1.4, borderRadius: 10 }}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Box>
      
      ): (
        <Box
          component={Paper}
          elevation={6}
          sx={{
            m: 15,
            mx: 12,
            height: '90%',
            borderRadius: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              my: 4,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <img
              src={OtpIcon}
              alt="Logo"
              style={{  width: '200px', height: 'auto' }}
            />
            <Typography
              component="h1"
              variant="h5"
              sx={{  fontWeight: 'bold', fontSize: '32px', mt: 2, mb: 2 }}
            >
              {step === 'login' ? 'Welcome!' : 'OTP Verification'}
            </Typography>

            <Box component="form" onSubmit={handleOtpSubmit} sx={{ mt: 2,}}>
              <Typography sx={{ textAlign: 'center', mb: 2 }}>
                A verification has been sent to your email. Please check your email to verify.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                {otp.map((digit, index) => (
                  <TextField
                    key={index}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center', fontSize: '1.5rem' }, // Styling for individual box
                    }}
                    sx={{ width: '60px', marginRight: '10px' }}
                    value={otp[index]}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    inputRef={(el) => (inputRefs.current[index] = el)} // Store the reference to input
                  />
                ))}
              </Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2">Time remaining: {countdown}s</Typography>

                <Typography variant="body2" sx={{ mt: 2 }}>
                  Didn’t receive the verification OTP? 
                  <Button onClick={handleResendOtp} disabled={isLoading} variant="body2">
                    Resend OTP
                  </Button>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button type="submit" variant="contained" sx={{ mb: 2 }}>
                  Verify OTP
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

          )}
        </Box>
      </Box>

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
