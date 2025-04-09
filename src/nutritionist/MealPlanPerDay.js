import React, { useState, useEffect } from 'react';
import { Paper, Container, Grid, Box, Typography, Button, Breadcrumbs, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditFoodModal from './Modals/EditFoodModal'; // Import the EditFoodModal
import ApproveConfirmationModal from './Modals/ConfirmModal'; // Import the ApproveConfirmationModal
import { generateDailyMealPlan } from '../services/EdamamAPI'; // Adjust the import path as needed
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VerifiedIcon from '@mui/icons-material/Verified';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function MealPlanPerDay() {
  const { id, week,day } = useParams(); // Get the id from the route parameters
  const [patientRecord, setPatientRecord] = useState('');

  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [foodToApprove, setFoodToApprove] = useState(null);
  const [mealTypeToApprove, setMealTypeToApprove] = useState('');
  const [foodRecommendations, setFoodRecommendations] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [mealPlanGenerated, setMealPlanGenerated] = useState(false); // New state to track meal plan generation
  const [ApprovedMeals, setApprovedMeals] = useState([]);
  // Function to generate daily meal plan

  const fetchMealPlan = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meal-plans/${id}/${week}`);
     
      console.log('Approved Meal Plans:', response.data); // Print the approved meal plans to the console
      const filteredMeals = filterApprovedMeals(response.data)


      console.log('filtered: ', filteredMeals);
      console.log('filteredSpecific: ', filteredMeals[day]['breakfast']);

      setApprovedMeals(filteredMeals);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
    }
  };

  // Function to filter meals by day and approved status
const filterApprovedMeals = (data) => {
  const filteredMeals = {};

  // Iterate through each day of the week
  for (const day in data) {
    if (data.hasOwnProperty(day)) {
      const meals = data[day];
      const approvedMeals = {};

      // Iterate through each meal type (breakfast, lunch, dinner)
      for (const mealType in meals) {
        if (meals.hasOwnProperty(mealType)) {
          const meal = meals[mealType];

          // Check if the meal is approved
          if (meal.approved) {
            approvedMeals[mealType] = meal; // Add the approved meal to the list
          }
        }
      }

      // If there are approved meals for the day, add them to the filteredMeals
      if (Object.keys(approvedMeals).length > 0) {
        filteredMeals[day] = approvedMeals;
      }
    }
  }

  return filteredMeals;
};



  const handleGenerateMealPlan = async () => {
    const dailyMealPlan = await generateDailyMealPlan(patientRecord); // Fetch new meal plan
    if (dailyMealPlan) {
      setFoodRecommendations(dailyMealPlan); // Set the recommendations
      setMealPlanGenerated(true); // Update state to indicate a meal plan has been generated

      console.log(foodRecommendations.Breakfast)
    } else {
      setFoodRecommendations({ Breakfast: [], Lunch: [], Dinner: [] }); // Reset if no meal plan is generated
      setMealPlanGenerated(false); // Update state accordingly
      fetchMealPlan();

    }
  };

  useEffect(() => {
    const fetchPatientRecord = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/patient-records/${id}`);
        setPatientRecord(response.data); // Set the patient record in state
     } catch (error) {
        console.error('Error fetching patient record:', error);
      }
    };

    fetchPatientRecord(); // Call the function to fetch the patient record
    fetchMealPlan();
  }, [id]); // Re-run the effect when id changes

  // Render loading or error state if needed
  if (!patientRecord) {
    return <div>Loading...</div>; // Or handle loading state more gracefully
  }

 

  const handleEditClick = (mealType, food) => {
    setSelectedFood({ mealType, ...food });

    setIsModalOpen(true);


  };
  
  console.log('selectedFood before modal:', selectedFood);

  const handleSave = (updatedFood) => {
    if (!selectedFood) return; // Ensure selectedFood is not null
    const { mealType } = selectedFood;
    
    // Find the index of the selected food
    const index = foodRecommendations[mealType].findIndex(item => item.label === selectedFood.label); // Assuming label is unique
    
    // Create a copy of the recommendations
    const updatedRecommendations = { ...foodRecommendations };
    
    // Update the food recommendation at the found index
    if (index !== -1) {
      updatedRecommendations[mealType][index] = updatedFood; // Update the food recommendation
      setFoodRecommendations(updatedRecommendations); // Update state
    }
    
    setSelectedFood(null); // Clear selected food
  };
  

  const handleApproveClick = (mealType, food) => {
    setFoodToApprove(food);
    setMealTypeToApprove(mealType);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    // Implement the logic for confirming the approval here
    console.log(`Approved ${foodToApprove.dish} for ${mealTypeToApprove}`);
    setIsApproveModalOpen(false);
  };

  const handleOpenPhotoModal = (photo) => {
    //setSelectedPhoto(photo);
   // setPhotoOpen(true);
   console.log('Photo is opened')
  };


  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Breadcrumbs and Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => window.history.back()} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography color="text.primary">Food Management</Typography>
          <Typography color="text.secondary">Meal Plan</Typography>
          <Typography color="text.secondary">Meal Plan Per Day</Typography>
        </Breadcrumbs>
      </Box>

      <Button variant="contained" onClick={handleGenerateMealPlan}>
        Generate Meal Plan
      </Button>

      <Typography sx={{ bgcolor: 'rgba(249, 196, 31, 0.2)', color: '#d69a07', p: 1, m: 1 }}>
        Approve one food recommendation for each meal (breakfast, lunch, dinner)
      </Typography>
      <Typography sx={{ bgcolor: 'rgba(249, 196, 31, 0.2)', color: '#d69a07', p: 1, m: 1 }}>
        You can edit any food recommendation to improve meal planning
      </Typography>

      {mealTypes.map((mealType) => (
        <Box key={mealType} sx={{ flex: 1, bgcolor: '#fff', mb: 2, p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {mealType}
          </Typography>

          {ApprovedMeals[day]?.[mealType.toLowerCase()] ? (
          
           
          <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%', height: '400px', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center',}}>
            <Typography variant="h6" sx={{ color: '#2b7dd5', mr: 1 }}><strong>Approved Meal</strong></Typography>
            <VerifiedIcon sx={{color: '#2b7dd5'}}/>
          </Box>
          
          <Box sx={{ display: 'flex',  justifyContent: 'space-between', flexGrow: 1 }}>

            <Box sx={{ width: '30%', mr: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ width: '100px', fontWeight: 'bold' }}>Main dish:</Typography>
                  <Typography variant="body1" sx={{ textAlign: 'right' }}>{ApprovedMeals[day][mealType.toLowerCase()].label}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Calories:</Typography>
                  <Typography variant="body1">{ApprovedMeals[day][mealType.toLowerCase()].calories}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Vitamins:</Typography>
                  <Typography variant="body1">{ApprovedMeals[day][mealType.toLowerCase()].vitamins}</Typography>
                </Box>
              </Box>

              {ApprovedMeals[day]?.[mealType.toLowerCase()]?.photo && (
                      <Button
                        variant="contained"
                        sx={{ mt: 1, backgroundColor: '#1565C0' }}
                        onClick={() => handleOpenPhotoModal(ApprovedMeals[day][mealType.toLowerCase()].photo)}
                      >
                        View Proof of Meal
                      </Button>
                    )}
            </Box>
            
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Ingredients:</Typography>
              <Box sx={{ overflowY: 'auto', maxHeight: '250px', flexGrow: 1 }}> {/* Adjust maxHeight here */}
                <ul style={{ padding: 0, margin: 0 }}>
                  {ApprovedMeals[day][mealType.toLowerCase()].ingredients.map(ingredient => (
                    <li key={ingredient} style={{ listStyleType: 'disc', paddingLeft: '1em' }}>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </Box>
            </Box>
          </Box>
        </Paper>
        
       
          
          ): mealPlanGenerated && foodRecommendations[mealType]?.length > 0 ? (
              <Grid container spacing={3}>
                {foodRecommendations[mealType].map((food, index) => (
                  <Grid item xs={4} key={index}>
                    <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '400px', p: 3 }}>
                      <Typography variant="h6" sx={{color: '#2b7dd5'}}><strong>Food Rec {index + 1}:</strong></Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" sx={{width: '100px', fontWeight: 'bold'}}>Main dish:</Typography>
                        <Typography variant="body1" sx={{textAlign: 'right'}}>{food.label}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold'}}>Calories:</Typography>
                        <Typography variant="body1">{food.calories}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold'}}>Vitamins:</Typography>
                        <Typography variant="body1">{food.vitamins}</Typography>
                      </Box>
                      
                    
                      <Box sx={{ flexGrow: 1, mt: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Ingredients:</Typography>
                        <Box sx={{ overflowY: 'auto', maxHeight: '100px' }}> {/* Set max height for scrolling */}
                          <ul style={{ padding: 0, margin: 0 }}>
                            {food.ingredients.map(ingredient => (
                              <li key={ingredient.text} style={{ listStyleType: 'disc', paddingLeft: '1em' }}>
                                {ingredient.text}
                              </li>
                            ))}
                          </ul>
                        </Box>
                      </Box>

                    
                

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
                        <Button onClick={() => handleEditClick(mealType, food)}>Edit</Button>
                        <Button variant="contained" onClick={() => handleApproveClick(mealType, food)}>Approve</Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
          ) : (
            <Typography>No meal recommendations available for {mealType}. Please generate a meal plan.</Typography>
          )}
        </Box>
      ))}

      {/* Edit Food Modal */}
      <EditFoodModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        food={selectedFood || {}}
        onSave={handleSave}
      />

      {/* Approve Confirmation Modal */}
      <ApproveConfirmationModal
        day={'Monday'}
        open={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        food={foodToApprove}
        mealType={mealTypeToApprove}
        onConfirm={handleConfirmApprove}
        fetchMealPlans={() => fetchMealPlan()}
      />
    </Container>
  );
} 

export default MealPlanPerDay;
