import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API calls

const AddRecord = () => {
  const [formData, setFormData] = useState({
    address: '',
    parentName: '',
    patientName: '',
    dob: '',
    gender: '',
    height: '',
    weight: '',
    dateOfWeighing: '',
    ageInMonths: '',
    weightForAge: '',
    heightForAge: '',
    weightForHeight: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Example calculations for the status fields based on age, weight, and height
  const calculateStatuses = () => {
    const { weight, height, ageInMonths } = formData;
    
    // Example logic (replace with real calculations)
    let weightForAgeStatus = '';
    let heightForAgeStatus = '';
    let weightForHeightStatus = '';

    if (weight && height && ageInMonths) {
      const bmi = weight / ((height / 100) * (height / 100));

      // Calculate Weight for Age Status
      if (ageInMonths <= 24) {
        if (weight < 10) weightForAgeStatus = 'Underweight';
        else if (weight >= 10 && weight < 15) weightForAgeStatus = 'Normal';
        else weightForAgeStatus = 'Overweight';
      } else {
        if (weight < 15) weightForAgeStatus = 'Underweight';
        else if (weight >= 15 && weight < 20) weightForAgeStatus = 'Normal';
        else weightForAgeStatus = 'Overweight';
      }

      // Calculate Height for Age Status
      if (ageInMonths <= 24) {
        if (height < 70) heightForAgeStatus = 'Short';
        else if (height >= 70 && height < 85) heightForAgeStatus = 'Normal';
        else heightForAgeStatus = 'Tall';
      } else {
        if (height < 90) heightForAgeStatus = 'Short';
        else if (height >= 90 && height < 110) heightForAgeStatus = 'Normal';
        else heightForAgeStatus = 'Tall';
      }

      // Calculate Weight for Height Status (BMI-based)
      if (bmi < 18.5) weightForHeightStatus = 'Underweight';
      else if (bmi >= 18.5 && bmi < 24.9) weightForHeightStatus = 'Normal';
      else weightForHeightStatus = 'Overweight';
    }

    return { weightForAgeStatus, heightForAgeStatus, weightForHeightStatus };
  };

  useEffect(() => {
    const { weightForAgeStatus, heightForAgeStatus, weightForHeightStatus } = calculateStatuses();
    setFormData((prevFormData) => ({
      ...prevFormData,
      weightForAge: weightForAgeStatus,
      heightForAge: heightForAgeStatus,
      weightForHeight: weightForHeightStatus,
    }));
  }, [formData.weight, formData.height, formData.ageInMonths]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/patient-records/add', formData);
      console.log('Record added:', response.data);
      navigate('/dashboard/records');
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add Patient Record
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name of Parent"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Full name of Patient"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Patient Date of Birth"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Patient Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Patient Height (CM)"
              name="height"
              value={formData.height}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Patient Weight (KG)"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date of Weighing"
              name="dateOfWeighing"
              type="date"
              value={formData.dateOfWeighing}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Age in Months"
              name="ageInMonths"
              value={formData.ageInMonths}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Weight for Age Status"
              name="weightForAge"
              value={formData.weightForAge}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Height for Age Status"
              name="heightForAge"
              value={formData.heightForAge}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Weight for Height Status"
              name="weightForHeight"
              value={formData.weightForHeight}
              fullWidth
              disabled
            />
          </Grid>
        </Grid>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" type="submit">
            Add Record
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AddRecord;
