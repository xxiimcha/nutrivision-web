const express = require('express');
const Event = require('../models/Event');

const router = express.Router();

// Get all events, optionally filtered by status
router.get('/', async (req, res) => {
  const { status } = req.query; // Allow filtering by status

  try {
    let query = {};
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  const { title, location, date, time, recipient, status } = req.body;

  try {
    const newEvent = new Event({
      title,
      location,
      date,
      time,
      recipient,
      status: status || 'upcoming' // Default to 'upcoming' if status is not provided
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
});

// Update an event, including status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, location, date, time, recipient, status } = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { title, location, date, time, recipient, status }, // Update status as well
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
});

module.exports = router;
