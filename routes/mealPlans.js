const express = require('express');
const mongoose = require('mongoose');
const MealPlan = require('../models/MealPlan');
const predefinedMeals = require('../data/predefinedMeals'); // Import the predefined meals
const Notification = require('../models/Notification'); // Make sure Notification is imported if not yet
const axios = require('axios');
const UserToken = require('../models/UserToken');
const PatientRecord = require('../models/PatientRecord');

const { GoogleAuth } = require('google-auth-library');
const serviceAccount = require('../config/firebase-config.json');

const PROJECT_ID = 'nutrivision-8876b';
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

  console.log('inside router..')
  try {
    const { id, week } = req.params;
    const mealPlanData = req.body;

    console.log('id: ', id);
    console.log('weel: ', week);
    console.log('mealPlanData: ', mealPlanData);


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

// Small helper function
async function sendPushNotification(userId, title, message) {
  try {
    const userToken = await UserToken.findOne({ userId });

    if (!userToken) {
      console.log('No FCM token found for this user.');
      return;
    }

    const payload = {
      to: userToken.token,
      notification: {
        title,
        body: message,
      },
    };

    await axios.post('https://fcm.googleapis.com/fcm/send', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${process.env.FCM_SERVER_KEY}`,
      },
    });

    console.log('✅ Push notification sent successfully');
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
}

async function createNotificationAndSendPush(userId, title, message) {
  try {
    // Save Notification in DB
    const notification = new Notification({
      userId,
      title,
      message,
    });
    await notification.save();
    console.log('✅ Notification saved to database');

    // Fetch the token
    const userToken = await UserToken.findOne({ userId });
    if (!userToken) {
      console.log('⚠️ No FCM token found for this user.');
      return;
    }

    // Authenticate using service account
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const accessToken = await auth.getAccessToken();

    // Construct FCM v1 message payload
    const fcmMessage = {
      message: {
        token: userToken.token,
        notification: {
          title,
          body: message,
        },
      },
    };

    const response = await axios.post(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      fcmMessage,
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Push notification sent successfully via FCM v1:', response.data);
  } catch (error) {
    console.error('❌ Error sending notification and push:', error.response?.data || error.message);
  }
}

router.post('/:id/:week/:day/:mealType', async (req, res) => {
  try {
    const { id, week, day, mealType } = req.params;
    const mealData = req.body;

    console.log('ID:', id);
    console.log('Week:', week);
    console.log('Day:', day);
    console.log('Meal Type:', mealType);
    console.log('Meal Data:', mealData);

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const validMealTypes = ['breakfast', 'lunch', 'dinner'];

    if (!validDays.includes(day) || !validMealTypes.includes(mealType)) {
      return res.status(400).json({ error: 'Invalid day or mealType' });
    }

    // Find the PatientRecord by patient _id
    const patientRecord = await PatientRecord.findById(id);

    if (!patientRecord) {
      return res.status(404).json({ error: 'Patient record not found' });
    }

    const userId = patientRecord.userId;

    let mealPlan = await MealPlan.findOne({ patientId: id, week });

    const validStatuses = ['done', 'in-progress', ''];
    if (!validStatuses.includes(mealData.status)) {
      mealData.status = 'in-progress';
    }

    if (mealData.approved === undefined) {
      mealData.approved = true;
    }

    if (mealPlan) {
      mealPlan[day][mealType] = mealData;
    } else {
      mealPlan = new MealPlan({
        patientId: id,
        week,
        [day]: {
          [mealType]: mealData,
        },
      });
    }

    await mealPlan.save();

    // 🔥 ONE clean call for both saving notification + sending push
    const notificationMessage = `Your meal plan for ${day} (${mealType}) has been updated.`;
    await createNotificationAndSendPush(userId, 'Meal Plan Updated', notificationMessage);

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
