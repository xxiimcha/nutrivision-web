import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Paper, Accordion, AccordionSummary, AccordionDetails, Grid, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link as ScrollLink, Element } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { ExpandMore as ExpandMoreIcon, CheckCircleOutline as CheckCircleOutlineIcon } from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import logo from './images/logo.png';
import heroImage from './images/kids.jpg'; // Replace with your hero image
import feature1 from './images/dashboard.png'; // Replace with your feature images
import feature2 from './images/calendar.png'; // Replace with your feature images
import phoneImage from './images/mobile.png'; // Replace with your phone image

const logoStyle = {
  width: '40px',
  height: '40px',
  marginRight: '10px',
};

const CustomPrevArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{ ...style, display: 'block', background: 'gray', borderRadius: '50%' }}
    onClick={onClick}
  />
);

const CustomNextArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{ ...style, display: 'block', background: 'gray', borderRadius: '50%' }}
    onClick={onClick}
  />
);

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  adaptiveHeight: true,
  arrows: true, // Enable arrows for navigation
  prevArrow: <CustomPrevArrow />,
  nextArrow: <CustomNextArrow />,
};

const downloadSectionStyle = {
  backgroundColor: '#1A276C', // Match the color of the AppBar
  backgroundSize: 'cover',
  minHeight: '600px', // Adjusted to minHeight to match the height of content
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white', // Match text color to contrast with the background
  padding: '0 20px', // Add horizontal padding to match the padding of other sections
};

