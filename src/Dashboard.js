import React, { useEffect, useState, useContext } from 'react';
import Typography from '@mui/material/Typography';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Box, Grid, ButtonGroup, Button, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { UserContext } from './context/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Fetch health data from backend API
const fetchHealthData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/patient-records/health-data/count`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching health data:', error);
    return [];
  }
};

// Fetch users and admin counts from backend API
const fetchUserAndAdminCounts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admins/admin-user-count`); // Corrected API route
    return response.data || { users: 0, admins: 0 };
  } catch (error) {
    console.error('Error fetching user and admin counts:', error);
    return { users: 0, admins: 0 };
  }
};

function Dashboard() {
  const [data, setData] = useState([]);
  const [viewBy, setViewBy] = useState('weeks');
  const [malnourishedCount, setMalnourishedCount] = useState(0);
  const [obeseCount, setObeseCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);

  // Use UserContext to get the logged-in user's role
  const { role } = useContext(UserContext);

  useEffect(() => {
    const getData = async () => {
      const healthData = await fetchHealthData();
      if (healthData) {
        setMalnourishedCount(healthData.malnourished || 0);
        setObeseCount(healthData.obese || 0);
      }
    };

    const getUserAndAdminCounts = async () => {
      if (role === 'Super Admin' || role === 'Admin') {
        const { users, admins } = await fetchUserAndAdminCounts();
        setUserCount(users);
        setAdminCount(admins);
      }
    };

    getData();
    getUserAndAdminCounts();
  }, [role]);

  const handleChangeViewBy = (newViewBy) => {
    setViewBy(newViewBy);
  };

  // Filter data if view by 'months' is selected
  const filteredData = viewBy === 'months' ? data.filter(item => ['Feb', 'Mar', 'Apr', 'May'].includes(item.month)) : data;

  return (
    <Box sx={{ padding: 2 }}>

      {(role === 'Admin' || role === 'Super Admin') && (
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
      )}

      {(role === 'Nutritionist' || role === 'Health Worker') && (
        <Typography variant="h4" gutterBottom>
          Health Improvement Dashboard
        </Typography>
      )}

      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        {/* Display Malnourished and Obese Counts for Nutritionist and Health Worker */}
        {(role === 'Nutritionist' || role === 'Health Worker') && (
          <>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Malnourished Children
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {malnourishedCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Obese Children
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {obeseCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Display Users and Admins count for Admin and Super Admin */}
        {(role === 'Admin' || role === 'Super Admin') && (
          <>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {userCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Admins
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {adminCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
        
      {(role === 'Nutritionist' || role === 'Health Worker') && (
      <ButtonGroup sx={{ marginBottom: 2 }}>
        <Button
          variant={viewBy === 'weeks' ? 'contained' : 'outlined'}
          onClick={() => handleChangeViewBy('weeks')}
        >
          View by Weeks
        </Button>
        <Button
          variant={viewBy === 'months' ? 'contained' : 'outlined'}
          onClick={() => handleChangeViewBy('months')}
        >
          View by Months
        </Button>
      </ButtonGroup>
      )}

      {(role === 'Nutritionist' || role === 'Health Worker') && (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
              Improvements of Malnourished Kids (%)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={viewBy === 'weeks' ? 'week' : 'month'} />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value.toFixed(2)}%`} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="malnourishedChange"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
              Improvements of Obese Kids (%)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={viewBy === 'weeks' ? 'week' : 'month'} />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value.toFixed(2)}%`} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="obeseChange"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      )}
    </Box>
  );
}

export default Dashboard;
