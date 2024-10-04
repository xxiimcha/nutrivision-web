import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      {/* Back Button on the upper left */}
      <Box mt={2} display="flex" justifyContent="flex-start">
        <IconButton onClick={handleBack} aria-label="back" color="primary">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Box mt={2} mb={4}>
        <Typography variant="h4" gutterBottom align="center">
          Patient Details
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Address:</strong></Typography>
                <Typography variant="body1">{record.address || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Name of Parent:</strong></Typography>
                <Typography variant="body1">{record.guardian || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Full Name of Patient:</strong></Typography>
                <Typography variant="body1">{record.name || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Date of Birth:</strong></Typography>
                <Typography variant="body1">{record.dob.split('T')[0] || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Gender:</strong></Typography>
                <Typography variant="body1">{record.gender || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Height (CM):</strong></Typography>
                <Typography variant="body1">{record.height || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Weight (KG):</strong></Typography>
                <Typography variant="body1">{record.weight || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Date of Weighing:</strong></Typography>
                <Typography variant="body1">{record.dateOfWeighing.split('T')[0] || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Age in Months:</strong></Typography>
                <Typography variant="body1">{record.ageInMonths || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Weight for Age Status:</strong></Typography>
                <Typography variant="body1">{record.weightForAge || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Height for Age Status:</strong></Typography>
                <Typography variant="body1">{record.heightForAge || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Weight for Height Status:</strong></Typography>
                <Typography variant="body1">{record.weightForHeight || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1"><strong>Nutritional Status:</strong></Typography>
                <Typography variant="body1">{record.nutritionStatus || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PatientDetails;
