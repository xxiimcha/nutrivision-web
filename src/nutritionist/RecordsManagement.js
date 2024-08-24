import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  Button,
  TablePagination,
} from '@mui/material';
import axios from 'axios';

function RecordsManagement() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patient-records');
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching patient records:', error);
      }
    };

    fetchRecords();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRecords = records.filter((record) =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to format dates to YYYY-MM-DD
  const formatDate = (dateString) => {
    return dateString ? dateString.split('T')[0] : '';
  };

  // Helper function to get the background color based on status
  const getStatusColor = (status, type) => {
    const colors = {
      weightForAge: {
        Underweight: 'red',
        Normal: 'green',
        Overweight: 'orange',
      },
      heightForAge: {
        Short: 'red',
        Normal: 'green',
        Tall: 'orange',
      },
      weightForHeight: {
        Underweight: 'red',
        Normal: 'green',
        Overweight: 'orange',
      },
      nutritionStatus: {
        Malnourished: 'red',
        Normal: 'green',
        Obese: 'orange',
      },
    };

    return colors[type][status] || 'inherit';
  };

  return (
    <Box p={2}>
      <Typography variant="h4" component="h2" gutterBottom>
        Patients Record
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          variant="outlined"
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
          sx={{ marginRight: 2 }}
        />
        <Button variant="contained" color="primary" sx={{ marginRight: 2 }}>
          ADD RECORD
        </Button>
        <Button variant="contained" color="success">
          PRINT
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell>Name of Parent</TableCell>
              <TableCell>Full name of Patient</TableCell>
              <TableCell>Patient Date of Birth</TableCell>
              <TableCell>Patient Gender</TableCell>
              <TableCell>Patient Height (CM)</TableCell>
              <TableCell>Patient Weight (KG)</TableCell>
              <TableCell>Date of Weighing</TableCell>
              <TableCell>Age in Months</TableCell>
              <TableCell>Weight for age Status</TableCell>
              <TableCell>Height for age Status</TableCell>
              <TableCell>Weight for Height Status</TableCell>
              <TableCell>Nutritional Status</TableCell> {/* New Column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.address}</TableCell>
                  <TableCell>{record.parentName}</TableCell>
                  <TableCell>{record.patientName}</TableCell>
                  <TableCell>{formatDate(record.dob)}</TableCell> {/* Formatted date */}
                  <TableCell>{record.gender}</TableCell>
                  <TableCell>{record.height} CM</TableCell>
                  <TableCell>{record.weight} KG</TableCell>
                  <TableCell>{formatDate(record.dateOfWeighing)}</TableCell> {/* Formatted date */}
                  <TableCell>{record.ageInMonths}</TableCell>
                  <TableCell
                    style={{ backgroundColor: getStatusColor(record.weightForAge, 'weightForAge') }}
                  >
                    {record.weightForAge}
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: getStatusColor(record.heightForAge, 'heightForAge') }}
                  >
                    {record.heightForAge}
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: getStatusColor(record.weightForHeight, 'weightForHeight') }}
                  >
                    {record.weightForHeight}
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: getStatusColor(record.nutritionStatus, 'nutritionStatus') }}
                  >
                    {record.nutritionStatus}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredRecords.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

export default RecordsManagement;
