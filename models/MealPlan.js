const mongoose = require('mongoose');

// Define the schema for a meal
const mealSchema = new mongoose.Schema({
  mainDish: { type: String, default: '' },
  drinks: { type: String, default: '' },
  vitamins: { type: String, default: '' },
  ingredients: {
    type: [{ type: String }],
    validate: {
      validator: function(val) {
        return val.length > 0;
      },
      message: 'A meal must have at least one ingredient.',
    },  // Array of ingredients with validation
  },
  photo: { type: String, default: '' },  // URL or path to the photo
  status: { type: String, enum: ['done', 'in-progress', ''], default: '' },
  approved: { type: Boolean, default: false },  // Add this field to track approval status
});

// Define the schema for a day
const daySchema = new mongoose.Schema({
  breakfast: mealSchema,
  lunch: mealSchema,
  dinner: mealSchema,
  recommended: { type: Boolean, default: false },
  status: { type: String, enum: ['done', 'in-progress', ''], default: '' },  // Status per day
});

// Define the schema for the meal plan
const mealPlanSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  week: { type: String, required: true }, // e.g., '2024-08-18'
  Monday: { type: daySchema, default: () => ({}) },
  Tuesday: { type: daySchema, default: () => ({}) },
  Wednesday: { type: daySchema, default: () => ({}) },
  Thursday: { type: daySchema, default: () => ({}) },
  Friday: { type: daySchema, default: () => ({}) },
  Saturday: { type: daySchema, default: () => ({}) },
  Sunday: { type: daySchema, default: () => ({}) },
}, {
  timestamps: true,
});

// Export the meal plan model
module.exports = mongoose.model('MealPlan', mealPlanSchema);
