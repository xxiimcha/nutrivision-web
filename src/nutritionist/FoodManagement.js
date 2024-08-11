import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // for navigation

const FoodManagement = () => {
  const [kids, setKids] = useState([
    { name: 'John Doe', status: 'Malnourished' },
    { name: 'Jane Smith', status: 'Obese' },
    { name: 'Tom Brown', status: 'Malnourished' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredKids = kids.filter((kid) =>
    kid.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewMealPlan = (name) => {
    navigate(`/dashboard/meal-plan/${name}`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Weekly Meal Plan
      </Typography>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="primary">
          Malnourished Kids
        </Button>
        <Button variant="contained" color="secondary">
          Obese Kids
        </Button>
      </Box>
      <TextField
        variant="outlined"
        placeholder="Search by name"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Child's Name</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredKids.map((kid, index) => (
              <TableRow key={index}>
                <TableCell>{kid.name}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleViewMealPlan(kid.name)}
                  >
                    See meal plan
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

export default FoodManagement;
