import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import moment from 'moment';

const initialData = [
  {
    address: '123 Main St',
    parentName: 'Mary Doe',
    childName: 'John Doe',
    indigenous: 'No',
    dateOfBirth: '2018-06-15',
    weight: 20,
    height: 120,
    goalWeight: 22,
    weeklyImprovement: 0.1,
    cumulativeImprovement: 0,
    improvementLogs: [0.1],
  },
  {
    address: '456 Oak St',
    parentName: 'Robert Smith',
    childName: 'Jane Smith',
    indigenous: 'Yes',
    dateOfBirth: '2017-08-21',
    weight: 22,
    height: 130,
    goalWeight: 25,
    weeklyImprovement: 0.2,
    cumulativeImprovement: 0,
    improvementLogs: [0.2],
  },
  {
    address: '789 Pine St',
    parentName: 'Susan Brown',
    childName: 'Tom Brown',
    indigenous: 'No',
    dateOfBirth: '2019-04-10',
    weight: 18,
    height: 110,
    goalWeight: 20,
    weeklyImprovement: 0.15,
    cumulativeImprovement: 0,
    improvementLogs: [0.15],
  },
];

const calculateAgeInMonths = (dateOfBirth) => {
  const birthDate = moment(dateOfBirth);
  const currentDate = moment();
  return currentDate.diff(birthDate, 'months');
};

const getWeightForAgeStatus = (ageInMonths, weight) => {
  const averageWeight = ageInMonths * 0.4; // Philippines standard: average weight gain of 0.4 kg per month
  if (weight < 0.9 * averageWeight) {
    return 'Underweight';
  } else if (weight > 1.1 * averageWeight) {
    return 'Overweight';
  }
  return 'Normal';
};

const getHeightForAgeStatus = (ageInMonths, height) => {
  const averageHeight = ageInMonths * 0.6; // Philippines standard: average height gain of 0.6 cm per month
  if (height < 0.9 * averageHeight) {
    return 'Short';
  } else if (height > 1.1 * averageHeight) {
    return 'Tall';
  }
  return 'Normal';
};

const getWeightForHeightStatus = (weight, height) => {
  const bmi = weight / ((height / 100) ** 2); // Convert height to meters
  if (bmi < 16) {
    return 'Underweight'; // Philippines standard: BMI below 16 is considered underweight for children
  } else if (bmi > 18.5) {
    return 'Overweight'; // Philippines standard: BMI above 18.5 is considered overweight for children
  }
  return 'Normal';
};

const calculatePercentageOfGoalAchieved = (initialWeight, cumulativeImprovement, goalWeight) => {
  if (goalWeight <= initialWeight) return 100;
  return (((initialWeight + cumulativeImprovement) / goalWeight) * 100).toFixed(2);
};

const Monitoring = () => {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [newImprovement, setNewImprovement] = useState('');

  const handleOpenModal = (index) => {
    setSelectedIndex(index);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewImprovement('');
  };

  const handleAddImprovement = () => {
    if (newImprovement) {
      const updatedData = data.map((item, i) => {
        if (i === selectedIndex) {
          const newLogs = [...item.improvementLogs, parseFloat(newImprovement)];
          const newCumulativeImprovement = newLogs.reduce((acc, val) => acc + val, 0);
          return { ...item, improvementLogs: newLogs, cumulativeImprovement: newCumulativeImprovement };
        }
        return item;
      });
      setData(updatedData);
      handleCloseModal();
    }
  };

  const filteredData = data.filter(row =>
    row.childName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <Grid container alignItems="center" spacing={2} style={{ marginBottom: 20 }}>
        <Grid item>
          <TextField
            label="Search by name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <IconButton edge="start">
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Grid>
      </Grid>
      
      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#B5CEF7' }}>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Full Name of Child</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Age (Months)</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Weight (kg)</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Height (cm)</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Goal Weight (kg)</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Weekly Improvement (kg)</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Percentage of Goal Achieved</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => {
              const ageInMonths = calculateAgeInMonths(row.dateOfBirth);
              const weightForAgeStatus = getWeightForAgeStatus(ageInMonths, row.weight);
              const heightForAgeStatus = getHeightForAgeStatus(ageInMonths, row.height);
              const weightForHeightStatus = getWeightForHeightStatus(row.weight, row.height);
              const percentageOfGoalAchieved = calculatePercentageOfGoalAchieved(row.weight, row.cumulativeImprovement, row.goalWeight);
              let status = 'Normal';
              if (
                weightForAgeStatus === 'Underweight' ||
                heightForAgeStatus === 'Short' ||
                weightForHeightStatus === 'Underweight'
              ) {
                status = 'Undernourished';
              }
              return (
                <TableRow key={index}>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.childName}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{ageInMonths}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.weight}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.height}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.goalWeight}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenModal(index)}
                    >
                      View Logs
                    </Button>
                  </TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{percentageOfGoalAchieved}%</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{status}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Weekly Improvement Logs */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Weekly Improvement Logs</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Improvement logs for {selectedIndex !== null && data[selectedIndex].childName}
          </DialogContentText>
          <TableContainer component={Paper} style={{ marginTop: 20 }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  <TableCell>Improvement (kg)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedIndex !== null && data[selectedIndex].improvementLogs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>Week {i + 1}</TableCell>
                    <TableCell>{log}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Grid container spacing={2} style={{ marginTop: 20 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add New Improvement (kg)"
                type="number"
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddImprovement} color="primary">
            Add Improvement
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Monitoring;
