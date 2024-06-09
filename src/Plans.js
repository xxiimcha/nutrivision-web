import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ButtonGroup, Button, Typography, TextField, Box } from '@mui/material';
import { styled } from '@mui/system';

const Root = styled(Paper)(({ theme }) => ({
  margin: 'auto',
  marginTop: theme.spacing(2),
  maxWidth: 800,
  padding: theme.spacing(2),
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
  borderCollapse: 'collapse',
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledTableBodyCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
}));

const ButtonGroupWrapper = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const EditButton = styled(StyledButton)({
  backgroundColor: '#1976d2',
  '&:hover': {
    backgroundColor: '#004ba0',
  },
});

const DeleteButton = styled(StyledButton)({
  backgroundColor: '#f44336',
  '&:hover': {
    backgroundColor: '#ba000d',
  },
});

const WeeklyMealPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState('malnourished');
  const [mealPlan, setMealPlan] = useState({
    malnourished: [
      { day: 'Monday', breakfast: 'Oatmeal', lunch: 'Grilled Chicken Salad', dinner: 'Brown Rice with Steamed Vegetables' },
      { day: 'Tuesday', breakfast: 'Boiled Egg', lunch: 'Quinoa Salad', dinner: 'Baked Chicken with Roasted Vegetables' },
      { day: 'Wednesday', breakfast: 'Fruit Smoothie', lunch: 'Turkey Wrap with Avocado', dinner: 'Whole Wheat Pasta with Marinara Sauce' },
      { day: 'Thursday', breakfast: 'Whole Wheat Toast with Peanut Butter', lunch: 'Mixed Vegetable Stir-Fry', dinner: 'Salmon with Steamed Broccoli' },
      { day: 'Friday', breakfast: 'Cottage Cheese with Fruits', lunch: 'Vegetable Soup', dinner: 'Grilled Fish with Steamed Brown Rice' },
      { day: 'Saturday', breakfast: 'Yogurt with Granola', lunch: 'Spinach Salad with Grilled Shrimp', dinner: 'Quinoa Bowl with Roasted Vegetables' },
      { day: 'Sunday', breakfast: 'Pancakes with Berries', lunch: 'Miso Soup with Tofu', dinner: 'Stir-Fried Tofu with Vegetables' },
    ],
    obese: [
      { day: 'Monday', breakfast: 'Whole Wheat Toast with Peanut Butter', lunch: 'Quinoa Salad', dinner: 'Baked Salmon with Steamed Broccoli' },
      { day: 'Tuesday', breakfast: 'Fruit Smoothie', lunch: 'Grilled Chicken Salad', dinner: 'Whole Wheat Pasta with Marinara Sauce' },
      { day: 'Wednesday', breakfast: 'Vegetable Omelette', lunch: 'Turkey Wrap with Avocado', dinner: 'Grilled Vegetable Sandwich' },
      { day: 'Thursday', breakfast: 'Oatmeal', lunch: 'Mixed Vegetable Stir-Fry', dinner: 'Baked Chicken with Steamed Vegetables' },
      { day: 'Friday', breakfast: 'Boiled Egg', lunch: 'Vegetable Soup', dinner: 'Grilled Fish with Steamed Brown Rice' },
      { day: 'Saturday', breakfast: 'Greek Yogurt with Honey', lunch: 'Cobb Salad with Grilled Shrimp', dinner: 'Brown Rice with Stir-Fried Tofu' },
      { day: 'Sunday', breakfast: 'Scrambled Eggs with Spinach', lunch: 'Quinoa Bowl with Roasted Vegetables', dinner: 'Salmon with Asparagus' },
    ],
  });
  const [editedMeal, setEditedMeal] = useState({});

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
  };

  const handleEdit = (day, mealType, newValue) => {
    setEditedMeal(prevState => ({
      ...prevState,
      day,
      [mealType]: newValue
    }));
  };

  const handleSaveEdit = () => {
    if (editedMeal.day) {
      const updatedMealPlan = { ...mealPlan };
      updatedMealPlan[selectedPlan] = updatedMealPlan[selectedPlan].map(item =>
        item.day === editedMeal.day ? { ...item, ...editedMeal } : item
      );
      setMealPlan(updatedMealPlan);
      setEditedMeal({});
    }
  };

  const handleCancelEdit = () => {
    setEditedMeal({});
  };

  const handleDelete = (day) => {
    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan[selectedPlan] = updatedMealPlan[selectedPlan].filter(item => item.day !== day);
    setMealPlan(updatedMealPlan);
    setEditedMeal({});
  };

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const [currentWeek, setCurrentWeek] = useState(0);

  const handleNextWeek = () => {
    setCurrentWeek(prevWeek => (prevWeek + 1) % 4);
  };

  const handlePrevWeek = () => {
    setCurrentWeek(prevWeek => (prevWeek === 0 ? 3 : prevWeek - 1));
  };

  // Split meal plan by weeks
  const weeklyPlans = {
    malnourished: [],
    obese: []
  };
  for (let i = 0; i < 7; i += 7) {
    weeklyPlans.malnourished.push(mealPlan.malnourished.slice(i, i + 7));
    weeklyPlans.obese.push(mealPlan.obese.slice(i, i + 7));
  }

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        Weekly Meal Plan
      </Typography>
      <ButtonGroupWrapper>
        <ButtonGroup variant="outlined" aria-label="outlined primary button group">
          <StyledButton onClick={() => handlePlanChange('malnourished')}>Malnourished Kids</StyledButton>
          <StyledButton onClick={() => handlePlanChange('obese')}>Obese Kids</StyledButton>
        </ButtonGroup>
      </ButtonGroupWrapper>
      <Root>
        <ButtonGroupWrapper>
          <Button onClick={handlePrevWeek}>Previous Week</Button>
          <Button onClick={handleNextWeek}>Next Week</Button>
        </ButtonGroupWrapper>
        <TableContainer>
          <StyledTable>
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell>Day</StyledTableHeaderCell>
                <StyledTableHeaderCell>Breakfast</StyledTableHeaderCell>
                <StyledTableHeaderCell>Lunch</StyledTableHeaderCell>
                <StyledTableHeaderCell>Dinner</StyledTableHeaderCell>
                <StyledTableHeaderCell>Actions</StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weeklyPlans[selectedPlan][currentWeek] && weeklyPlans[selectedPlan][currentWeek].map((row) => (
                <TableRow key={row.day}>
                  <StyledTableBodyCell>{row.day}</StyledTableBodyCell>
                  <StyledTableBodyCell>
                    {editedMeal && row.day === editedMeal.day ? (
                      <TextField
                        value={editedMeal.breakfast || row.breakfast}
                        onChange={(e) => handleEdit(row.day, 'breakfast', e.target.value)}
                      />
                    ) : (
                      row.breakfast
                    )}
                  </StyledTableBodyCell>
                  <StyledTableBodyCell>
                    {editedMeal && row.day === editedMeal.day ? (
                      <TextField
                        value={editedMeal.lunch || row.lunch}
                        onChange={(e) => handleEdit(row.day, 'lunch', e.target.value)}
                      />
                    ) : (
                      row.lunch
                    )}
                  </StyledTableBodyCell>
                  <StyledTableBodyCell>
                    {editedMeal && row.day === editedMeal.day ? (
                      <TextField
                        value={editedMeal.dinner || row.dinner}
                        onChange={(e) => handleEdit(row.day, 'dinner', e.target.value)}
                      />
                    ) : (
                      row.dinner
                    )}
                  </StyledTableBodyCell>
                  <StyledTableBodyCell>
                    {editedMeal && row.day === editedMeal.day ? (
                      <>
                        <EditButton onClick={handleSaveEdit}>Save</EditButton>
                        <StyledButton onClick={handleCancelEdit}>Cancel</StyledButton>
                      </>
                    ) : (
                      <EditButton onClick={() => setEditedMeal(row)}>Edit</EditButton>
                    )}
                    <DeleteButton onClick={() => handleDelete(row.day)}>Delete</DeleteButton>
                  </StyledTableBodyCell>
                </TableRow>
              ))}
            </TableBody>
          </StyledTable>
        </TableContainer>
      </Root>
    </Box>
  );
};

export default WeeklyMealPlan;
