const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const CallSignal = require('./models/CallSignal'); // Import CallSignal model
const Notification = require('./models/Notification'); // Import Notification model
const Admin = require('./models/Admin'); // Import Admin model

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://nutrivision:nutrivision123@nutrivision.04lzv.mongodb.net/nutrivision?retryWrites=true&w=majority&appName=nutrivision', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const adminRoutes = require('./routes/admin');
const loginRoutes = require('./routes/login');
const eventRoutes = require('./routes/events');
const patientRecordsRoutes = require('./routes/patientRecords');
const mealPlanRoutes = require('./routes/mealPlans');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const notificationsRouter = require('./routes/notifications');

app.use('/api/admins', adminRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/patient-records', patientRecordsRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationsRouter);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust origin as needed
    methods: ["GET", "POST"]
  }
});

// Track connected users
let connectedUsers = {};

// WebRTC signaling with Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Save connected users with their userId
  socket.on('register-user', (userId) => {
    if (userId) {
      connectedUsers[userId] = socket.id; // Map userId to socket.id
      console.log(`User ${userId} is registered with socket ID: ${socket.id}`);
      console.log('Current connected users:', connectedUsers);
    }
  });

  // Handle call initiation from web with callType
  socket.on('call-user', async ({ callerId, receiverId, callType }) => {
    console.log('Connected users:', connectedUsers);  // Check if the receiver is connected

    // Find the caller's admin info (name)
    const caller = await Admin.findById(callerId).select('firstName lastName');

    const callSignal = new CallSignal({
      callerId,
      receiverId,
      callType, // Ensure callType (audio or video) is saved
      status: 'calling', // Initial status is "calling"
    });

    if (connectedUsers[receiverId]) {
      // Emit the incoming call event along with the callType
      io.to(connectedUsers[receiverId]).emit('incoming-call', { callerId, callType });
      console.log(`Call initiated from ${caller.firstName} ${caller.lastName} to ${receiverId} as a ${callType} call`);
    } else {
      console.log(`Receiver with ID ${receiverId} is not connected`);
      // Mark as "missed" since the receiver is not connected
      callSignal.status = 'missed';
      console.log(`Missed ${callType} call from ${caller.firstName} ${caller.lastName} to ${receiverId}`);

      // Create a notification for the missed call with the caller's name
      const missedCallNotification = new Notification({
        userId: receiverId,
        title: 'Missed Call',
        message: `You missed a ${callType} call from ${caller.firstName} ${caller.lastName}`,
      });

      try {
        // Save the missed call notification
        await missedCallNotification.save();
        console.log('Missed call notification saved');
      } catch (error) {
        console.error('Error saving missed call notification:', error);
      }
    }

    // Save the call signal (either as "calling" or "missed")
    await callSignal.save();
  });

  // Handle call acceptance
  socket.on('accept-call', async ({ callerId, receiverId }) => {
    if (connectedUsers[callerId]) {
      io.to(connectedUsers[callerId]).emit('call-accepted');

      // Update the call status to "accepted"
      await CallSignal.findOneAndUpdate(
        { callerId, receiverId, status: 'calling' },
        { status: 'accepted' }
      );
      console.log(`Call accepted between ${callerId} and ${receiverId}`);
    }
  });

  // Handle call decline
  socket.on('decline-call', async ({ callerId, receiverId }) => {
    if (connectedUsers[callerId]) {
      io.to(connectedUsers[callerId]).emit('call-declined');

      // Update the call status to "declined"
      await CallSignal.findOneAndUpdate(
        { callerId, receiverId, status: 'calling' },
        { status: 'declined' }
      );
      console.log(`Call declined between ${callerId} and ${receiverId}`);
    }
  });

  // Handle call ending
  socket.on('end-call', async ({ callerId, receiverId }) => {
    // Notify both users that the call has ended
    if (connectedUsers[callerId]) io.to(connectedUsers[callerId]).emit('call-ended');
    if (connectedUsers[receiverId]) io.to(connectedUsers[receiverId]).emit('call-ended');

    // Update the call status to "ended"
    await CallSignal.findOneAndUpdate(
      { callerId, receiverId, status: { $in: ['accepted', 'calling'] } },
      { status: 'ended' }
    );
    console.log(`Call ended between ${callerId} and ${receiverId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove disconnected user from connectedUsers
    for (let userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        console.log(`User ${userId} removed from connected users`);
        break;
      }
    }
  });
});

// Listen on the defined PORT
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
