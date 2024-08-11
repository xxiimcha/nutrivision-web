import React from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Paper,
  TableContainer,
  Switch,
} from '@mui/material';

const MealPlan = () => {
  const mealPlan = {
    Monday: {
      breakfast: {
        mainDish: 'Fruit salad',
        drinks: 'Smoothie',
        vitamins: 'Vitamin C Anti',
        status: 'done',
      },
      lunch: {
        mainDish: 'Fruit salad',
        drinks: 'Smoothie',
        vitamins: 'Vitamin C Anti',
        status: 'done',
      },
      dinner: {
        mainDish: 'Fruit salad',
        drinks: 'Smoothie',
        vitamins: 'Vitamin C Anti',
        status: 'done',
      },
      recommended: true,
    },
    Tuesday: {
      breakfast: {
        mainDish: '',
        drinks: '',
        vitamins: '',
        status: 'in-progress',
      },
      lunch: {
        mainDish: '',
        drinks: '',
        vitamins: '',
        status: 'in-progress',
      },
      dinner: {
        mainDish: '',
        drinks: '',
        vitamins: '',
        status: 'in-progress',
      },
      recommended: false,
    },
    // Add more days as needed...
  };

  const getStatusButton = (status) => {
    if (status === 'done') {
      return <Button variant="contained" color="success">DONE</Button>;
    } else if (status === 'in-progress') {
      return <Button variant="contained" color="warning">IN PROGRESS</Button>;
    } else {
      return null;
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        John Doe Meal Plan
      </Typography>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="primary">
          Previous Week
        </Button>
        <Button variant="contained" color="secondary">
          Next Week
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>DAY</TableCell>
              <TableCell>Breakfast</TableCell>
              <TableCell>Lunch</TableCell>
              <TableCell>Dinner</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(mealPlan).map(([day, meals], index) => (
              <TableRow key={index}>
                <TableCell>{day}</TableCell>
                <TableCell>
                  <div>Main dish: {meals.breakfast.mainDish}</div>
                  <div>Drinks: {meals.breakfast.drinks}</div>
                  <div>Vitamins: {meals.breakfast.vitamins}</div>
                  <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                    View proof of meal
                  </Button>
                  {getStatusButton(meals.breakfast.status)}
                </TableCell>
                <TableCell>
                  <div>Main dish: {meals.lunch.mainDish}</div>
                  <div>Drinks: {meals.lunch.drinks}</div>
                  <div>Vitamins: {meals.lunch.vitamins}</div>
                  <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                    View proof of meal
                  </Button>
                  {getStatusButton(meals.lunch.status)}
                </TableCell>
                <TableCell>
                  <div>Main dish: {meals.dinner.mainDish}</div>
                  <div>Drinks: {meals.dinner.drinks}</div>
                  <div>Vitamins: {meals.dinner.vitamins}</div>
                  <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                    View proof of meal
                  </Button>
                  {getStatusButton(meals.dinner.status)}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={meals.recommended}
                    color="primary"
                    inputProps={{ 'aria-label': 'recommended-switch' }}
                  />
                  <Button variant="contained" color="success" sx={{ mt: 1 }}>
                    SEND MEAL PLAN
                  </Button>
                  <Button variant="contained" color="info" sx={{ mt: 1 }}>
                    EDIT
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

export default MealPlan;
