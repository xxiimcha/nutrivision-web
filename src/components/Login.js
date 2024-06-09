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

import logo from '../images/logo.png'; // Import your logo image

const defaultTheme = createTheme();

export default function SignInSide() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.status === 200) {
        console.log('Logged in successfully');
        window.location.href = '/dashboard'; // Redirect to dashboard
      }
    } catch (error) {
      console.log('Invalid credentials');
      alert('Invalid credentials');
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
              width: '100%', // Adjust width as needed
              maxWidth: '400px', // Limit max width for better responsiveness
              boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)', // Add shadow
              borderRadius: '10px', // Add border radius
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <img src={logo} alt="Logo" style={{ width: '100px', height: '100px' }} /> {/* Display your logo */}
              <Typography component="h3" variant="h4" sx={{ mt: 2 }}>
                Welcome!
              </Typography>
            </Box>
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
                    fontSize: '16px', // Change input font size
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px', // Change border radius
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
                    fontSize: '16px', // Change input font size
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px', // Change border radius
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, borderRadius: '50px', boxShadow: 'none' }} // Add button styles
              >
                Login
              </Button>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
