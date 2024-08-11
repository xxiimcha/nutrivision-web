const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Define the schema for a patient record
const patientRecordSchema = new mongoose.Schema({
  referenceNumber: {
    type: String,
    unique: true,
    default: () => uuidv4(),  // Automatically generate a UUID
  },
  address: {
    type: String,
    required: true,
  },
  parentName: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  weight: {
    type: String,
    required: true,
  },
  dateOfWeighing: {
    type: Date,
    required: true,
  },
  ageInMonths: {
    type: Number,
    required: true,
  },
  weightForAge: {
    type: String,
    required: true,
  },
  heightForAge: {
    type: String,
    required: true,
  },
  weightForHeight: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PatientRecord', patientRecordSchema);
