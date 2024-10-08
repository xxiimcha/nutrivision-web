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
    const healthDataResponse = await axios.get(`${API_BASE_URL}/patient-records/health-data`);
    const healthData = healthDataResponse.data || [];

    const countDataResponse = await axios.get(`${API_BASE_URL}/patient-records/health-data/count`);
    const countData = countDataResponse.data || { malnourished: 0, obese: 0 };

    return { healthData, countData };
  } catch (error) {
    console.error('Error fetching health data:', error);
    return { healthData: [], countData: { malnourished: 0, obese: 0 } };
  }
};

function Dashboard() {
  const [malnourishedData, setMalnourishedData] = useState([]);
  const [obeseData, setObeseData] = useState([]);
  const [viewBy, setViewBy] = useState('weeks');
  const [malnourishedCount, setMalnourishedCount] = useState(0);
  const [obeseCount, setObeseCount] = useState(0);

  const { role } = useContext(UserContext);

  useEffect(() => {
    const getData = async () => {
      const { healthData, countData } = await fetchHealthData();
  
      if (healthData.length) { // Check if healthData is not empty
        const malnourished = healthData.filter(patient => patient.nutritionStatus === 'Malnourished');
        const obese = healthData.filter(patient => patient.nutritionStatus === 'Obese');
  
        // Process improvement data for malnourished kids
        const malnourishedImprovements = malnourished.flatMap(patient => 
          patient.weeklyImprovements.map(improvement => ({
            week: `Week ${improvement.weekNumber}`,
            malnourishedChange: (improvement.improvement / patient.goalWeight) * 100,
          }))
        );
  
        // Process improvement data for obese kids
        const obeseImprovements = obese.flatMap(patient => 
          patient.weeklyImprovements.map(improvement => ({
            week: `Week ${improvement.weekNumber}`,
            obeseChange: (improvement.improvement / patient.goalWeight) * 100,
          }))
        );
  
        setMalnourishedData(malnourishedImprovements);
        setObeseData(obeseImprovements);
      }
  
      // Set counts from the count data
      setMalnourishedCount(countData.malnourished);
      setObeseCount(countData.obese);
    };
  
    getData();
  }, [role]);  

  const handleChangeViewBy = (newViewBy) => {
    setViewBy(newViewBy);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        {role === 'Admin' || role === 'Super Admin' ? 'Dashboard' : 'Health Improvement Dashboard'}
      </Typography>

      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
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
      </Grid>

      {(role === 'Nutritionist' || role === 'Health Worker') && (
        <>
          <ButtonGroup sx={{ marginBottom: 2 }}>
            <Button variant={viewBy === 'weeks' ? 'contained' : 'outlined'} onClick={() => handleChangeViewBy('weeks')}>
              View by Weeks
            </Button>
            <Button variant={viewBy === 'months' ? 'contained' : 'outlined'} onClick={() => handleChangeViewBy('months')}>
              View by Months
            </Button>
          </ButtonGroup>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2, marginBottom: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Improvements of Malnourished Kids (%)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={malnourishedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value.toFixed(2)}%`} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="malnourishedChange" stroke="#8884d8" activeDot={{ r: 8 }} />
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
                  <LineChart data={obeseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value.toFixed(2)}%`} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="obeseChange" stroke="#82ca9d" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default Dashboard;
