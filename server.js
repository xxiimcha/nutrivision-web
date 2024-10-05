require('dotenv').config();
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
app.use(cors({
  origin: process.env.REACT_APP_API_BASE_URL || "*",  // Restrict CORS to your frontend URL in production
  methods: ["GET", "POST"]
}));

// MongoDB connection using environment variables
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Serve static files from 'uploads' folder
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

// Serve React static assets if in production
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
    origin: process.env.CLIENT_URL || "*", // Restrict CORS to your frontend URL in production
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

  // Handle call initiation
  socket.on('call-user', async ({ callerId, receiverId, callType }) => {
    console.log('Connected users:', connectedUsers);

    const caller = await Admin.findById(callerId).select('firstName lastName');
    const callSignal = new CallSignal({
      callerId,
      receiverId,
      callType,
      status: 'calling',
    });

    if (connectedUsers[receiverId]) {
      io.to(connectedUsers[receiverId]).emit('incoming-call', { callerId, callType });
      console.log(`Call initiated from ${caller.firstName} ${caller.lastName} to ${receiverId} as a ${callType} call`);
    } else {
      console.log(`Receiver with ID ${receiverId} is not connected`);
      callSignal.status = 'missed';

      const missedCallNotification = new Notification({
        userId: receiverId,
        title: 'Missed Call',
        message: `You missed a ${callType} call from ${caller.firstName} ${caller.lastName}`,
      });

      try {
        await missedCallNotification.save();
        console.log('Missed call notification saved');
      } catch (error) {
        console.error('Error saving missed call notification:', error);
      }
    }

    await callSignal.save();
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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
