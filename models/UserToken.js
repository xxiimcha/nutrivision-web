const mongoose = require('mongoose');

const UserTokenSchema = new mongoose.Schema({
  userId: {
    type: String, // Use String if you're storing string-based IDs from Flutter
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('UserToken', UserTokenSchema);