const heroSectionStyle = {
  width: '100%',
  height: '535px', // Adjust height as needed
  backgroundImage: `url(${heroImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  textAlign: 'center',
  padding: '0 20px', // Add padding for better responsiveness
  position: 'relative',
  zIndex: 1,
  boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.5)', // Add a dark overlay
};

const heroTextStyle = {
  padding: '20px',
  borderRadius: '10px', // Rounded corners
  position: 'relative',
  zIndex: 2,
};

const heroSubTextStyle = {
  marginTop: '20px',
  fontSize: '1.2rem', // Adjust font size as needed
  maxWidth: '800px', // Limit width for better readability
};

const featureImageStyle = {
  width: '100%',
  height: 'auto',
  marginBottom: '10px',
};

const phoneImageStyle = {
  width: '100%',
  maxWidth: '450px', // Increase the maxWidth to make the image bigger
  height: 'auto',
};

const footerStyle = {
  backgroundColor: '#1A276C', // Match the color of the AppBar
  padding: '20px 0',
  textAlign: 'center',
  color: 'white', // Match text color to contrast with the background
};

const Footer = () => (
  <footer style={footerStyle}>
    <Typography variant="body2" color="textSecondary">
      &copy; {new Date().getFullYear()} Nutrivision. All rights reserved.
    </Typography>
  </footer>
);

const LandingPage = () => {
  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: '#1A276C' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}> {/* Changed justifyContent */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Nutrivision Logo" style={logoStyle} />
            <Typography variant="h6">
              Nutrivision
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFEB3B', // Change to a color of your choice
                },
              }}
            >
              <ScrollLink to="features" smooth={true} duration={500}>Features</ScrollLink>
            </Button>
            <Button
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFEB3B',
                },
              }}
            >
              <ScrollLink to="about" smooth={true} duration={500}>About</ScrollLink>
            </Button>
            <Button
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFEB3B',
                },
              }}
            >
              <ScrollLink to="awareness" smooth={true} duration={500}>Awareness</ScrollLink>
            </Button>
            <Button
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFEB3B',
                },
              }}
            >
              <ScrollLink to="download" smooth={true} duration={500}>Download</ScrollLink>
            </Button>
            <Button
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFEB3B',
                },
              }}
            >
              <ScrollLink to="faq" smooth={true} duration={500}>FAQ</ScrollLink>
            </Button>
          </Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/login"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFEB3B',
              },
            }}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Box style={heroSectionStyle}>
        <Typography variant="h2" style={heroTextStyle}>Welcome to Nutrivision</Typography>
        <Typography variant="h5" style={heroSubTextStyle}>
          Your trusted companion in nutritional guidance. Track, manage, and improve your diet with ease and accuracy.
        </Typography>
      </Box>
      <Container>
        <Element name="features" style={{ padding: '100px 0' }}>
          <Box>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>Features</Typography>
            <Slider {...sliderSettings}>
              <div>
                <Paper sx={{ padding: 2 }}>
                  <img src={feature1} alt="Feature 1" style={featureImageStyle} />
                  <Typography variant="h6" sx={{ marginBottom: 1 }}>Feature 1</Typography>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis auctor arcu in purus sollicitudin, vel venenatis enim lacinia.
                  </Typography>
                </Paper>
              </div>
              <div>
                <Paper sx={{ padding: 2 }}>
                  <img src={feature2} alt="Feature 2" style={featureImageStyle} />
                  <Typography variant="h6" sx={{ marginBottom: 1 }}>Feature 2</Typography>
                  <Typography>
                    Vestibulum euismod, leo non facilisis vestibulum, eros dolor convallis eros, non aliquet elit nulla nec nunc.
                  </Typography>
                </Paper>
              </div>
            </Slider>
          </Box>
        </Element>
        <Element name="about" style={{ padding: '100px 0' }}>
          <Box>
            <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center', color: '#1A276C' }}>About Nutrivision</Typography>
            <Typography variant="h6" sx={{ marginBottom: 2, textAlign: 'center', color: '#333', fontWeight: 'bold' }}>Our Mission</Typography>
            <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px', borderRadius: '10px', backgroundColor: '#f5f5f5' }}>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                Nutrivision, located in the vibrant community of Brgy Cembo, is dedicated to empowering individuals to take control of their nutrition and lead healthier lives. Our mission is to make understanding and managing one's diet an intuitive, accessible, and effective process for everyone.
              </Typography>
            </Paper>
            <Typography variant="h6" sx={{ marginBottom: 2, textAlign: 'center', color: '#333', fontWeight: 'bold' }}>Our Team</Typography>
            <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px', borderRadius: '10px', backgroundColor: '#f5f5f5' }}>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                Our team at Nutrivision consists of passionate nutritionists, developers, and wellness enthusiasts, all committed to providing the best tools and guidance to help you achieve your health goals. With a diverse range of backgrounds and expertise, we come together to create a holistic approach to nutritional guidance.
              </Typography>
            </Paper>
            <Typography variant="h6" sx={{ marginBottom: 2, textAlign: 'center', color: '#333', fontWeight: 'bold' }}>Our Approach</Typography>
            <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px', borderRadius: '10px', backgroundColor: '#f5f5f5' }}>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                At Nutrivision, we combine cutting-edge technology with proven nutritional science to offer personalized recommendations and insights. Whether you're aiming to manage your weight, track your macros, or simply eat healthier, our app provides tailored solutions based on your unique needs and preferences.
              </Typography>
            </Paper>
            <Typography variant="h6" sx={{ marginBottom: 2, textAlign: 'center', color: '#333', fontWeight: 'bold' }}>Join Us</Typography>
            <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px', borderRadius: '10px', backgroundColor: '#f5f5f5' }}>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                Join our community at Nutrivision, located right here in Brgy Cembo, and start your journey towards better health today. With our support, tools, and knowledge, you'll have everything you need to make informed dietary choices and reach your nutritional goals.
              </Typography>
            </Paper>
          </Box>
        </Element>
        <Element name="awareness" style={{ padding: '100px 0', backgroundColor: '#e0f7fa' }}>
          <Box>
            <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center', color: '#1A276C' }}>Awareness</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ padding: '20px', borderRadius: '10px', backgroundColor: '#ffffff' }}>
                  <Typography variant="h6" sx={{ marginBottom: 1, color: '#333', fontWeight: 'bold' }}>Child Nutrition</Typography>
                  <Typography>
                    Learn about the importance of balanced nutrition for children and how it affects their growth and development. Proper nutrition is crucial for their physical and mental well-being.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ padding: '20px', borderRadius: '10px', backgroundColor: '#ffffff' }}>
                  <Typography variant="h6" sx={{ marginBottom: 1, color: '#333', fontWeight: 'bold' }}>Healthy Eating Habits</Typography>
                  <Typography>
                    Discover tips and strategies to cultivate healthy eating habits in your daily life. Understand how to make healthier food choices and the benefits they bring.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ padding: '20px', borderRadius: '10px', backgroundColor: '#ffffff' }}>
                  <Typography variant="h6" sx={{ marginBottom: 1, color: '#333', fontWeight: 'bold' }}>Community Initiatives</Typography>
                  <Typography>
                    Get involved in local community initiatives aimed at promoting nutritional awareness and healthy lifestyles. Learn how you can contribute and make a difference.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Element>
        <Element name="download" style={downloadSectionStyle}>
          <Container maxWidth="lg"> {/* Use maxWidth to ensure consistent width */}
            <Box>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <img src={phoneImage} alt="Phone" style={phoneImageStyle} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" sx={{ marginBottom: 2 }}>Download Our App</Typography>
                  <Typography>
                    Download our mobile app to easily track and manage your nutrition
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Element>
        <Element name="faq" style={{ padding: '100px 0' }}>
          <Box>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>FAQ</Typography>
            <Accordion sx={{ boxShadow: 'none', borderRadius: '10px', border: '1px solid #ddd' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd', borderRadius: '10px' }}
              >
                <Typography variant="h6" sx={{ flexBasis: '33.33%', flexShrink: 0 }}>
                  How do I create an account?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  To create an account, go to the login page and click on the "Sign Up" button. Follow the instructions to complete the registration process.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{ boxShadow: 'none', borderRadius: '10px', border: '1px solid #ddd', marginTop: '20px' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
                sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd', borderRadius: '10px' }}
              >
                <Typography variant="h6" sx={{ flexBasis: '33.33%', flexShrink: 0 }}>
                  Can I use the app offline?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Yes, you can use certain features of the app offline. However, some functionalities may require an internet connection.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{ boxShadow: 'none', borderRadius: '10px', border: '1px solid #ddd', marginTop: '20px' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3a-content"
                id="panel3a-header"
                sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd', borderRadius: '10px' }}
              >
                <Typography variant="h6" sx={{ flexBasis: '33.33%', flexShrink: 0 }}>
                  Is my data secure?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  We take security seriously and implement measures to protect your data. Your information is encrypted and stored securely.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Element>
      </Container>
      <Footer /> {/* Adding the Footer component */}
    </div>
  );
};

export default LandingPage;
