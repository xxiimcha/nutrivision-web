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
  Badge,
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

          setMealPlan(mealPlanResponse.data);
          setPatientInfo(patientResponse.data);
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

  const handleOpenModal = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setMealDetails(mealPlan[day]?.[mealType] || { mainDish: '', drinks: '', vitamins: '' });
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
        status: '', // Initialize status if not set
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

  const handleApproveMeal = async (day, mealType) => {
    const updatedMealPlan = { ...mealPlan };

    if (updatedMealPlan[day] && updatedMealPlan[day][mealType]) {
      updatedMealPlan[day][mealType].approved = true;
    }

    try {
      await axios.post(`http://localhost:5000/api/meal-plans/${id}/${week}`, updatedMealPlan);
      setMealPlan(updatedMealPlan);
    } catch (error) {
      console.error('Error approving meal:', error);
    }
  };

  const handleSendMealPlan = async (day) => {
    try {
      const updatedMealPlan = { ...mealPlan };
      updatedMealPlan[day].status = 'sent'; // Set status for the specific day
  
      // Send the updated meal plan
      await axios.post(`http://localhost:5000/api/meal-plans/${id}/${week}`, updatedMealPlan);
      setMealPlan(updatedMealPlan);
  
      // Fetch the patient record to get the userId for notifications
      const patientResponse = await axios.get(`http://localhost:5000/api/patient-records/${id}`);
      const userId = patientResponse.data.userId; // Assuming the userId is stored under 'userId' in the patient record
  
      // Create a notification
      const notification = {
        user_id: userId,
        reserved_time: new Date().toISOString(), // Assuming you want to store the current time
        post_id: null, // If you have a specific post ID, replace 'null' with the appropriate value
        details: `Meal plan for ${day}, week of ${week}, has been sent.`, // Customize the notification message as needed
        updated_at: new Date().toISOString(), // The time the notification is created or updated
      };
  
      // Send the notification to the backend
      await axios.post(`http://localhost:5000/api/notifications`, notification);
  
      // Optionally, show a success message to the user
      console.log('Meal plan sent and notification created successfully.');
    } catch (error) {
      console.error('Error sending meal plan or creating notification:', error);
    }
  };


  const allMealsApproved = (day) => {
    return ['breakfast', 'lunch', 'dinner'].every(
      (mealType) => mealPlan[day]?.[mealType]?.approved
    );
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
              <TableCell>Status</TableCell> {/* New column for status */}
            </TableRow>
          </TableHead>
          <TableBody>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <TableRow key={day}>
                <TableCell>{day}</TableCell>
                {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                  <TableCell key={mealType}>
                    <div>Main dish: {mealPlan[day]?.[mealType]?.mainDish || 'No meal planned'}</div>
                    <div>Drinks: {mealPlan[day]?.[mealType]?.drinks || 'No meal planned'}</div>
                    <div>Vitamins: {mealPlan[day]?.[mealType]?.vitamins || 'No meal planned'}</div>
                    {mealPlan[day]?.[mealType]?.approved ? (
                      <Button variant="contained" color="success" sx={{ mt: 1 }} disabled>
                        Approved
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 1, mr: 1 }}
                          onClick={() => handleOpenModal(day, mealType)}
                        >
                          {mealPlan[day]?.[mealType]?.mainDish ? 'Edit Meal' : 'Add Meal'}
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          sx={{ mt: 1 }}
                          onClick={() => handleApproveMeal(day, mealType)}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Switch
                    checked={mealPlan[day]?.recommended || false}
                    color="primary"
                    inputProps={{ 'aria-label': 'recommended-switch' }}
                  />
                  {allMealsApproved(day) && mealPlan[day].status !== 'sent' && (
                    <Button variant="contained" color="success" sx={{ mt: 1 }} onClick={() => handleSendMealPlan(day)}>
                      SEND MEAL PLAN
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    color={mealPlan[day]?.status === 'sent' ? 'primary' : 'secondary'}
                    badgeContent={mealPlan[day]?.status === 'sent' ? 'Sent' : 'Not Sent'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for adding/editing meal */}
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
            {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} for {selectedDay}
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
