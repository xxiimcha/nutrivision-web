import axios from 'axios';
import pLimit from 'p-limit';

// Spoonacular API credentials
const SPOONACULAR_API_KEY = 'c0f51e7c4f6443509d0a681667c8a655';
const RECIPE_SEARCH_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const RECIPE_INFO_URL = 'https://api.spoonacular.com/recipes/{id}/information'; // Recipe information endpoint

// Create a limit of 10 requests per minute
const limit = pLimit(10);

// Function to get meal recommendations
const getMealRecommendations = async (mealType, dailyCalories) => {
  try {
    const response = await axios.get(RECIPE_SEARCH_URL, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        type: mealType.toLowerCase(), // Meal type should be in lowercase
        maxCalories: Math.round(dailyCalories / 3), // Limit to one meal portion
        number: 3, // Fetch three random meals
        random: true,
      },
    });
    // Return only the recipe IDs for fetching detailed info later
    return response.data.results.map(recipe => recipe.id);
  } catch (error) {
    console.error('Error fetching meal recommendations:', error);
    return [];
  }
};

// Function to get detailed recipe information by ID
const getRecipeInformation = async (id) => {
  try {
    const response = await axios.get(RECIPE_INFO_URL.replace('{id}', id), {
      params: {
        apiKey: SPOONACULAR_API_KEY,
      },
    });
    return response.data; // Return detailed recipe information
  } catch (error) {
    console.error('Error fetching recipe information:', error);
    return null; // Return null if there's an error
  }
};

export const generateDailyMealPlan = async (patientRecord) => {
    const mealTypes = ["Breakfast", "Lunch", "Dinner"];
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
    console.log('daily calories:', dailyCalories);
  
    // Fetch meal recommendations for each meal type, limiting to 3 meals each
    const mealPromises = mealTypes.map(mealType => 
      limit(() => getMealRecommendations(mealType, dailyCalories))
    );
  
    // Wait for all meal IDs to resolve
    const mealIds = await Promise.all(mealPromises);
    
    // Fetch detailed information for each recipe
    const recipePromises = mealIds.flat().map(id => 
      limit(() => getRecipeInformation(id))
    );
  
    // Wait for all recipe details to resolve
    const recipes = await Promise.all(recipePromises);
  
    // Populate dailyMealPlan with a maximum of 3 meals per meal type
    mealTypes.forEach((mealType, index) => {
      // Ensure meal IDs exist for the current meal type
      const mealResults = mealIds[index] || []; // Default to an empty array if undefined
      // Map the recipe details to the dailyMealPlan
      dailyMealPlan[mealType] = mealResults.slice(0, 3).map((id, i) => {
        const recipe = recipes[i]; // Use the corresponding recipe from the recipes array
        if (recipe) {
          return {
            label: recipe.title || 'Unknown', // Fallback to 'Unknown' if title is missing
            calories: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount) || 0, // Safely access calories
            dishType: recipe.dishTypes?.[0] || mealType.toLowerCase(), // Fallback to mealType if dishType is missing
            ingredients: recipe.extendedIngredients?.map(ing => ing.name) || [], // Safely access ingredients
          };
        }
        return null; // Return null if the recipe is not available
      }).filter(meal => meal !== null); // Filter out null values
  
    });
  
    return dailyMealPlan;
  };
  