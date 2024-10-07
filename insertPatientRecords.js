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
        address: '123 Main St, Townsville',
        guardian: 'John Doe',
        name: 'Jane Doe',
        dob: new Date('2020-01-15'), // Birthdate example
        gender: 'Female',
        height: '85', // in cm
        weight: '15', // in kg
        dateOfWeighing: new Date(), // Date of weighing today
        ageInMonths: 48, // Example for 4 years old
        weightForAge: 'Normal',
        heightForAge: 'Below Normal',
        weightForHeight: 'Above Normal',
        nutritionStatus: 'Obese', // Example nutrition status
        goalWeight: '16.5', // Example goal weight
        userId: '67032e49adaa1b6b9c86f2fa' // Make sure to replace this with actual user id
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
