const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Notification = require('../models/Notification'); // Import Notification model

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

// Create a new event and add a global notification
router.post('/', async (req, res) => {
  const { title, location, date, time, recipient, status } = req.body;

  try {
    const newEvent = new Event({
      title,
      location,
      date,
      time,
      recipient,
      status: status || 'upcoming', // Default to 'upcoming' if status is not provided
    });

    await newEvent.save();

    // Create a global notification for the event creation
    const notification = new Notification({
      title: 'New Event Created',
      message: `Event "${title}" has been created for ${date} at ${time}.`,
    });

    await notification.save();

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
});

// Route to cancel an event
router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params;

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Event ID' });
  }

  try {
    // Find the event by ID and update its status to 'cancelled'
    const cancelledEvent = await Event.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!cancelledEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Create a global notification for the event cancellation
    const notification = new Notification({
      title: 'Event Canceled',
      message: `Event "${cancelledEvent.title}" scheduled for ${cancelledEvent.date} has been canceled.`,
    });

    await notification.save();

    res.status(200).json({ message: 'Event cancelled', event: cancelledEvent });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling event', error });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Event ID' });
  }

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

// Delete an event and add a global notification
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Create a global notification for the event cancellation
    const notification = new Notification({
      title: 'Event Canceled',
      message: `Event "${deletedEvent.title}" scheduled for ${deletedEvent.date} has been canceled.`,
    });

    await notification.save();

    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
});

module.exports = router;
