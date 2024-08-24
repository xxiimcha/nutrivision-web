import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

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
    nutritionStatus: '', // New field for identifying nutrition status
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateAgeInMonths = () => {
    if (formData.dob) {
      const birthDate = moment(formData.dob);
      const today = moment();
      const ageInMonths = today.diff(birthDate, 'months');
      return ageInMonths;
    }
    return '';
  };

  const calculateStatuses = () => {
    const { weight, height, ageInMonths } = formData;

    let weightForAgeStatus = '';
    let heightForAgeStatus = '';
    let weightForHeightStatus = '';
    let nutritionStatus = ''; // New variable for identifying nutrition status

    if (weight && height && ageInMonths) {
      const bmi = weight / ((height / 100) * (height / 100));

      if (ageInMonths <= 24) {
        if (weight < 10) weightForAgeStatus = 'Underweight';
        else if (weight >= 10 && weight < 15) weightForAgeStatus = 'Normal';
        else weightForAgeStatus = 'Overweight';
      } else {
        if (weight < 15) weightForAgeStatus = 'Underweight';
        else if (weight >= 15 && weight < 20) weightForAgeStatus = 'Normal';
        else weightForAgeStatus = 'Overweight';
      }

      if (ageInMonths <= 24) {
        if (height < 70) heightForAgeStatus = 'Short';
        else if (height >= 70 && height < 85) heightForAgeStatus = 'Normal';
        else heightForAgeStatus = 'Tall';
      } else {
        if (height < 90) heightForAgeStatus = 'Short';
        else if (height >= 90 && height < 110) heightForAgeStatus = 'Normal';
        else heightForAgeStatus = 'Tall';
      }

      if (bmi < 18.5) weightForHeightStatus = 'Underweight';
      else if (bmi >= 18.5 && bmi < 24.9) weightForHeightStatus = 'Normal';
      else weightForHeightStatus = 'Overweight';

      // Determine nutrition status
      if (weightForHeightStatus === 'Underweight') {
        nutritionStatus = 'Malnourished';
      } else if (weightForHeightStatus === 'Overweight') {
        nutritionStatus = 'Obese';
      } else {
        nutritionStatus = 'Normal';
      }
    }

    return { weightForAgeStatus, heightForAgeStatus, weightForHeightStatus, nutritionStatus };
  };

  useEffect(() => {
    const ageInMonths = calculateAgeInMonths();
    setFormData((prevFormData) => ({
      ...prevFormData,
      ageInMonths: ageInMonths,
    }));
  }, [formData.dob]);

  useEffect(() => {
    const { weightForAgeStatus, heightForAgeStatus, weightForHeightStatus, nutritionStatus } = calculateStatuses();
    setFormData((prevFormData) => ({
      ...prevFormData,
      weightForAge: weightForAgeStatus,
      heightForAge: heightForAgeStatus,
      weightForHeight: weightForHeightStatus,
      nutritionStatus: nutritionStatus, // Set nutrition status
    }));
  }, [formData.weight, formData.height, formData.ageInMonths]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/patient-records/add', formData);
      toast.success('Record added successfully!');
      setTimeout(() => {
        navigate('/dashboard/records-management');
      }, 2000);
    } catch (error) {
      toast.error('Error adding record. Please try again.');
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
            <FormControl fullWidth required>
              <InputLabel>Patient Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
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
              disabled // This field is now automatically calculated and disabled
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
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nutrition Status"
              name="nutritionStatus"
              value={formData.nutritionStatus}
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
      <ToastContainer />
    </Container>
  );
};

export default AddRecord;
