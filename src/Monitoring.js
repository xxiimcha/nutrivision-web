import React, { useState, useEffect, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton,
  TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { UserContext } from './context/UserContext'; // Assuming you have a UserContext for role information

const Monitoring = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [newImprovement, setNewImprovement] = useState('');
  const { role } = useContext(UserContext); // Get the user role from context

  // Fetch data from the patient records table and their associated weekly improvements
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patient-records');
        const updatedData = await Promise.all(response.data.map(async (record) => {
          const goalWeight = record.ageInMonths * 0.4; // Compute goal weight based on age in months
  
          // Fetch weekly improvements for this record
          const improvementsResponse = await axios.get(`http://localhost:5000/api/patient-records/${record._id}/improvements`);
          const improvementLogs = improvementsResponse.data.map(improvement => ({
            weekNumber: improvement.weekNumber,
            improvement: improvement.improvement
          }));

          // Calculate the latest weight based on improvements
          const latestWeight = improvementLogs.length > 0
            ? record.weight + improvementLogs.reduce((acc, val) => acc + val.improvement, 0)
            : record.weight; 

          return { ...record, goalWeight, improvementLogs, latestWeight };
        }));
        setData(updatedData);
      } catch (error) {
        console.error('Error fetching patient records or weekly improvements:', error);
      }
    };
  
    fetchRecords();
  }, []);

  const handleOpenModal = (index) => {
    setSelectedIndex(index);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewImprovement('');
  };

  const calculatePercentageOfGoalAchieved = (latestWeight, goalWeight, nutritionStatus) => {
    if (goalWeight <= 0) return 0; // Avoid division by zero

    let percentageAchieved = 0;

    // Determine whether the patient needs to gain or lose weight based on nutritionStatus
    if (nutritionStatus === 'Malnourished') {
      // If malnourished, they should gain weight
      percentageAchieved = ((latestWeight / goalWeight) * 100).toFixed(2);
    } else if (nutritionStatus === 'Obese') {
      // If obese, they should lose weight (goalWeight should be lower than current weight)
      const weightLossGoal = goalWeight; // Assuming goal weight is the target to lose
      const weightLost = latestWeight - goalWeight;
      percentageAchieved = ((weightLost / weightLossGoal) * 100).toFixed(2);
    }

    return percentageAchieved >= 0 ? percentageAchieved : 0;
  };

  const determineAction = (nutritionStatus) => {
    if (nutritionStatus === 'Malnourished') {
      return 'Gain Weight';
    } else if (nutritionStatus === 'Obese') {
      return 'Lose Weight';
    }
    return 'Maintain Weight';
  };

  const handleAddImprovement = async () => {
    if (newImprovement && selectedIndex !== null) {
      const selectedRecord = data[selectedIndex];

      try {
        // Send the improvement to the backend
        await axios.post(`http://localhost:5000/api/patient-records/${selectedRecord._id}/add-improvement`, {
          currentWeight: parseFloat(newImprovement),
        });

        // Update the UI locally
        const updatedData = data.map((item, i) => {
          if (i === selectedIndex) {
            const newLogs = [...item.improvementLogs, { weekNumber: item.improvementLogs.length + 1, weightGain: parseFloat(newImprovement) }];
            const latestWeight = item.weight + newLogs.reduce((acc, val) => acc + val.weightGain, 0);
            return { ...item, improvementLogs: newLogs, latestWeight };
          }
          return item;
        });

        setData(updatedData);
        handleCloseModal();
      } catch (error) {
        console.error('Error adding improvement:', error);
        alert('Failed to add improvement. Please try again.');
      }
    }
  };

  const filteredData = data.filter(row =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Nutritional Status</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Action Required</TableCell> {/* New Column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">No records found</TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, index) => {
                const percentageOfGoalAchieved = calculatePercentageOfGoalAchieved(row.latestWeight, row.goalWeight, row.nutritionStatus);
                const actionRequired = determineAction(row.nutritionStatus);

                return (
                  <TableRow key={index}>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.name}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.ageInMonths}</TableCell>
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
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.nutritionStatus}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{actionRequired}</TableCell> {/* New Cell */}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Weekly Improvement Logs */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Weekly Improvement Logs</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Improvement logs for {selectedIndex !== null && data[selectedIndex]?.patientName}
          </DialogContentText>

          {selectedIndex !== null && data[selectedIndex]?.improvementLogs ? (
            data[selectedIndex].improvementLogs.length > 0 ? (
              <TableContainer component={Paper} style={{ marginTop: 20 }}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Week</TableCell>
                      <TableCell>Weight Gain (kg)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data[selectedIndex].improvementLogs.map((log, i) => (
                      <TableRow key={i}>
                        <TableCell>{log.weekNumber}</TableCell>
                        <TableCell>{log.improvement}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <DialogContentText style={{ marginTop: 20, textAlign: 'center' }}>
                No records found
              </DialogContentText>
            )
          ) : (
            <DialogContentText style={{ marginTop: 20, textAlign: 'center' }}>
              No records found
            </DialogContentText>
          )}

          {role !== 'Nutritionist' && (
            <Grid container spacing={2} style={{ marginTop: 20 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Add New Weight (kg)"
                  type="text"  // Use 'text' to allow custom input handling
                  value={newImprovement}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers and one decimal point
                    const regex = /^[0-9]*\.?[0-9]*$/;
                    if (regex.test(value)) {
                      setNewImprovement(value);
                    }
                  }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          {role !== 'Nutritionist' && (
            <Button onClick={handleAddImprovement} color="primary">
              Add Improvement
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Monitoring;
