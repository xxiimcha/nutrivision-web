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
    enum: ['audio', 'video'], 
    required: true 
  },
  roomLink: { 
    type: String, 
    required: true 
  },
  callDuration: { 
    type: Number, 
    default: 0 
  },
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  endedAt: { 
    type: Date 
  }
}, { timestamps: true }); // ✅ Adds createdAt and updatedAt

module.exports = mongoose.model('CallSignal', CallSignalSchema);
