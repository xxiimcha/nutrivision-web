require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const CallSignal = require('./models/CallSignal');
const Notification = require('./models/Notification');
const Admin = require('./models/Admin');
const logAction = require('./utils/logAction');

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection using environment variables
const mongoUri = process.env.MONGO_URI || 'fallback-mongo-uri';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected successfully.');

  // Check for Super Admin existence
  const superAdminEmail = 'superadmin@gmail.com';
  const superAdmin = await Admin.findOne({ email: superAdminEmail });
  
  if (!superAdmin) {
    // Create Super Admin if not exists
    const superAdminData = new Admin({
      firstName: 'Super',
      lastName: 'Admin',
      email: superAdminEmail,
      password: 'SecurePassword123!', // Hash the password for production
      role: 'Super Admin'
    });

    await superAdminData.save();
    console.log('Super Admin account created with default credentials.');
  } else {
    console.log('Super Admin already exists.');
  }
})
.catch((err) => {
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
const logsRoutes = require('./routes/logs'); 

// Mount the routes
app.use('/api/logs', logsRoutes);
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
    origin: '*', // Update as per your front-end origin
    methods: ['GET', 'POST']
  }
});

// Track connected users
let connectedUsers = {};

// WebRTC signaling with Socket.io
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Save connected users with their userId
  socket.on('register-user', (userId) => {
    if (userId) {
      connectedUsers[userId] = socket.id; // Map userId to socket.id
      console.log(`User ${userId} registered with socket ID: ${socket.id}`);
      console.log('Connected users:', connectedUsers);
    }
  });

  // Handle call initiation
  socket.on('call-user', async ({ callerId, receiverId, callType, roomUrl }) => {
    try {
      // Find the caller's admin info (name)
      const caller = await Admin.findById(callerId).select('firstName lastName');
      if (!caller) {
        console.error('Caller not found');
        return;
      }

      const callSignal = new CallSignal({
        callerId,
        receiverId,
        callType,
        status: 'calling',
        roomUrl, // Add room URL for video/audio call tracking
      });

      if (connectedUsers[receiverId]) {
        io.to(connectedUsers[receiverId]).emit('incoming-call', { callerId, callType, roomUrl });
        console.log(`Call initiated from ${caller.firstName} ${caller.lastName} to ${receiverId} (${callType})`);
      } else {
        // If the user is not online, log as missed call
        console.log(`Receiver with ID ${receiverId} is not connected`);

        // Create a missed call notification
        const missedCallNotification = new Notification({
          userId: receiverId,
          title: 'Missed Call',
          message: `You missed a ${callType} call from ${caller.firstName} ${caller.lastName}`,
        });

        await missedCallNotification.save();
        console.log('Missed call notification saved.');
      }

      // Save the call signal
      await callSignal.save();
      await logAction('CALL_INITIATED', callerId, `Call initiated to ${receiverId} (${callType})`);

    } catch (error) {
      console.error('Error during call initiation:', error);
    }
  });

  // Handle call acceptance
  socket.on('accept-call', async ({ callerId, receiverId }) => {
    try {
      if (connectedUsers[callerId]) {
        io.to(connectedUsers[callerId]).emit('call-accepted');

        // Update call status
        await CallSignal.findOneAndUpdate(
          { callerId, receiverId, status: 'calling' },
          { status: 'accepted' }
        );
        console.log(`Call accepted between ${callerId} and ${receiverId}`);
      }
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  });

  // Handle call decline
  socket.on('decline-call', async ({ callerId, receiverId }) => {
    try {
      if (connectedUsers[callerId]) {
        io.to(connectedUsers[callerId]).emit('call-declined');

        // Update call status
        await CallSignal.findOneAndUpdate(
          { callerId, receiverId, status: 'calling' },
          { status: 'declined' }
        );
        console.log(`Call declined between ${callerId} and ${receiverId}`);
      }
    } catch (error) {
      console.error('Error declining call:', error);
    }
  });

  // Handle call ending
  socket.on('end-call', async ({ callerId, receiverId }) => {
    try {
      if (connectedUsers[callerId]) io.to(connectedUsers[callerId]).emit('call-ended');
      if (connectedUsers[receiverId]) io.to(connectedUsers[receiverId]).emit('call-ended');

      // Update call status
      await CallSignal.findOneAndUpdate(
        { callerId, receiverId, status: { $in: ['accepted', 'calling'] } },
        { status: 'ended' }
      );
      console.log(`Call ended between ${callerId} and ${receiverId}`);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        console.log(`User ${userId} removed from connected users.`);
        break;
      }
    }
  });
});

// Start server on specified port
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
