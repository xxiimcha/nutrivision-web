require('dotenv').config();
const mongoose = require('mongoose');
const PatientRecord = require('./models/PatientRecord'); // Adjust the path as needed

// MongoDB connection URL (replace with your MongoDB connection string)
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  insertSampleData();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Function to calculate DOB based on age in months
function calculateDobFromAgeInMonths(ageInMonths) {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - ageInMonths);
  return currentDate;
}

// Function to insert sample patient records
async function insertSampleData() {
  try {
    const records = [
      {
        address: '123 Main St',
        guardian: 'John Doe',
        name: 'Child A',
        dob: new Date(2020, 4, 20), // May 20, 2020
        gender: 'Male',
        height: '80 cm',
        weight: '12 kg',
        dateOfWeighing: new Date(),
        ageInMonths: 40,
        weightForAge: 'Normal',
        heightForAge: 'Normal',
        weightForHeight: 'Normal',
        nutritionStatus: 'Normal',
      },
      {
        address: '456 Oak St',
        guardian: 'Jane Doe',
        name: 'Child B',
        dob: new Date(2019, 7, 15), // August 15, 2019
        gender: 'Female',
        height: '75 cm',
        weight: '9 kg',
        dateOfWeighing: new Date(),
        ageInMonths: 55,
        weightForAge: 'Malnourished',
        heightForAge: 'Below Average',
        weightForHeight: 'Underweight',
        nutritionStatus: 'Malnourished',
      },
      {
        address: '789 Pine St',
        guardian: 'Alice Smith',
        name: 'Child C',
        dob: calculateDobFromAgeInMonths(59), // Calculated DOB for 59 months
        gender: 'Male',
        height: '90 cm',
        weight: '25 kg',
        dateOfWeighing: new Date(),
        ageInMonths: 59, // Valid: Exactly 59 months
        weightForAge: 'Overweight',
        heightForAge: 'Normal',
        weightForHeight: 'Overweight',
        nutritionStatus: 'Obese',
      },
    ];

    for (const record of records) {
      const newPatientRecord = new PatientRecord(record);
      await newPatientRecord.save();
      console.log(`Inserted record for ${newPatientRecord.name}`);
    }

    console.log('All records inserted');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error inserting records:', error);
    mongoose.connection.close();
  }
}
