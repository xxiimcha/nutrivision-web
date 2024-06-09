import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DashboardLayout from './DashboardLayout';
import Dashboard from './Dashboard';
import Plans from './Plans';
import Users from './Users';
import Calendar from './Calendar';
import LandingPage from './LandingPage';
import Login from './components/Login';
import Residences from './Residences';
import Admin from './Admin';
import Records from './components/Records';
import Monitoring from './Monitoring';
import Status from './Status'



const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="plans" element={<Plans />} />
            <Route path="users" element={<Users />} />
            <Route path="residence" element={<Residences />} />
            <Route path="admin" element={<Admin />} />
            <Route path="status" element={<Status />} />
            <Route path="records" element={<Records />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="calendar" element={<Calendar />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
