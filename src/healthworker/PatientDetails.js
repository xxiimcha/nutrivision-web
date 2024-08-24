import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import axios from 'axios';

const PatientDetails = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patient-records/${recordId}`);
        setRecord(response.data);
      } catch (error) {
        console.error('Error fetching record:', error);
      }
    };

    fetchRecord();
  }, [recordId]);

  const handleBack = () => {
    navigate('/dashboard/records-management');
  };

  if (!record) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Patient Details
      </Typography>
      <Paper sx={{ padding: 2 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell><strong>Reference Number:</strong></TableCell>
              <TableCell>{record.referenceNumber}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Address:</strong></TableCell>
              <TableCell>{record.address}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Name of Parent:</strong></TableCell>
              <TableCell>{record.parentName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Full Name of Patient:</strong></TableCell>
              <TableCell>{record.patientName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Date of Birth:</strong></TableCell>
              <TableCell>{record.dob.split('T')[0]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Gender:</strong></TableCell>
              <TableCell>{record.gender}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Height (CM):</strong></TableCell>
              <TableCell>{record.height}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Weight (KG):</strong></TableCell>
              <TableCell>{record.weight}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Date of Weighing:</strong></TableCell>
              <TableCell>{record.dateOfWeighing.split('T')[0]}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Age in Months:</strong></TableCell>
              <TableCell>{record.ageInMonths}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Weight for Age Status:</strong></TableCell>
              <TableCell>{record.weightForAge}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Height for Age Status:</strong></TableCell>
              <TableCell>{record.heightForAge}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Weight for Height Status:</strong></TableCell>
              <TableCell>{record.weightForHeight}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={handleBack}>
          Back to Records Management
        </Button>
      </Box>
    </Container>
  );
};

export default PatientDetails;
