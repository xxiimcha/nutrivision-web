import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Modal,
  TableFooter,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chip from '@mui/material/Chip';
import moment from 'moment';

const FoodManagement = () => {
  const [kids, setKids] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKid, setSelectedKid] = useState(null); // For storing selected kid's info
  const [open, setOpen] = useState(false); // For handling modal open/close
  const [filterType, setFilterType] = useState('All'); // Default filter type set to 'All'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patient-records');
        setKids(response.data); // Assuming response.data contains the array of patients
      } catch (error) {
        console.error('Error fetching patient records:', error);
      }
    };

    fetchPatientRecords();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter kids based on their nutrition status (All, Malnourished, Obese) and search term
  const filteredKids = kids.filter((kid) => {
    if (filterType === 'All') {
      return kid.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return (
      kid.nutritionStatus === filterType &&
      kid.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleViewMealPlan = (id, dateOfWeighing) => {
    const date = moment(dateOfWeighing).startOf('isoWeek'); // Get the Monday of the week
    const formattedDate = date.format('YYYY-MM-DD'); // Format the date as YYYY-MM-DD
    navigate(`/dashboard/meal-plan/${id}/${formattedDate}`);
  };  

  const handleViewInfo = (kid) => {
    setSelectedKid(kid);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Set filter to 'Malnourished'
  const showMalnourished = () => {
    setFilterType('Malnourished');
  };

  // Set filter to 'Obese'
  const showObese = () => {
    setFilterType('Obese');
  };

  // Set filter to 'All'
  const showAll = () => {
    setFilterType('All');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom align="center">
        Weekly Meal Plan
      </Typography>
      <Box display="flex" justifyContent="center" mb={2}>
        <Button variant="contained" sx={{ mr: 2 }} onClick={showAll}>
          ALL KIDS
        </Button>
        <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={showMalnourished}>
          MALNOURISHED KIDS
        </Button>
        <Button variant="contained" color="secondary" onClick={showObese}>
          OBESE KIDS
        </Button>
      </Box>
      <Typography variant="h6" gutterBottom>
        {filterType} kids
      </Typography>
      <TextField
        variant="outlined"
        placeholder="Search by name"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ backgroundColor: '#87CEFA', color: 'black', fontWeight: 'bold' }}>
                Child's Name
              </TableCell>
              <TableCell align="right" style={{ backgroundColor: '#87CEFA', color: 'black', fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredKids.map((kid, index) => (
              <TableRow key={index}>
                <TableCell>{kid.name}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleViewMealPlan(kid._id, kid.dateOfWeighing)}
                    sx={{ mr: 1 }}
                  >
                    See meal plan
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => handleViewInfo(kid)}
                  >
                    View Info
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TableFooter>
        <Box display="flex" justifyContent="center" mt={2}>
          <Typography variant="body2">
            Rows per page: 100
          </Typography>
        </Box>
      </TableFooter>

      {/* Modal for displaying patient info */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {selectedKid && (
            <>
              <Typography variant="h6" component="h2" gutterBottom>
                Patient Information
              </Typography>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Patient Name:</strong></TableCell>
                    <TableCell>{selectedKid.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Address:</strong></TableCell>
                    <TableCell>{selectedKid.address}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Parent Name:</strong></TableCell>
                    <TableCell>{selectedKid.guardian}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Date of Birth:</strong></TableCell>
                    <TableCell>{new Date(selectedKid.dob).toLocaleDateString()}</TableCell> {/* Format Date */}
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Gender:</strong></TableCell>
                    <TableCell>{selectedKid.gender}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Height:</strong></TableCell>
                    <TableCell>{selectedKid.height} CM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Weight:</strong></TableCell>
                    <TableCell>{selectedKid.weight} KG</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Date of Weighing:</strong></TableCell>
                    <TableCell>{new Date(selectedKid.dateOfWeighing).toLocaleDateString()}</TableCell> {/* Format Date */}
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Age in Months:</strong></TableCell>
                    <TableCell>{selectedKid.ageInMonths}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Weight for Age:</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={selectedKid.weightForAge} 
                        color={selectedKid.weightForAge === 'Normal' ? 'success' : 'warning'} 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Height for Age:</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={selectedKid.heightForAge} 
                        color={selectedKid.heightForAge === 'Normal' ? 'success' : 'warning'} 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Weight for Height:</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={selectedKid.weightForHeight} 
                        color={selectedKid.weightForHeight === 'Normal' ? 'success' : selectedKid.weightForHeight === 'Wasted' ? 'error' : 'warning'} 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Nutrition Status:</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={selectedKid.nutritionStatus} 
                        color={selectedKid.nutritionStatus === 'Normal' ? 'success' : selectedKid.nutritionStatus === 'Malnourished' ? 'error' : 'warning'} 
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      <Button onClick={handleClose} variant="contained" color="primary">
                        Close
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default FoodManagement;
