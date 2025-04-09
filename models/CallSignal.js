// models/CallSignal.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CallSignalSchema = new Schema({
  callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['calling', 'ringing', 'accepted', 'declined', 'missed', 'ended'], 
    default: 'calling' 
  },
  callType: { 
    type: String, 
    enum: ['audio', 'video'], // Call type can be either 'audio' or 'video'
    required: true 
  },
  roomLink: { 
    type: String, 
    required: true // Room link for the call (video/audio session)
  },
  callDuration: { 
    type: Number, 
    default: 0 // Duration of the call in seconds
  },
  startedAt: { 
    type: Date, 
    default: Date.now // When the call started
  },
  endedAt: { 
    type: Date // When the call ended
  },
  timestamp: { 
    type: Date, 
    default: Date.now // When the record was created
  }
});

module.exports = mongoose.model('CallSignal', CallSignalSchema);
