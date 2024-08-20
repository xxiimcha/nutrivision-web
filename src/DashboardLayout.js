import React, { useContext, useState } from 'react';
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
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import AssignmentIcon from '@mui/icons-material/Assignment'; // For Records
import AssessmentIcon from '@mui/icons-material/Assessment'; // For Monitoring
import { styled } from '@mui/material/styles';
import { UserContext } from './context/UserContext';
import logo from './images/logo.png'; // Move logo to AppBar

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
  const { role, user } = useContext(UserContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAccounts, setOpenAccounts] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const toggleAccountsDropdown = () => {
    setOpenAccounts(!openAccounts);
  };

  const toggleStatusDropdown = () => {
    setOpenStatus(!openStatus);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, marginTop: '-70px' }}>
        {/* Profile section with clickable Link */}
        <Link 
          to="/profile" 
          style={{ 
            textDecoration: 'none', 
            color: 'inherit', 
            textAlign: 'center', 
            '&:hover': { 
              color: '#3f51b5', 
              textDecoration: 'underline' 
            }
          }}
        >
          <Typography variant="h6" noWrap component="div" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
            {user?.name || 'User Name'}
          </Typography>
          <Typography variant="subtitle1" noWrap component="div" sx={{ fontSize: '16px', color: 'grey' }}>
            {user?.email || 'user@example.com'}
          </Typography>
        </Link>
      </Box>
      <Divider />
      <List>
        {/* Dashboard - Only for Admin or Super Admin */}
        {(role === 'Admin' || role === 'Super Admin') && (
          <CustomListItem button component={Link} to=".">
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </CustomListItem>
        )}

        {/* Accounts Dropdown - Only for Admin or Super Admin */}
        {(role === 'Admin' || role === 'Super Admin') && (
          <CustomListItem button onClick={toggleAccountsDropdown}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Accounts" />
            {openAccounts ? <ExpandLess /> : <ExpandMore />}
          </CustomListItem>
        )}
        <Collapse in={openAccounts} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <CustomListItem sx={{ pl: 4 }} button component={Link} to="residence">
              <ListItemText primary="Residence" />
            </CustomListItem>
            <CustomListItem sx={{ pl: 4 }} button component={Link} to="admin">
              <ListItemText primary="Admin" />
            </CustomListItem>
          </List>
        </Collapse>

        {/* Status Dropdown - Only for Nutritionists and Health Workers */}
        {(role === 'Nutritionist' || role === 'Health Worker') && (
          <CustomListItem button onClick={toggleStatusDropdown}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Status" />
            {openStatus ? <ExpandLess /> : <ExpandMore />}
          </CustomListItem>
        )}
        <Collapse in={openStatus} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <CustomListItem sx={{ pl: 4 }} button component={Link} to="records-management">
              <ListItemIcon><AssignmentIcon /></ListItemIcon> {/* Records Icon */}
              <ListItemText primary="Records" />
            </CustomListItem>
            <CustomListItem sx={{ pl: 4 }} button component={Link} to="monitoring">
              <ListItemIcon><AssessmentIcon /></ListItemIcon> {/* Monitoring Icon */}
              <ListItemText primary="Monitoring" />
            </CustomListItem>
          </List>
        </Collapse>

        {/* Conditionally render other sidebar items based on the user's role */}
        {(role === 'Nutritionist' || role === 'Health Worker') && (
          <>
            <CustomListItem button component={Link} to="food-management">
              <ListItemIcon><PlansIcon /></ListItemIcon>
              <ListItemText primary="Meal Plans" />
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
            {/* Move Logo to AppBar */}
            <img src={logo} alt="Logo" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
            <Typography variant="h6" noWrap component="div">
              Nutrivision
            </Typography>
          </Box>
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
        <Outlet /> {/* Render child routes here */}
      </Box>
    </Box>
  );
}

export default DashboardLayout;
