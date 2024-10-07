import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RecordsManagement = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/patient-records`);
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRecords = records.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (recordId) => {
    navigate(`/dashboard/patient-details/${recordId}`);
  };

  const extractDate = (datetime) => {
    return datetime.split('T')[0];
  };

  // Alternative print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const tableHTML = document.getElementById('records-table').outerHTML; // Get the table's HTML

    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Records</title>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h2>Patient Records</h2>
          ${tableHTML}  <!-- Insert the table into the new window -->
        </body>
      </html>
    `);
    
    printWindow.document.close(); // Close the document to finish writing
    printWindow.focus();
    printWindow.print();  // Trigger the print dialog
    printWindow.close();  // Close the window after printing
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Patients Record
      </Typography>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          variant="outlined"
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
          sx={{ marginRight: 2 }}
        />
        <Button variant="contained" color="success" startIcon={<PrintIcon />} onClick={handlePrint}>
          PRINT
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table id="records-table"> {/* Add id for printing */}
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Number</TableCell> 
              <TableCell sx={{ fontWeight: 'bold' }}>Name of Parent</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Full name of Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient Date of Birth</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient Gender</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient Height (CM)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient Weight (KG)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date of Weighing</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography fontWeight="bold">{index + 1}</Typography> {/* Incremental number in bold */}
                </TableCell>
                <TableCell>{record.guardian}</TableCell>
                <TableCell>{record.name}</TableCell>
                <TableCell>{record.address}</TableCell>
                <TableCell>{extractDate(record.dob)}</TableCell>
                <TableCell>{record.gender}</TableCell>
                <TableCell>{record.height}</TableCell>
                <TableCell>{record.weight}</TableCell>
                <TableCell>{extractDate(record.dateOfWeighing)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RecordsManagement;
