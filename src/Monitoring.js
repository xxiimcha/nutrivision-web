import React, { useState, useEffect, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton,
  TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { UserContext } from './context/UserContext'; // Assuming you have a UserContext for role information

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
        const response = await axios.get(`${API_BASE_URL}/patient-records`);
        const updatedData = await Promise.all(response.data.map(async (record) => {
          try {
            // Fetch the latest weekly improvement for this record
            const latestImprovementResponse = await axios.get(`${API_BASE_URL}/patient-records/${record._id}/latest-improvement`);
            const latestImprovement = latestImprovementResponse.data.improvement || 0;  // Default to 0 if not found
            
            // Fetch all weekly improvements (logs) for this record
            const improvementLogsResponse = await axios.get(`${API_BASE_URL}/patient-records/${record._id}/improvements`);
            const improvementLogs = improvementLogsResponse.data; // Store all logs
  
            return { ...record, latestImprovement, improvementLogs };
          } catch (error) {
            // If no improvements are found, set latest improvement and logs to empty values
            console.error(`No improvements found for patient ${record._id}:`, error);
            return { ...record, latestImprovement: 0, improvementLogs: [] };  // Default to empty logs
          }
        }));
  
        console.log("Fetched Data:", updatedData);
        setData(updatedData);
      } catch (error) {
        console.error('Error fetching patient records or improvements:', error);
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

  const calculatePercentageOfGoalAchieved = (originalWeight, latestImprovement, goalWeight) => {
    // Calculate the latest weight (sum of original weight and latest improvement)
    const latestWeight =latestImprovement || 0;  // Add improvement to the original weight if it exists

    // Add debugging information to check the values
    console.log('Original Weight:', originalWeight);
    console.log('Latest Improvement:', latestImprovement);
    console.log('Goal Weight:', goalWeight);
    console.log('Latest Weight:', latestWeight);

    // Ensure originalWeight and goalWeight are valid numbers
    if (isNaN(latestWeight) || isNaN(goalWeight) || goalWeight <= 0) {
      return 0; // Return 0% if values are not valid or goal weight is zero or less
    }

    // If the latest weight is still the same as the original weight and less than the goal, return 0%
    if (latestWeight === originalWeight && originalWeight < goalWeight) {
      return 0; // No progress made toward the goal
    }

    // If the latest weight is already higher or equal to the goal weight, it's 100%
    if (latestWeight >= goalWeight) {
      return 100;
    }

    // Calculate the percentage of the goal achieved based on the latest weight
    let percentageAchieved = ((latestWeight / goalWeight) * 100).toFixed(2);

    // Log the percentage achieved
    console.log('Percentage Achieved Before Limiting:', percentageAchieved);

    // Ensure the percentage doesn't exceed 100%
    return Math.min(percentageAchieved, 100);
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
        // Send the improvement directly to the backend without any calculation
        await axios.post(`${API_BASE_URL}/patient-records/${selectedRecord._id}/add-improvement`, {
          improvement: newImprovement,  // Directly pass the improvement value
        });
  
        // Update the UI locally by adding the improvement
        const updatedData = data.map((item, i) => {
          if (i === selectedIndex) {
            return { ...item, latestImprovement: newImprovement };
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
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Action Required</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">No records found</TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, index) => {
                const percentageOfGoalAchieved = calculatePercentageOfGoalAchieved(row.weight, row.latestImprovement, row.goalWeight);
                const actionRequired = determineAction(row.nutritionStatus);

                return (
                  <TableRow key={index}>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.name}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.ageInMonths}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.weight}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.height}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.goalWeight}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                      <Button variant="outlined" onClick={() => handleOpenModal(index)}>
                        View Logs
                      </Button>
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{percentageOfGoalAchieved}%</TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.nutritionStatus}</TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{actionRequired}</TableCell>
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
            Improvement logs for {selectedIndex !== null && data[selectedIndex]?.name}
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
                        <TableCell>Week {log.weekNumber}</TableCell>
                        <TableCell>{log.improvement} KG</TableCell>
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
                  type="text"
                  value={newImprovement}
                  onChange={(e) => {
                    const value = e.target.value;
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
