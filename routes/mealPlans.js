const express = require('express');
const mongoose = require('mongoose');
const MealPlan = require('../models/MealPlan');
const predefinedMeals = require('../data/predefinedMeals'); // Import the predefined meals

const router = express.Router();

// Helper function to fetch suggested meals from predefined data
const fetchSuggestedMeals = async (mealType, category = 'both') => {
  try {
    // Filter meals based on mealType (breakfast, lunch, dinner) and category (malnourished, obese, both)
    const meals = predefinedMeals[mealType].filter(meal => meal.category === category || meal.category === 'both');

    // Randomly select a meal from the filtered list
    const randomMeal = meals[Math.floor(Math.random() * meals.length)];

    return {
      mainDish: randomMeal.mainDish,
      drinks: randomMeal.drinks || 'Water',
      vitamins: randomMeal.vitamins || 'Multivitamin',
      ingredients: randomMeal.ingredients,
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
    console.log('Received ID:', id, 'Week:', week);

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
        if (!mealPlan[day]) {
          mealPlan[day] = {};
        }

        ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
          if (!mealPlan[day][mealType]) {
            mealPlan[day][mealType] = {};
          }

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

// Update recommended status
router.patch('/:id/:week/recommend/:day', async (req, res) => {
  try {
    const { id, week, day } = req.params;
    const { recommended } = req.body;

    console.log(`Updating recommended status for patient ${id}, week ${week}, day ${day} to ${recommended}`);

    let mealPlan = await MealPlan.findOne({ patientId: id, week });

    if (!mealPlan) {
      console.error(`Meal plan not found for patient ${id} and week ${week}`);
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    if (!mealPlan[day]) {
      console.error(`Invalid day ${day} in meal plan`);
      return res.status(400).json({ error: 'Invalid day' });
    }

    mealPlan[day].recommended = recommended;

    await mealPlan.save();

    console.log(`Successfully updated recommended status for ${day}`);
    res.json(mealPlan);
  } catch (error) {
    console.error('Error updating recommended status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
