import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore, CheckCircle, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const MealPlan = () => {
  const { id, week } = useParams(); 
  const [mealPlan, setMealPlan] = useState({});
  const [patientInfo, setPatientInfo] = useState({ patientName: 'N/A', height: 'N/A', weight: 'N/A' });
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
                {
                  // Check if there are any approved meals for the day
                  ['breakfast', 'lunch', 'dinner'].some(mealType => mealPlan[day]?.[mealType]?.approved) ? (
                    ['breakfast', 'lunch', 'dinner'].map((mealType) => (
                      mealPlan[day]?.[mealType]?.approved && ( // Only display approved meals
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

                          <IconButton sx={{ mt: 1, color: '#1565C0' }}>
                            <CheckCircle />
                          </IconButton>
                        </Box>
                      )
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 'bold', marginTop: 2 }}>
                      No meal plan available yet.
                    </Typography>
                  )
                }
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MealPlan;
