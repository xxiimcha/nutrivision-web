import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Box, Grid, ButtonGroup, Button, Card, CardContent } from '@mui/material';

const fetchHealthData = async () => {
  // Simulate fetching data from an API
  return [
    { week: 1, month: 'Jan', malnourished: 20, obese: 5 },
    { week: 2, month: 'Feb', malnourished: 18, obese: 7 },
    { week: 3, month: 'Mar', malnourished: 15, obese: 8 },
    { week: 4, month: 'Apr', malnourished: 10, obese: 10 },
    { week: 5, month: 'May', malnourished: 8, obese: 12 },
    { week: 6, month: 'Jun', malnourished: 4, obese: 22 },
    // Add more data as needed
  ];
};

const calculateImprovementPercentage = (newValue, oldValue) => {
  if (oldValue === 0) return 0;
  return ((oldValue - newValue) / oldValue) * 100;
};

const calculateObeseImprovementPercentage = (newValue, oldValue) => {
  if (oldValue === 0) return 0;
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

      // Calculate the weekly improvement percentage for malnourished and obese children
      const dataWithImprovementPercentage = healthData.map((entry, index, arr) => {
        if (index === 0) {
          return { ...entry, malnourishedChange: 0, obeseChange: 0 };
        }
        const prevEntry = arr[index - 1];
        return {
          ...entry,
          malnourishedChange: calculateImprovementPercentage(entry.malnourished, prevEntry.malnourished),
          obeseChange: calculateObeseImprovementPercentage(entry.obese, prevEntry.obese),
        };
      });

      setData(dataWithImprovementPercentage);

      // Calculate counts of malnourished and obese children
      const latestData = dataWithImprovementPercentage[dataWithImprovementPercentage.length - 1];
      setMalnourishedCount(latestData.malnourished);
      setObeseCount(latestData.obese);
    };
    getData();
  }, []);

  const handleChangeViewBy = (newViewBy) => {
    setViewBy(newViewBy);
  };

  // Filter data for February to May if view by months is selected
  const filteredData = viewBy === 'months' ? data.filter(item => ['Feb', 'Mar', 'Apr', 'May'].includes(item.month)) : data;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Health Improvement Dashboard
      </Typography>
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
