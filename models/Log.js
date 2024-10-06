const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // Make sure this is correct if you are storing ObjectId
    ref: 'Admin',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
