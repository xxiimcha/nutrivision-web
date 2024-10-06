const express = require('express');
const Log = require('../models/Log'); // Assuming you have a Log model
const router = express.Router();

// Route to fetch all activity logs
router.get('/', async (req, res) => {
  try {
    const logs = await Log.find().populate('user'); // Populate user if it references another model
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch logs by user ID
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const logs = await Log.find({ user: userId }).populate('user');
    if (logs.length === 0) {
      return res.status(404).json({ message: 'No logs found for the specified user' });
    }
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs for user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to delete a log by ID (optional)
router.delete('/:logId', async (req, res) => {
  const { logId } = req.params;
  try {
    const log = await Log.findByIdAndDelete(logId);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.status(200).json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
