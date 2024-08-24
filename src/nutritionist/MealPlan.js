import React, { useState, useEffect } from 'react';
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
  Modal,
  TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const MealPlan = () => {
  const { id, week } = useParams(); // Get the patient ID and week from the URL
  const [mealPlan, setMealPlan] = useState({});
  const [patientInfo, setPatientInfo] = useState({ patientName: 'N/A', height: 'N/A', weight: 'N/A' }); // State for patient info
  const [open, setOpen] = useState(false); // State to control modal visibility
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [mealDetails, setMealDetails] = useState({ mainDish: '', drinks: '', vitamins: '' });
  const navigate = useNavigate();

  // Calculate start and end dates of the week
  const startOfWeek = moment(week).startOf('week').format('YYYY-MM-DD');
  const endOfWeek = moment(week).endOf('week').format('YYYY-MM-DD');

  useEffect(() => {
    const fetchMealPlanAndPatientInfo = async () => {
      try {
        if (id && week) {
          const [mealPlanResponse, patientResponse] = await Promise.all([
            axios.get(`http://localhost:5000/api/meal-plans/${id}/${week}`),
            axios.get(`http://localhost:5000/api/patient-records/${id}`),
          ]);

          // Log the responses to ensure data is coming in as expected
          console.log('Meal Plan Response:', mealPlanResponse.data);
          console.log('Patient Info Response:', patientResponse.data);

          // Setting the meal plan data
          if (mealPlanResponse.data) {
            setMealPlan(mealPlanResponse.data);
          } else {
            setMealPlan({
              Monday: { breakfast: {}, lunch: {}, dinner: {}, recommended: false },
              Tuesday: { breakfast: {}, lunch: {}, dinner: {}, recommended: false },
              Wednesday: { breakfast: {}, lunch: {}, dinner: {}, recommended: false },
              Thursday: { breakfast: {}, lunch: {}, dinner: {}, recommended: false },
              Friday: { breakfast: {}, lunch: {}, dinner: {}, recommended: false },
              Saturday: { breakfast: {}, lunch: {}, dinner: {}, recommended: false },
              Sunday: { breakfast: {}, lunch: {}, dinner: {}, recommended: false },
            });
          }

          // Setting the patient information
          if (patientResponse.data) {
            setPatientInfo({
              patientName: patientResponse.data.patientName,
              height: patientResponse.data.height,
              weight: patientResponse.data.weight,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching meal plan or patient information:', error);
      }
    };

    fetchMealPlanAndPatientInfo();
  }, [id, week]);

  const handleWeekChange = (direction) => {
    let newWeek = moment(week);
    if (direction === 'next') {
      newWeek = newWeek.add(1, 'week');
    } else {
      newWeek = newWeek.subtract(1, 'week');
    }
    navigate(`/dashboard/meal-plan/${id}/${newWeek.format('YYYY-MM-DD')}`);
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

  const handleOpenModal = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setMealDetails({ mainDish: '', drinks: '', vitamins: '' });
  };

  const handleSaveMeal = async () => {
    const updatedMealPlan = { ...mealPlan };

    // Ensure the selected day exists in the mealPlan object
    if (!updatedMealPlan[selectedDay]) {
      updatedMealPlan[selectedDay] = {
        breakfast: {},
        lunch: {},
        dinner: {},
        recommended: false,
      };
    }

    // Update the meal details for the selected meal type
    updatedMealPlan[selectedDay][selectedMealType] = mealDetails;

    try {
      await axios.post(`http://localhost:5000/api/meal-plans/${id}/${week}`, updatedMealPlan);
      setMealPlan(updatedMealPlan);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Meal Plan
      </Typography>
      <Box mb={2}>
        <Typography variant="h6">
          Child's Name: {patientInfo.patientName}
        </Typography>
        <Typography variant="subtitle1">
          Height: {patientInfo.height}, Weight: {patientInfo.weight}
        </Typography>
        <Typography variant="subtitle1">
          Week: {startOfWeek} to {endOfWeek}
        </Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="primary" onClick={() => handleWeekChange('previous')}>
          Previous Week
        </Button>
        <Button variant="contained" color="secondary" onClick={() => handleWeekChange('next')}>
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
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <TableRow key={day}>
                <TableCell>{day}</TableCell>
                <TableCell>
                  <div>Main dish: {mealPlan[day]?.breakfast?.mainDish || 'No meal planned'}</div>
                  <div>Drinks: {mealPlan[day]?.breakfast?.drinks || 'No meal planned'}</div>
                  <div>Vitamins: {mealPlan[day]?.breakfast?.vitamins || 'No meal planned'}</div>
                  {mealPlan[day]?.breakfast?.mainDish ? (
                    <>
                      <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                        View proof of meal
                      </Button>
                      {getStatusButton(mealPlan[day]?.breakfast?.status)}
                    </>
                  ) : (
                    <Button variant="contained" color="primary" sx={{ mt: 1 }} onClick={() => handleOpenModal(day, 'breakfast')}>
                      Add Meal
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <div>Main dish: {mealPlan[day]?.lunch?.mainDish || 'No meal planned'}</div>
                  <div>Drinks: {mealPlan[day]?.lunch?.drinks || 'No meal planned'}</div>
                  <div>Vitamins: {mealPlan[day]?.lunch?.vitamins || 'No meal planned'}</div>
                  {mealPlan[day]?.lunch?.mainDish ? (
                    <>
                      <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                        View proof of meal
                      </Button>
                      {getStatusButton(mealPlan[day]?.lunch?.status)}
                    </>
                  ) : (
                    <Button variant="contained" color="primary" sx={{ mt: 1 }} onClick={() => handleOpenModal(day, 'lunch')}>
                      Add Meal
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <div>Main dish: {mealPlan[day]?.dinner?.mainDish || 'No meal planned'}</div>
                  <div>Drinks: {mealPlan[day]?.dinner?.drinks || 'No meal planned'}</div>
                  <div>Vitamins: {mealPlan[day]?.dinner?.vitamins || 'No meal planned'}</div>
                  {mealPlan[day]?.dinner?.mainDish ? (
                    <>
                      <Button variant="contained" color="primary" sx={{ mt: 1 }}>
                        View proof of meal
                      </Button>
                      {getStatusButton(mealPlan[day]?.dinner?.status)}
                    </>
                  ) : (
                    <Button variant="contained" color="primary" sx={{ mt: 1 }} onClick={() => handleOpenModal(day, 'dinner')}>
                      Add Meal
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={mealPlan[day]?.recommended || false}
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

      {/* Modal for adding meal */}
      <Modal open={open} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add {selectedMealType} for {selectedDay}
          </Typography>
          <TextField
            label="Main Dish"
            value={mealDetails.mainDish}
            onChange={(e) => setMealDetails({ ...mealDetails, mainDish: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Drinks"
            value={mealDetails.drinks}
            onChange={(e) => setMealDetails({ ...mealDetails, drinks: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Vitamins"
            value={mealDetails.vitamins}
            onChange={(e) => setMealDetails({ ...mealDetails, vitamins: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="primary" onClick={handleSaveMeal}>
              Save
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default MealPlan;
