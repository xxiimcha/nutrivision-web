import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DashboardLayout from './DashboardLayout';
import Dashboard from './Dashboard';
import Plans from './Plans';
import Users from './Users';
import LandingPage from './LandingPage';
import Login from './components/Login';
import Residences from './Residences';
import Admin from './Admin';
import Records from './components/Records';
import Monitoring from './Monitoring';
import Status from './Status';
import { UserProvider, UserContext } from './context/UserContext';

// Import Nutritionist components
import NutritionistDashboard from './nutritionist/Dashboard';
import Notifications from './nutritionist/Notifications';
import NutritionalStatus from './nutritionist/NutritionalStatus';
import FoodManagement from './nutritionist/FoodManagement';
import RecordsManagement from './nutritionist/RecordsManagement';
import MealPlan from './nutritionist/MealPlan';

// Import Health Worker components
import HealthWorkerDashboard from './healthworker/Dashboard';
import HealthWorkerCalendar from './healthworker/Calendar';
import HealthWorkerTelemedicine from './healthworker/TeleMedicine';
import HealthWorkerRecords from './healthworker/RecordsManagement';  // Corrected import
import HealthWorkerNewRecord from './healthworker/AddRecord'; // Corrected import
import PatientDetails from './healthworker/PatientDetails';

const theme = createTheme();

function AppRoutes() {
  const { role } = useContext(UserContext);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/*" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        {(role === 'Admin' || role === 'Super Admin') && (
          <>
            <Route path="plans" element={<Plans />} />
            <Route path="users" element={<Users />} />
            <Route path="residence" element={<Residences />} />
            <Route path="admin" element={<Admin />} />
            <Route path="status" element={<Status />} />
            <Route path="records" element={<Records />} />
            <Route path="monitoring" element={<Monitoring />} />
          </>
        )}
        {role === 'Nutritionist' && (
          <>
            <Route path="dashboard" element={<NutritionistDashboard />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="nutritional-status" element={<NutritionalStatus />} />
            <Route path="food-management" element={<FoodManagement />} />
            <Route path="meal-plan/:id/:week" element={<MealPlan />} />
            <Route path="records-management" element={<RecordsManagement />} />
          </>
        )}
        {role === 'Health Worker' && (
          <>
            <Route path="dashboard" element={<HealthWorkerDashboard />} />
            <Route path="calendar" element={<HealthWorkerCalendar />} />
            <Route path="telemedicine" element={<HealthWorkerTelemedicine />} />
            <Route path="records-management" element={<HealthWorkerRecords />} />
            <Route path="add-record" element={<HealthWorkerNewRecord />} />
            <Route path="patient-details/:recordId" element={<PatientDetails />} />
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
    </ThemeProvider>
  );
}

export default App;
