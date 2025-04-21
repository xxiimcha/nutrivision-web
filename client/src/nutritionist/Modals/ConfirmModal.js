import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ApproveConfirmationModal = ({ open, onClose, food, mealType, fetchMealPlans  }) => {
  const { id, week, day } = useParams();


  const handleApproveMeal = async () => {
    // Map ingredients array to get only the 'text' values
    const updatedMealPlan = {
      ...food,
      ingredients: food.ingredients.map((ingredient) => ingredient.text),
    };

    console.log('approving meal...', updatedMealPlan);

    try {
      // Convert mealType to lowercase before sending the request
      const mealTypeLowerCase = mealType.toLowerCase();

      await axios.post(`${API_BASE_URL}/meal-plans/${id}/${week}/${day}/${mealTypeLowerCase}`, updatedMealPlan);
      console.log('meal approved...');
      toast.success('Meal approved successfully');
      onClose(); // Close the modal after successful approval

      fetchMealPlans(); // Ensure this function is passed as a prop
    } catch (error) {
      console.error('Error approving meal:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          p: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Confirm Approval
        </Typography>
        {food ? ( // Check if food is defined
          <>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to recommend this meal for {mealType}?
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1"><strong>Main Dish:</strong></Typography>
              <Typography variant="body1">{food.label}</Typography> {/* Assuming 'label' is the main dish */}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1"><strong>Calories:</strong></Typography>
              <Typography variant="body1">{food.calories}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1"><strong>Vitamins:</strong></Typography>
              <Typography variant="body1">{food.vitamins}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1"><strong>Ingredients:</strong></Typography>
              <Typography variant="body1">
                {food.ingredients.length > 0 ? food.ingredients.map((ingredient, index) => (
                  <div key={index}>{ingredient.text}</div> // Assuming each ingredient has a 'text' property
                )) : 'None'}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="error">
            No food selected for approval.
          </Typography>
        )}

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button variant="contained" onClick={handleApproveMeal} sx={{ mr: 1 }} disabled={!food}>
            Yes, Approve
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ApproveConfirmationModal;
