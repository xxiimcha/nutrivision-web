import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PlansIcon from '@mui/icons-material/ListAlt';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { UserContext } from './context/UserContext';
import logo from './images/logo.png';
import axios from 'axios';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from './firebase/firebaseConfig'; // Import Firebase storage config

const drawerWidth = 240;

const CustomListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: '#D9E5F7',
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.7s, transform 0.5s',
  '&:hover': {
    backgroundColor: '#4964AA',
    transform: 'scale(1.02)',
  },
  '& .MuiListItemIcon-root': {
    color: theme.palette.primary.main,
  },
}));

function DashboardLayout(props) {
  const { window } = props;
  const { role, name, email, userId, profilePicture } = useContext(UserContext); // Profile picture comes from context
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAccounts, setOpenAccounts] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null); // State to store the profile picture URL

  // Fetch profile picture from Firebase
  useEffect(() => {
    console.log('Profile picture from context:', profilePicture); // Log the value of profilePicture

    const fetchProfilePicture = async () => {
      if (profilePicture) {
        const profilePicRef = ref(storage, profilePicture);
        try {
          const url = await getDownloadURL(profilePicRef);
          setProfilePicUrl(url);
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      }
    };
    fetchProfilePicture();
  }, [profilePicture]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
        setNotifications(response.data);
        setUnreadCount(response.data.filter(notification => !notification.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Handle Drawer toggle for mobile view
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle logout, clear localStorage, and navigate to login
  const handleLogout = () => {
    console.log('Logout clicked');
    localStorage.clear();
    navigate('/login');
  };

  const toggleAccountsDropdown = () => {
    setOpenAccounts(!openAccounts);
  };

  const toggleStatusDropdown = () => {
    setOpenStatus(!openStatus);
  };

  // Handle notifications click
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          marginTop: '-70px',
          textAlign: 'center'
        }}
      >
        <Link to={`/dashboard/profile/${userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <img
            src={profilePicUrl || '/default-avatar.png'}
            alt="Profile"
            style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '10px' }}
          />
          <Typography variant="h6" noWrap component="div" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
            {name || 'User Name'}
          </Typography>
          <Typography variant="subtitle1" noWrap component="div" sx={{ fontSize: '16px', color: 'grey' }}>
            {email || 'user@example.com'}
          </Typography>
          <Typography variant="subtitle2" noWrap component="div" sx={{ fontSize: '14px', color: 'gray', fontStyle: 'italic' }}>
            {role || 'Role'}
          </Typography>
        </Link>
      </Box>
      <Divider />
      <List>
        <CustomListItem button component={Link} to="/dashboard">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </CustomListItem>

        {(role === 'Admin' || role === 'Super Admin') && (
          <CustomListItem button onClick={toggleAccountsDropdown}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Accounts" />
            {openAccounts ? <ExpandLess /> : <ExpandMore />}
          </CustomListItem>
        )}
        <Collapse in={openAccounts} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <CustomListItem sx={{ pl: 4 }} button component={Link} to="/dashboard/residence">
              <ListItemText primary="Residence" />
            </CustomListItem>
            <CustomListItem sx={{ pl: 4 }} button component={Link} to="/dashboard/admin">
              <ListItemText primary="Admin" />
            </CustomListItem>
          </List>
        </Collapse>

        {(role === 'Nutritionist' || role === 'Health Worker') && (
          <CustomListItem button onClick={toggleStatusDropdown}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Status" />
            {openStatus ? <ExpandLess /> : <ExpandMore />}
          </CustomListItem>
        )}
        <Collapse in={openStatus} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <CustomListItem sx={{ pl: 4 }} button component={Link} to="/dashboard/records-management">
              <ListItemText primary="Records" />
            </CustomListItem>
            <CustomListItem sx={{ pl: 4 }} button component={Link} to="/dashboard/monitoring">
              <ListItemText primary="Monitoring" />
            </CustomListItem>
          </List>
        </Collapse>

        {role === 'Health Worker' && (
          <CustomListItem button component={Link} to="/dashboard/calendar">
            <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
            <ListItemText primary="Calendar" />
          </CustomListItem>
        )}

        {(role === 'Nutritionist' || role === 'Health Worker') && (
          <>
            <CustomListItem button component={Link} to="/dashboard/food-management">
              <ListItemIcon><PlansIcon /></ListItemIcon>
              <ListItemText primary="Meal Plans" />
            </CustomListItem>
          </>
        )}
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#1A276C'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Logo" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
            <Typography variant="h6" noWrap component="div">
              Nutrivision
            </Typography>
          </Box>

          {role === 'Health Worker' && (
            <IconButton color="inherit" component={Link} to="/dashboard/telemedicine">
              <Badge color="error">
                <MailIcon />
              </Badge>
            </IconButton>
          )}

          <IconButton color="inherit" onClick={handleNotificationClick}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                width: '300px',
              },
            }}
          >
            {notifications.length === 0 ? (
              <MenuItem onClick={handleMenuClose}>No new notifications</MenuItem>
            ) : (
              notifications.map((notification) => (
                <MenuItem key={notification._id} onClick={() => handleMarkAsRead(notification._id)}>
                  <ListItemIcon>
                    {notification.read ? <MailIcon /> : <Badge color="secondary" variant="dot"><MailIcon /></Badge>}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                  />
                </MenuItem>
              ))
            )}
          </Menu>

          <IconButton color="inherit" component={Link} to={`/dashboard/profile/${userId}`}>
            <SettingsIcon />
          </IconButton>
          <Button color="inherit" component={Link} to="/" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#D9E5F7' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#D9E5F7' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
