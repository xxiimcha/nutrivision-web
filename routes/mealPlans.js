const express = require('express');
const mongoose = require('mongoose');
const MealPlan = require('../models/MealPlan');
const axios = require('axios');

const router = express.Router();

// Directly include the provided API key
const SPOONACULAR_API_KEY = '94c29ef0d6a5411cab289e187743f31d';

// Helper function to fetch suggested meals
const fetchSuggestedMeals = async (mealType) => {
  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/random`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,  // Using the API key directly in the code
        number: 1,
        tags: mealType
      }
    });
    const recipe = response.data.recipes[0];
    return {
      mainDish: recipe.title,
      drinks: recipe.drinks ? recipe.drinks : 'Water',
      vitamins: recipe.vitamins ? recipe.vitamins : 'Multivitamin',
    };
  } catch (error) {
    console.error('Error fetching suggested meal:', error);
    return {
      mainDish: 'Default Meal',
      drinks: 'Water',
      vitamins: 'Multivitamin',
    };
  }
};

// Get meal plan by patient ID and week
router.get('/:id/:week', async (req, res) => {
  try {
    const { id, week } = req.params;
    console.log('Received ID:', id, 'Week:', week); // Debugging line

    let mealPlan = await MealPlan.findOne({ patientId: id, week });
    if (!mealPlan) {
      // If meal plan does not exist, create one with suggestions
      mealPlan = new MealPlan({
        patientId: id,
        week,
        Monday: {
          breakfast: await fetchSuggestedMeals('breakfast'),
          lunch: await fetchSuggestedMeals('lunch'),
          dinner: await fetchSuggestedMeals('dinner'),
        },
        Tuesday: {
          breakfast: await fetchSuggestedMeals('breakfast'),
          lunch: await fetchSuggestedMeals('lunch'),
          dinner: await fetchSuggestedMeals('dinner'),
        },
        Wednesday: {
          breakfast: await fetchSuggestedMeals('breakfast'),
          lunch: await fetchSuggestedMeals('lunch'),
          dinner: await fetchSuggestedMeals('dinner'),
        },
        Thursday: {
          breakfast: await fetchSuggestedMeals('breakfast'),
          lunch: await fetchSuggestedMeals('lunch'),
          dinner: await fetchSuggestedMeals('dinner'),
        },
        Friday: {
          breakfast: await fetchSuggestedMeals('breakfast'),
          lunch: await fetchSuggestedMeals('lunch'),
          dinner: await fetchSuggestedMeals('dinner'),
        },
        Saturday: {
          breakfast: await fetchSuggestedMeals('breakfast'),
          lunch: await fetchSuggestedMeals('lunch'),
          dinner: await fetchSuggestedMeals('dinner'),
        },
        Sunday: {
          breakfast: await fetchSuggestedMeals('breakfast'),
          lunch: await fetchSuggestedMeals('lunch'),
          dinner: await fetchSuggestedMeals('dinner'),
        },
      });
      await mealPlan.save();
    }

    res.json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update meal plan
router.post('/:id/:week', async (req, res) => {
  try {
    const { id, week } = req.params;
    const mealPlanData = req.body;

    let mealPlan = await MealPlan.findOne({ patientId: id, week });
    if (mealPlan) {
      // Ensure we do not overwrite approved meals
      Object.keys(mealPlanData).forEach((day) => {
        ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
          if (mealPlan[day][mealType]?.approved) {
            // If the meal is approved, do not overwrite it
            mealPlanData[day][mealType] = mealPlan[day][mealType];
          }
        });
      });

      // Update the existing meal plan
      mealPlan = await MealPlan.findByIdAndUpdate(mealPlan._id, mealPlanData, { new: true });
    } else {
      // Create a new meal plan
      mealPlan = new MealPlan({
        patientId: id,
        week,
        ...mealPlanData,
      });
      await mealPlan.save();
    }

    res.json(mealPlan);
  } catch (error) {
    console.error('Error saving meal plan:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
