import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Alert
} from '@mui/material';
import moment from 'moment';

const initialData = [
  {
    address: '123 Main St',
    parentName: 'Mary Doe',
    childName: 'John Doe',
    indigenous: 'No',
    dateOfBirth: '2018-06-15',
    weight: 20,
    height: 120,
  },
  {
    address: '456 Oak St',
    parentName: 'Robert Smith',
    childName: 'Jane Smith',
    indigenous: 'Yes',
    dateOfBirth: '2017-08-21',
    weight: 22,
    height: 130,
  },
  {
    address: '789 Pine St',
    parentName: 'Susan Brown',
    childName: 'Tom Brown',
    indigenous: 'No',
    dateOfBirth: '2019-04-10',
    weight: 18,
    height: 110,
  },
];

const calculateAgeInMonths = (dateOfBirth) => {
  const birthDate = moment(dateOfBirth);
  const currentDate = moment();
  return currentDate.diff(birthDate, 'months');
};

const getWeightForAgeStatus = (ageInMonths, weight) => {
  const averageWeight = ageInMonths * 0.4; // Philippines standard: average weight gain of 0.4 kg per month
  if (weight < 0.9 * averageWeight) {
    return 'Underweight';
  } else if (weight > 1.1 * averageWeight) {
    return 'Overweight';
  }
  return 'Normal';
};

const getHeightForAgeStatus = (ageInMonths, height) => {
  const averageHeight = ageInMonths * 0.6; // Philippines standard: average height gain of 0.6 cm per month
  if (height < 0.9 * averageHeight) {
    return 'Short';
  } else if (height > 1.1 * averageHeight) {
    return 'Tall';
  }
  return 'Normal';
};

const getWeightForHeightStatus = (weight, height) => {
  const bmi = weight / ((height / 100) ** 2); // Convert height to meters
  if (bmi < 16) {
    return 'Underweight'; // Philippines standard: BMI below 16 is considered underweight for children
  } else if (bmi > 18.5) {
    return 'Overweight'; // Philippines standard: BMI above 18.5 is considered overweight for children
  }
  return 'Normal';
};

const Records = () => {
  const [data, setData] = useState(initialData);
  const [open, setOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    address: '',
    parentName: '',
    childName: '',
    indigenous: '',
    dateOfBirth: '',
    weight: '',
    height: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const validateForm = () => {
    const { address, parentName, childName, indigenous, dateOfBirth, weight, height } = newRecord;
    if (!address || !parentName || !childName || !indigenous || !dateOfBirth || !weight || !height) {
      setError('All fields are required.');
      return false;
    }
    if (weight <= 0 || height <= 0) {
      setError('Weight and height must be positive numbers.');
      return false;
    }
    setError('');
    return true;
  };

  const handleAddRecord = () => {
    if (!validateForm()) return;
    setData([...data, newRecord]);
    setOpen(false);
    setNewRecord({
      address: '',
      parentName: '',
      childName: '',
      indigenous: '',
      dateOfBirth: '',
      weight: '',
      height: '',
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Record
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please fill in the details to add a new record.
          </DialogContentText>
          {error && <Alert severity="error">{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="address"
                label="Address"
                type="text"
                fullWidth
                value={newRecord.address}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="parentName"
                label="Name of Parent"
                type="text"
                fullWidth
                value={newRecord.parentName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="childName"
                label="Full Name of Child"
                type="text"
                fullWidth
                value={newRecord.childName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="indigenous"
                label="Indigenous"
                type="text"
                fullWidth
                value={newRecord.indigenous}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={newRecord.dateOfBirth}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="weight"
                label="Weight (kg)"
                type="number"
                fullWidth
                value={newRecord.weight}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="height"
                label="Height (cm)"
                type="number"
                fullWidth
                value={newRecord.height}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddRecord} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#B5CEF7' }}>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Address</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Name of Parent</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Full Name of Child</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Indigenous</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Date of Birth</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Weight (kg)</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Height (cm)</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Age in Months</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Weight for Age Status</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Height for Age Status</TableCell>
              <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Weight for Height Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const ageInMonths = calculateAgeInMonths(row.dateOfBirth);
              const weightForAgeStatus = getWeightForAgeStatus(ageInMonths, row.weight);
              const heightForAgeStatus = getHeightForAgeStatus(ageInMonths, row.height);
              const weightForHeightStatus = getWeightForHeightStatus(row.weight, row.height);
              const weightBgColor = weightForAgeStatus === 'Underweight' ? '#FFCDD2' : weightForAgeStatus === 'Normal' ? '#C8E6C9' : '';
              const heightBgColor = heightForAgeStatus === 'Short' ? '#FFCDD2' : heightForAgeStatus === 'Normal' ? '#C8E6C9' : '';
              const weightHeightBgColor = weightForHeightStatus === 'Underweight' ? '#FFCDD2' : weightForHeightStatus === 'Normal' ? '#C8E6C9' : '';
              return (
                <TableRow key={index}>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.address}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.parentName}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.childName}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.indigenous}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.dateOfBirth}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.weight}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{row.height}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>{ageInMonths}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)', backgroundColor: weightBgColor }}>{weightForAgeStatus}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)', backgroundColor: heightBgColor }}>{heightForAgeStatus}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)', backgroundColor: weightHeightBgColor }}>{weightForHeightStatus}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Records;
