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
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Function to handle printing the table
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '', 'width=900,height=650');
    printWindow.document.write('<html><head><title>Print Patient Records</title>');
    // Add styles for the print view
    printWindow.document.write(`
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
    `);
    printWindow.document.write('</head><body >');
    printWindow.document.write(document.getElementById('printableTable').outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
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
        <Button variant="contained" color="success" onClick={handlePrint}>
          PRINT
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table id="printableTable">
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
              <TableCell>Nutritional Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.address}</TableCell>
                  <TableCell>{record.guardian}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{formatDate(record.dob)}</TableCell>
                  <TableCell>{record.gender}</TableCell>
                  <TableCell>{record.height} CM</TableCell>
                  <TableCell>{record.weight} KG</TableCell>
                  <TableCell>{formatDate(record.dateOfWeighing)}</TableCell>
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
