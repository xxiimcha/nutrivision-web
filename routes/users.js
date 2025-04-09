const express = require('express');
const User = require('../models/User'); // Assuming you have a User model

const router = express.Router();

// Define the route to get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json(users); // Send the users as a JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update user status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // Get the new status from the request
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user); // Return updated user
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

module.exports = router;
