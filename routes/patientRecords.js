const express = require('express');
const router = express.Router();
const PatientRecord = require('../models/PatientRecord');
const WeeklyImprovement = require('../models/WeeklyImprovement');

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

// GET route to fetch a specific patient record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Patient record not found' });
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching patient record', error });
  }
});

// POST route to add an improvement to a specific patient record
// POST route to add an improvement to a specific patient record
router.post('/:id/add-improvement', async (req, res) => {
  try {
    const { id } = req.params;
    const { improvement } = req.body;

    console.log("Received Improvement Data:", { id, improvement });

    // Find the patient record by ID
    const patientRecord = await PatientRecord.findById(id);
    if (!patientRecord) {
      return res.status(404).json({ message: 'Patient record not found' });
    }

    // Create a new weekly improvement entry without calculation
    const weekNumber = (await WeeklyImprovement.countDocuments({ patientId: id })) + 1;
    const newImprovement = new WeeklyImprovement({
      patientId: id,
      weekNumber,
      improvement: parseFloat(improvement),  // Store the improvement value directly
    });

    // Save the weekly improvement to the database
    await newImprovement.save();

    res.status(200).json({ message: 'Improvement added successfully', improvement: newImprovement });
  } catch (error) {
    console.error('Error adding improvement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch the latest improvement for a patient
router.get('/:id/latest-improvement', async (req, res) => {
  try {
    const { id } = req.params;  // Get patient id from URL

    // Find the latest improvement by sorting week numbers in descending order
    const latestImprovement = await WeeklyImprovement.findOne({ patientId: id })
      .sort({ weekNumber: -1 });  // Sort to get the latest improvement

    if (!latestImprovement) {
      return res.status(404).json({ message: 'No improvements found for this patient' });
    }

    res.status(200).json({ improvement: latestImprovement.improvement });
  } catch (error) {
    console.error('Error fetching latest improvement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch all improvements for a specific patient
router.get('/:id/improvements', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all improvements for the given patient ID
    const improvements = await WeeklyImprovement.find({ patientId: id }).sort({ weekNumber: 1 });

    res.status(200).json(improvements);
  } catch (error) {
    console.error('Error fetching improvements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add this to your Express routes file
router.get('/health-data/count', async (req, res) => {
  try {
    // Count malnourished and obese children based on the 'nutritionStatus' field
    const malnourishedCount = await PatientRecord.countDocuments({ nutritionStatus: 'Malnourished' });
    const obeseCount = await PatientRecord.countDocuments({ nutritionStatus: 'Obese' });

    res.status(200).json({ malnourished: malnourishedCount, obese: obeseCount });
  } catch (error) {
    console.error('Error fetching health data:', error);
    res.status(500).json({ message: 'Error fetching health data' });
  }
});

module.exports = router;