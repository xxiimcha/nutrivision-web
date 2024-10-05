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
              <TableCell sx={{ fontWeight: 'bold' }}>Number</TableCell> 
              <TableCell sx={{ fontWeight: 'bold' }}>Name of Parent</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Full name of Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient Date of Birth</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient Gender</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient Height (CM)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient Weight (KG)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date of Weighing</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
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
