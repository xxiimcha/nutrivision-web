import axios from 'axios';
import pLimit from 'p-limit';

// Edamam API credentials
const APP_ID = '7f569cb9';
const APP_KEY = '1420688ed6fc072eb298963bbce02eff';
const RECIPE_SEARCH_URL = 'https://api.edamam.com/api/recipes/v2';

// Create a limit of 10 requests per minute
const limit = pLimit(10);

// Function to get meal recommendations
const getMealRecommendations = async (mealType, dailyCalories) => {
  try {
    const response = await axios.get(RECIPE_SEARCH_URL, {
      params: {
        type: 'public',
        mealType: mealType,
        app_id: APP_ID,
        app_key: APP_KEY,
        calories: `${dailyCalories / 3}`, // Limit to one meal portion
        from: 0,
        to: 1,
        count: 1,
        random: true,
        excluded: 'Thai' && 'Vietnamese',
        _: Date.now(), // Use current timestamp to ensure different results
      },
    });
    return response.data.hits.map(hit => hit.recipe); // Extract recipe information
  } catch (error) {
    console.error('Error fetching meal recommendations:', error);
    return [];
  }
};

export const generateDailyMealPlan = async (patientRecord) => {
  const mealTypes = ["breakfast", "lunch", "dinner"];
  const dailyMealPlan = {};
  
  // Calculate age in years
  const calculateAge = dob => {
    const dateOfBirth = new Date(dob); // Convert the date string to a Date object
    const diff = Date.now() - dateOfBirth.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  };

  const age = calculateAge(patientRecord.dob);
  // Calculate BMR (Mifflin-St Jeor for females)
  const BMR = 655.1 + (9.563 * patientRecord.weight) + (1.850 * patientRecord.height) - (4.676 * age);
  // Adjust for moderate activity level
  const dailyCalories = Math.round(BMR * 1.55); // You can adjust the activity level as needed
  console.log('daily cal',dailyCalories);

  // Fetch meal recommendations for each meal type, limiting to 3 meals each
  const mealPromises = mealTypes.map(mealType => 
    limit(() => getMealRecommendations(mealType, dailyCalories)) // Pass dailyCalories to the fetching function
  );

  // Wait for all meal recommendations to resolve
  const meals = await Promise.all(mealPromises);

  // Populate dailyMealPlan with a maximum of 3 meals per meal type
  mealTypes.forEach((mealType, index) => {
    dailyMealPlan[mealType] = meals[index].slice(0, 3).map(meal => ({
      label: meal.label || meal.dish, // Use the correct property
      calories: Math.round(meal.calories) || 0, // Round calories and provide a default if missing
      dishType: meal.dishType || mealType.toLowerCase(),
      ingredients: meal.ingredients || [],
    }));
  });

  return dailyMealPlan;
};
