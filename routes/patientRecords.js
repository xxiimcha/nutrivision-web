const express = require('express');
const router = express.Router();
const PatientRecord = require('../models/PatientRecord');

// POST route to create a new patient record
router.post('/add', async (req, res) => {
  try {
    const newRecord = new PatientRecord(req.body);
    await newRecord.save();
    res.status(201).json({ message: 'Patient record added successfully', referenceNumber: newRecord.referenceNumber });
  } catch (error) {
    res.status(400).json({ message: 'Error adding patient record', error });
  }
});

// GET route to fetch all patient records
router.get('/', async (req, res) => {
  try {
    const records = await PatientRecord.find();
    res.status(200).json(records);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching patient records', error });
  }
});

module.exports = router;
