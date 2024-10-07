const mongoose = require('mongoose');

const patientRecordSchema = new mongoose.Schema({
  referenceNumber: { type: String, unique: true},
  address: String,
  guardian: String,
  name: String,
  dob: Date,
  gender: String,
  height: String,
  weight: String,
  dateOfWeighing: Date,
  ageInMonths: Number,
  weightForAge: String,
  heightForAge: String,
  weightForHeight: String,
  nutritionStatus: String,
  goalWeight: String, // Added field for goal weight
  userId: String // Removed unique constraint
});

// Function to generate a random alphanumeric string
function generateRandomReferenceNumber() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Middleware to generate unique reference number before saving
patientRecordSchema.pre('save', async function (next) {
  if (this.isNew) {
    let uniqueReference = false;
    while (!uniqueReference) {
      const randomReference = generateRandomReferenceNumber();
      const existingRecord = await this.constructor.findOne({ referenceNumber: randomReference });
      if (!existingRecord) {
        this.referenceNumber = randomReference;
        uniqueReference = true;
      }
    }
  }
  next();
});

module.exports = mongoose.model('PatientRecord', patientRecordSchema);
