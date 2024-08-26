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

const RecordsManagement = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patient-records');
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
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (recordId) => {
    navigate(`/dashboard/patient-details/${recordId}`);
  };

  const extractDate = (datetime) => {
    return datetime.split('T')[0];
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
        <Button variant="contained" color="success" startIcon={<PrintIcon />}>
          PRINT
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference Number</TableCell> {/* Added this line */}
              <TableCell>Address</TableCell>
              <TableCell>Name of Parent</TableCell>
              <TableCell>Full name of Patient</TableCell>
              <TableCell>Patient Date of Birth</TableCell>
              <TableCell>Patient Gender</TableCell>
              <TableCell>Patient Height (CM)</TableCell>
              <TableCell>Patient Weight (KG)</TableCell>
              <TableCell>Date of Weighing</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.referenceNumber}</TableCell> {/* Added this line */}
                <TableCell>{record.address}</TableCell>
                <TableCell>{record.parentName}</TableCell>
                <TableCell>{record.patientName}</TableCell>
                <TableCell>{extractDate(record.dob)}</TableCell>
                <TableCell>{record.gender}</TableCell>
                <TableCell>{record.height}</TableCell>
                <TableCell>{record.weight}</TableCell>
                <TableCell>{extractDate(record.dateOfWeighing)}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleViewDetails(record._id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RecordsManagement;
