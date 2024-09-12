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
  Modal,
  TextField,
  Badge,
  Grid,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Edit, CheckCircle, Send, ArrowBackIos, ArrowForwardIos, ExpandMore } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const MealPlan = () => {
  const { id, week } = useParams(); 
  const [mealPlan, setMealPlan] = useState({});
  const [patientInfo, setPatientInfo] = useState({ patientName: 'N/A', height: 'N/A', weight: 'N/A' });
  const [open, setOpen] = useState(false); 
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [mealDetails, setMealDetails] = useState({ mainDish: '', drinks: '', vitamins: '', ingredients: '' });
  const navigate = useNavigate();

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

  const handleSendMealPlan = async (day) => {
    try {
      const updatedMealPlan = { ...mealPlan };
      updatedMealPlan[day].status = 'sent'; 
    
      await axios.post(`http://localhost:5000/api/meal-plans/${id}/${week}`, updatedMealPlan);
      setMealPlan(updatedMealPlan);
    
      const patientResponse = await axios.get(`http://localhost:5000/api/patient-records/${id}`);
      const userId = patientResponse.data.userId; 
    
      const notification = {
        userId: userId,
        title: `Meal Plan for ${patientInfo.patientName}`,
        message: `The meal plan for ${day}, week of ${week}, has been sent.`,
        reserved_time: new Date().toISOString(),
        post_id: null,
        updated_at: new Date().toISOString(),
      };
    
      await axios.post(`http://localhost:5000/api/notifications`, notification);
    
      console.log('Meal plan sent and notification created successfully.');
    } catch (error) {
      console.error('Error sending meal plan or creating notification:', error);
    }
  };
  
  const handleOpenModal = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setMealDetails(mealPlan[day]?.[mealType] || { mainDish: '', drinks: '', vitamins: '', ingredients: '' });
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setMealDetails({ mainDish: '', drinks: '', vitamins: '', ingredients: '' });
  };

  const handleSaveMeal = async () => {
    const updatedMealPlan = { ...mealPlan };

    if (!updatedMealPlan[selectedDay]) {
      updatedMealPlan[selectedDay] = {
        breakfast: {},
        lunch: {},
        dinner: {},
        status: '', 
      };
    }

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

  const allMealsApproved = (day) => {
    return ['breakfast', 'lunch', 'dinner'].every(
      (mealType) => mealPlan[day]?.[mealType]?.approved
    );
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ color: '#1565C0', fontWeight: 'bold' }}>
        Meal Plan
      </Typography>
      <Box mb={4}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565C0' }}>
          Child's Name: {patientInfo.name}
        </Typography>
        <Typography variant="subtitle1">
          Height: {patientInfo.height} cm, Weight: {patientInfo.weight} kg
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#1565C0' }}>
          Week: {startOfWeek} to {endOfWeek}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={4}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIos />}
          onClick={() => handleWeekChange('previous')}
          sx={{ backgroundColor: '#1565C0' }}
        >
          Previous Week
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIos />}
          onClick={() => handleWeekChange('next')}
          sx={{ backgroundColor: '#1E88E5' }}
        >
          Next Week
        </Button>
      </Box>

      <Grid container spacing={3}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
          <Grid item xs={12} key={day}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`${day}-content`}
                id={`${day}-header`}
              >
                <Typography variant="h6" sx={{ color: '#1565C0', fontWeight: 'bold' }}>
                  {day}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                  <Box key={mealType} mb={3} sx={{ backgroundColor: '#E3F2FD', padding: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1565C0' }}>
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Main dish:</strong> {mealPlan[day]?.[mealType]?.mainDish || 'No meal planned'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Drinks:</strong> {mealPlan[day]?.[mealType]?.drinks || 'No meal planned'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Vitamins:</strong> {mealPlan[day]?.[mealType]?.vitamins || 'No vitamins listed'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Ingredients:</strong> {Array.isArray(mealPlan[day]?.[mealType]?.ingredients) ? mealPlan[day]?.[mealType]?.ingredients.join(', ') : 'No ingredients listed'}
                    </Typography>

                    {mealPlan[day]?.[mealType]?.approved ? (
                      <IconButton sx={{ mt: 1, color: '#1565C0' }}>
                        <CheckCircle />
                      </IconButton>
                    ) : (
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Button
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={() => handleOpenModal(day, mealType)}
                          sx={{ backgroundColor: '#1565C0' }}
                        >
                          {mealPlan[day]?.[mealType]?.mainDish ? 'Edit Meal' : 'Add Meal'}
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApproveMeal(day, mealType)}
                          sx={{ backgroundColor: '#0D47A1' }}
                        >
                          Approve
                        </Button>
                      </Box>
                    )}
                  </Box>
                ))}

                {allMealsApproved(day) && mealPlan[day]?.status !== 'sent' && (
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={() => handleSendMealPlan(day)}
                    sx={{ backgroundColor: '#2196F3' }}
                  >
                    SEND MEAL PLAN
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      <Modal open={open} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #1565C0',
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
          {/* TextArea for ingredients */}
          <TextField
            label="Ingredients"
            value={mealDetails.ingredients}
            onChange={(e) => setMealDetails({ ...mealDetails, ingredients: e.target.value })}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" sx={{ backgroundColor: '#1565C0' }} onClick={handleSaveMeal}>
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
