import React, { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
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
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import PlansIcon from '@mui/icons-material/ListAlt';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';
import { UserContext } from './context/UserContext';

// Import the logo image
import logo from './images/logo.png';

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
  const { role } = useContext(UserContext); // Use the UserContext to get the role

  const [mobileOpen, setMobileOpen] = React.useState(false);

  console.log("Current role:", role); // Debugging to see the current role

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const drawer = (
    <div>
      <Toolbar />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, marginTop: '-70px', marginLeft: '20px' }}>
        <img src={logo} alt="Logo" style={{ width: '100px', height: '100px', marginRight: '10px', marginLeft: '-50px'}} />
        <Typography variant="h6" noWrap component="div" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
          Nutrivision
        </Typography>
      </Box>
      <Divider />
      <List>
        <CustomListItem button component={Link} to=".">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </CustomListItem>

        {/* Conditionally render sidebar items based on the user's role */}
        {role === 'Admin' || role === 'Super Admin' && (
          <>
            <CustomListItem button component={Link} to="admin">
              <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
              <ListItemText primary="User Management" />
            </CustomListItem>
          </>
        )}

        {(role === 'Nutritionist' || role === 'Health Worker') && (
          <>
            <CustomListItem button component={Link} to="nutritional-status">
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Nutritional Status" />
            </CustomListItem>
            <CustomListItem button component={Link} to="food-management">
              <ListItemIcon><PlansIcon /></ListItemIcon>
              <ListItemText primary="Food Management" />
            </CustomListItem>
            <CustomListItem button component={Link} to="records-management">
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Records Management" />
            </CustomListItem>
          </>
        )}

        {role === 'Health Worker' && (
          <>
            <CustomListItem button component={Link} to="calendar">
              <ListItemIcon><EventIcon /></ListItemIcon>
              <ListItemText primary="Calendar" />
            </CustomListItem>
            <CustomListItem button component={Link} to="telemedicine">
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Telemedicine" />
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
          bgcolor: '#1A276C' // Apply the desired color here
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
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" component={Link} to="">
            <Badge color="error">
              <MailIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <Badge color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" component={Link} to="/settings">
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
            keepMounted: true, // Better open performance on mobile.
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
        <Outlet /> {/* Render child routes here */}
      </Box>
    </Box>
  );
}

export default DashboardLayout;
