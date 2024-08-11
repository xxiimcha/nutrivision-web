import React, { useState } from 'react';
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
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';

const RecordsManagement = () => {
  const [records, setRecords] = useState([
    {
      address: '123 Main St.',
      parentName: 'Mary, Doe',
      patientName: 'John, Doe',
      dob: '06-15-2018',
      gender: 'Male',
      height: '120 CM',
      weight: '20 KG',
      dateOfWeighing: '06-15-2024',
      ageInMonths: '72',
      weightForAge: 'Underweight',
      heightForAge: 'Tall',
      weightForHeight: 'Underweight',
    },
    {
      address: '456 Oak St.',
      parentName: 'Robert, Smith',
      patientName: 'Jane, Smith',
      dob: '08-21-2017',
      gender: 'Female',
      height: '130 CM',
      weight: '22 KG',
      dateOfWeighing: '08-21-2024',
      ageInMonths: '82',
      weightForAge: 'Underweight',
      heightForAge: 'Tall',
      weightForHeight: 'Underweight',
    },
    {
      address: '789 Pine St.',
      parentName: 'Susan, Brown',
      patientName: 'Tom, Brown',
      dob: '04-10-2019',
      gender: 'Male',
      height: '110 CM',
      weight: '18 KG',
      dateOfWeighing: '04-10-2024',
      ageInMonths: '62',
      weightForAge: 'Underweight',
      heightForAge: 'Tall',
      weightForHeight: 'Underweight',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRecords = records.filter((record) =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRecord = () => {
    navigate('/dashboard/add-record');
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRecord}
          sx={{ marginLeft: 2 }}
        >
          ADD RECORD
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
              <TableCell>Weight for Age Status</TableCell>
              <TableCell>Height for Age Status</TableCell>
              <TableCell>Weight for Height Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.address}</TableCell>
                <TableCell>{record.parentName}</TableCell>
                <TableCell>{record.patientName}</TableCell>
                <TableCell>{record.dob}</TableCell>
                <TableCell>{record.gender}</TableCell>
                <TableCell>{record.height}</TableCell>
                <TableCell>{record.weight}</TableCell>
                <TableCell>{record.dateOfWeighing}</TableCell>
                <TableCell>{record.ageInMonths}</TableCell>
                <TableCell style={{ backgroundColor: 'red', color: 'white' }}>{record.weightForAge}</TableCell>
                <TableCell style={{ backgroundColor: 'red', color: 'white' }}>{record.heightForAge}</TableCell>
                <TableCell style={{ backgroundColor: 'red', color: 'white' }}>{record.weightForHeight}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RecordsManagement;
