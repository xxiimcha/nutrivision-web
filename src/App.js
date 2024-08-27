import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DashboardLayout from './DashboardLayout';
import Dashboard from './Dashboard';
import ResetPassword from './ResetPassword';
import Plans from './Plans';
import Users from './Users';
import LandingPage from './LandingPage';
import Login from './components/Login';
import Residences from './Residences';
import Admin from './Admin';
import Records from './components/Records';
import Monitoring from './Monitoring';
import Status from './Status';
import Profile from './Profile';
import { UserProvider, UserContext } from './context/UserContext';

// Nutritionist components
import NutritionistDashboard from './nutritionist/Dashboard';
import Notifications from './nutritionist/Notifications';
import NutritionalStatus from './nutritionist/NutritionalStatus';
import FoodManagement from './nutritionist/FoodManagement';
import RecordsManagement from './nutritionist/RecordsManagement';
import MealPlan from './nutritionist/MealPlan';

// Health Worker components
import HealthWorkerDashboard from './healthworker/Dashboard';
import HealthWorkerCalendar from './healthworker/Calendar';
import HealthWorkerTelemedicine from './healthworker/TeleMedicine';
import HealthWorkerRecords from './healthworker/RecordsManagement';
import HealthWorkerNewRecord from './healthworker/AddRecord';
import PatientDetails from './healthworker/PatientDetails';

// Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme();

function AppRoutes() {
  const { role } = useContext(UserContext);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/dashboard/*" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile/:userId" element={<Profile />} />

        {/* Admin and Super Admin routes */}
        {(role === 'Admin' || role === 'Super Admin') && (
          <>
            <Route path="plans" element={<Plans />} />
            <Route path="users" element={<Users />} />
            <Route path="residence" element={<Residences />} />
            <Route path="admin" element={<Admin />} />
            <Route path="status" element={<Status />} />
            <Route path="records" element={<Records />} />
          </>
        )}

        {/* Nutritionist routes */}
        {role === 'Nutritionist' && (
          <>
            <Route path="dashboard" element={<NutritionistDashboard />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="nutritional-status" element={<NutritionalStatus />} />
            <Route path="food-management" element={<FoodManagement />} />
            <Route path="meal-plan/:id/:week" element={<MealPlan />} />
            <Route path="records-management" element={<RecordsManagement />} />
            <Route path="monitoring" element={<Monitoring />} />
          </>
        )}

        {/* Health Worker routes */}
        {role === 'Health Worker' && (
          <>
            <Route path="dashboard" element={<HealthWorkerDashboard />} />
            <Route path="calendar" element={<HealthWorkerCalendar />} />
            <Route path="telemedicine" element={<HealthWorkerTelemedicine />} />
            <Route path="records-management" element={<HealthWorkerRecords />} />
            <Route path="add-record" element={<HealthWorkerNewRecord />} />
            <Route path="patient-details/:recordId" element={<PatientDetails />} />
            <Route path="monitoring" element={<Monitoring />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </ThemeProvider>
  );
}

export default App;
