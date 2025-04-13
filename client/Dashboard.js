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
    const healthDataResponse = await axios.get(`${API_BASE_URL}/patient-records/health-data/data`);
    const healthData = healthDataResponse.data || [];

    const countDataResponse = await axios.get(`${API_BASE_URL}/patient-records/health-data/count`);
    const countData = countDataResponse.data || { malnourished: 0, obese: 0 };

    console.log('fetch successful', healthData, countData)
    return { healthData, countData };
  } catch (error) {
    console.error('Error fetching health data:', error);
    return { healthData: [], countData: { malnourished: 0, obese: 0 } };
  }
};

// Fetch health data from backend API
const fetchAdminUserData = async () => {
  try {
    const users = await axios.get(`${API_BASE_URL}/users`);
    const userCount = users.data.length || 0;

    const admins = await axios.get(`${API_BASE_URL}/admins`);
    const adminCount = admins.data.length || 0;

    return { userCount, adminCount };
  } catch (error) {
    console.error('Error fetching health data:', error);
    return { userCount: 0, adminCount: 0};
  }
};

function Dashboard() {
  const [malnourishedData, setMalnourishedData] = useState([]);
  const [obeseData, setObeseData] = useState([]);
  const [viewBy, setViewBy] = useState('weeks');
  const [malnourishedCount, setMalnourishedCount] = useState(0);
  const [obeseCount, setObeseCount] = useState(0);
  const [totaluserCount, setTotalUserCount] = useState(0);
  const [totaladminCount, setTotalAdminCount] = useState(0);

  const { role } = useContext(UserContext);

  useEffect(() => {
    const getData = async () => {
      const { healthData, countData } = await fetchHealthData();
      const { userCount, adminCount } = await fetchAdminUserData();

      if (healthData.length) {
        const malnourished = healthData.filter(patient => patient.nutritionStatus === 'Malnourished');
        const obese = healthData.filter(patient => patient.nutritionStatus === 'Obese');

        const malnourishedImprovements = malnourished.flatMap(patient =>
          patient.weeklyImprovements.map((improvement, index) => {
            const previousWeight = index === 0
              ? improvement.improvement
              : patient.weeklyImprovements[index - 1].improvement;

            const improvements = ((previousWeight - improvement.improvement) / previousWeight) * 100;

            return {
              week: `Week ${improvement.weekNumber}`,
              improvements: improvements
            };
          })
        );

        const obeseImprovements = obese.flatMap(patient =>
          patient.weeklyImprovements.map((improvement, index) => {
            const previousWeight = index === 0
              ? improvement.improvement
              : patient.weeklyImprovements[index - 1].improvement;

            const obeseChange = ((improvement.improvement - previousWeight) / previousWeight) * 100;

            return {
              week: `Week ${improvement.weekNumber}`,
              obeseChange: obeseChange
            };
          })
        );

        setMalnourishedData(malnourishedImprovements);
        setObeseData(obeseImprovements);
      }

      if (userCount > 0 && adminCount > 0) {
        setTotalUserCount(userCount);
        setTotalAdminCount(adminCount);
      }

      setMalnourishedCount(countData.malnourished);
      setObeseCount(countData.obese);
    };

    getData();
  }, [role]);

  const handleChangeViewBy = (newViewBy) => {
    setViewBy(newViewBy);
  };

  // Static week and month mapping
  const staticWeeks = ['Week 1', 'Week 3', 'Week 5', 'Week 7', 'Week 9', 'Week 11', 'Week 13', 'Week 15'];
  const monthsMapping = [
    { month: 'Month 1', weeks: ['Week 1', 'Week 3'] },
    { month: 'Month 2', weeks: ['Week 5', 'Week 7'] },
    { month: 'Month 3', weeks: ['Week 9', 'Week 11'] },
    { month: 'Month 4', weeks: ['Week 13', 'Week 15'] }
  ];

  // Filter data based on view (weeks or months)
  const getFilteredData = (data, view) => {
    if (view === 'weeks') {
      return data.filter(item => staticWeeks.includes(item.week));
    } else if (view === 'months') {
      return monthsMapping.map(month => {
        const totalImprovements = data
          .filter(item => month.weeks.includes(item.week))
          .reduce((acc, curr) => acc + curr.improvements, 0) / month.weeks.length;

        return { month: month.month, improvements: totalImprovements };
      });
    }
  };

  const malnourishedFilteredData = getFilteredData(malnourishedData, viewBy);
  const obeseFilteredData = getFilteredData(obeseData, viewBy);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        {role === 'Admin' || role === 'Super Admin' ? 'Dashboard' : ''}
      </Typography>

      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        {(role === 'Nutritionist' || role === 'Health Worker' || role === 'Super Admin' || role === 'Admin') && (
          <>
            {(role === 'Super Admin' || role === 'Admin') && (
              <Grid container sx={{ justifyContent: 'center', display: 'flex', mb: 5 }}>
                <Card sx={{ backgroundColor: '#D9E5F7', height: 250, width: 280, mt: 5, mr: 8 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Admins
                    </Typography>
                    <Typography sx={{ textAlign: 'center', mt: 6, fontSize: '72px' }} variant="h3" color="primary">
                      {totaladminCount}
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ backgroundColor: '#D9E5F7', height: 250, width: 280, mt: 5, ml: 8 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography sx={{ textAlign: 'center', mt: 6, fontSize: '72px' }} variant="h3" color="primary">
                      {totaluserCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            <Typography variant="h4" gutterBottom>
              Health Improvement Dashboard
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#D9E5F7' }}>
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
                <Card sx={{ backgroundColor: '#D9E5F7' }}>
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
          </>
        )}
      </Grid>

      {(role === 'Nutritionist' || role === 'Health Worker' || role === 'Super Admin') && (
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
                  {viewBy === 'weeks' ? 'Improvements of Malnourished Kids (%)' : 'Average Monthly Improvements (%)'}
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={malnourishedFilteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={viewBy === 'weeks' ? 'week' : 'month'} />
                    <YAxis domain={[-100, 100]} tickFormatter={(value) => `${value.toFixed(2)}%`} />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="improvements" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2, marginBottom: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {viewBy === 'weeks' ? 'Changes for Obese Kids (%)' : 'Average Monthly Changes (%)'}
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={obeseFilteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={viewBy === 'weeks' ? 'week' : 'month'} />
                    <YAxis domain={[-100, 100]} tickFormatter={(value) => `${value.toFixed(2)}%`} />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
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
