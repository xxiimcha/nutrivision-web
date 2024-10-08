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

const FoodManagement = () => {
  const [kids, setKids] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKid, setSelectedKid] = useState(null); // For storing selected kid's info
  const [open, setOpen] = useState(false); // For handling modal open/close
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

  // Filter kids based on their nutrition status and search term
  const filteredKids = kids.filter(
    (kid) =>
      (kid.nutritionStatus === 'Malnourished' || kid.nutritionStatus === 'Obese') &&
      kid.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewMealPlan = (id) => {
    const week = '2024-08-18'; // Example week; you should calculate or pass the correct week dynamically
    navigate(`/dashboard/meal-plan/${id}/${week}`);
  };

  const handleViewInfo = (kid) => {
    setSelectedKid(kid);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom align="center">
        Weekly Meal Plan
      </Typography>
      <Box display="flex" justifyContent="center" mb={2}>
        <Button variant="contained" color="primary" sx={{ mr: 2 }}>
          MALNOURISHED KIDS
        </Button>
        <Button variant="contained" color="secondary">
          OBESE KIDS
        </Button>
      </Box>
      <Typography variant="h6" gutterBottom>
        Malnourished kids
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
                <TableCell>{kid.patientName}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleViewMealPlan(kid._id)}
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
                    <TableCell>{selectedKid.patientName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Address:</strong></TableCell>
                    <TableCell>{selectedKid.address}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Parent Name:</strong></TableCell>
                    <TableCell>{selectedKid.parentName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Date of Birth:</strong></TableCell>
                    <TableCell>{selectedKid.dob}</TableCell>
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
                    <TableCell>{selectedKid.dateOfWeighing}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Age in Months:</strong></TableCell>
                    <TableCell>{selectedKid.ageInMonths}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Weight for Age:</strong></TableCell>
                    <TableCell>{selectedKid.weightForAge}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Height for Age:</strong></TableCell>
                    <TableCell>{selectedKid.heightForAge}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Weight for Height:</strong></TableCell>
                    <TableCell>{selectedKid.weightForHeight}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Nutrition Status:</strong></TableCell>
                    <TableCell>{selectedKid.nutritionStatus}</TableCell>
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
