const Log = require('../models/Log'); // Import the Log model

/**
 * Logs an action to the database.
 *
 * @param {string} actionType - The type of action (e.g., LOGIN, CREATE, DELETE, etc.).
 * @param {string} userId - The ID of the user who performed the action.
 * @param {string} description - A brief description of the action.
 */
const logAction = async (actionType, userId, description) => {
  try {
    const log = new Log({
      actionType,
      user: userId,
      description,
    });
    await log.save();
    console.log('Action logged:', description);
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

module.exports = logAction;
