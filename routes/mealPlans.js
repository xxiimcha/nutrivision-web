const express = require('express');
const mongoose = require('mongoose');
const MealPlan = require('../models/MealPlan');

const router = express.Router();

// Get meal plan by patient ID and week
router.get('/:id/:week', async (req, res) => {
  try {
    const { id, week } = req.params;
    console.log('Received ID:', id, 'Week:', week); // Debugging line
    const mealPlan = await MealPlan.findOne({ patientId: id, week });
    if (mealPlan) {
      res.json(mealPlan);
    } else {
      res.status(404).json({ message: 'Meal plan not found' });
    }
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

// Delete a meal plan
router.delete('/:id/:week', async (req, res) => {
  try {
    const { id, week } = req.params;
    await MealPlan.findOneAndDelete({ patientId: id, week });
    res.json({ message: 'Meal plan deleted' });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
