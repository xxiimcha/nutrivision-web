import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const EditFoodModal = ({ open, onClose, food, onSave }) => {
  const [editedFood, setEditedFood] = useState({
    label: '',
    calories: '',
    vitamins: '',
    ingredients: [], // Ensure ingredients is always an array
    ...food, // Spread the incoming food data
  });

  useEffect(() => {
    setEditedFood({
      label: food.label || '', // Default to empty string if undefined
      calories: food.calories || '', // Default to empty string if undefined
      vitamins: food.vitamins || '', // Default to empty string if undefined
      ingredients: food.ingredients || [], // Default to empty array if undefined
    });
  }, [food]);

  const handleChange = (field) => (event) => {
    setEditedFood({ ...editedFood, [field]: event.target.value });
  };

  const handleIngredientChange = (index) => (event) => {
    const updatedIngredients = [...editedFood.ingredients];
    updatedIngredients[index].text = event.target.value; // Adjusting to the text property
    setEditedFood({ ...editedFood, ingredients: updatedIngredients });
  };

  const handleDeleteIngredient = (index) => () => {
    const updatedIngredients = editedFood.ingredients.filter((_, i) => i !== index);
    setEditedFood({ ...editedFood, ingredients: updatedIngredients });
  };

  const handleAddIngredient = () => {
    const newIngredient = { text: '' }; // Initialize with an empty text
    setEditedFood({ ...editedFood, ingredients: [...editedFood.ingredients, newIngredient] });
  };

  const handleSave = () => {
    onSave(editedFood);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Edit Food Recommendation
        </Typography>
        <TextField
          label="Main Dish"
          value={editedFood.label}
          onChange={handleChange('label')}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Calories"
          value={editedFood.calories}
          onChange={handleChange('calories')}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Vitamins"
          value={editedFood.vitamins}
          onChange={handleChange('vitamins')}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle1" gutterBottom>
          Ingredients
        </Typography>
        <Box
          sx={{
            maxHeight: '150px', // Set a fixed height
            overflowY: 'auto', // Enable vertical scrolling
            mb: 2,
          }}
        >
          {editedFood.ingredients.map((ingredient, index) => (
            <Box display="flex" alignItems="center" key={index} sx={{ mb: 1 }}>
              <TextField
                label={`Ingredient ${index + 1}`}
                value={ingredient.text || ''} // Ensure value is a string
                onChange={handleIngredientChange(index)}
                fullWidth
                sx={{ mr: 1 }}
              />
              <Button onClick={handleDeleteIngredient(index)} color="error">
                <DeleteIcon />
              </Button>
            </Box>
          ))}
        </Box>
        <Button onClick={handleAddIngredient} startIcon={<AddCircleIcon />} sx={{ mt: 2 }}>
          Add Ingredient
        </Button>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>
            Save
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditFoodModal;
