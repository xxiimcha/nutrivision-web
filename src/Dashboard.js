import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Box, Grid, ButtonGroup, Button, Card, CardContent } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Fetch health data from backend API (replace with your actual API endpoint)
const fetchHealthData = async () => {
  try {
    console.log('Fetching health data...');
    const response = await axios.get(`${API_BASE_URL}/patient-records/health-data/count`); // Correct API URL
    console.log('Health data fetched successfully:', response.data);
    return response.data || [];  // Ensure the response data is an array
  } catch (error) {
    console.error('Error fetching health data:', error);
    return [];  // Return an empty array in case of error
  }
};

const calculateImprovementPercentage = (newValue, oldValue) => {
  if (oldValue === 0 || oldValue === undefined || newValue === undefined) return 0;
  return ((oldValue - newValue) / oldValue) * 100;
};

const calculateObeseImprovementPercentage = (newValue, oldValue) => {
  if (oldValue === 0 || oldValue === undefined || newValue === undefined) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

function Dashboard() {
  const [data, setData] = useState([]);
  const [viewBy, setViewBy] = useState('weeks'); // Default view by weeks
  const [malnourishedCount, setMalnourishedCount] = useState(0);
  const [obeseCount, setObeseCount] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const healthData = await fetchHealthData();
      console.log('Raw health data:', healthData); // Ensure the response is correct
  
      if (healthData) {
        // Directly set the malnourished and obese counts from the response
        console.log('Setting malnourished and obese counts');
        setMalnourishedCount(healthData.malnourished || 0);
        setObeseCount(healthData.obese || 0);
      } else {
        console.error('No data returned from the API');
      }
    };
  
    getData();
  }, []);
  

  const handleChangeViewBy = (newViewBy) => {
    console.log(`Changing view to: ${newViewBy}`);
    setViewBy(newViewBy);
  };

  // Filter data for February to May if view by months is selected
  const filteredData = viewBy === 'months' ? data.filter(item => ['Feb', 'Mar', 'Apr', 'May'].includes(item.month)) : data;

  console.log('Filtered data for the current view:', filteredData);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Health Improvement Dashboard
      </Typography>

      {/* Cards displaying the total count of malnourished and obese children */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
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
      </Grid>

      {/* Button Group to toggle between weeks and months view */}
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

      {/* Line charts for improvements in malnourished and obese children */}
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
    </Box>
  );
}

export default Dashboard;
