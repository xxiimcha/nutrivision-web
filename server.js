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
app.use(cors({
  origin: 'http://localhost:3000', // Ensure your front-end domain is allowed
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
      const superAdminData = new Admin({
        firstName: 'Super',
        lastName: 'Admin',
        email: superAdminEmail,
        password: 'SecurePassword123!',
        role: 'Super Admin',
      });
      await superAdminData.save();
      console.log('Super Admin account created.');
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
const callRoutes = require('./routes/calls');

// Mount routes
app.use('/api/logs', logsRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/patient-records', patientRecordsRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationsRouter);
app.use('/api/calls', callRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with proper CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',  // Your front-end domain
    methods: ['GET', 'POST'],
  },
});

// Track connected users
let connectedUsers = {};

// Socket.io handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register the user
  socket.on('register-user', (userId) => {
    if (userId) {
      connectedUsers[userId] = socket.id;
      console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    }
  });

  // Handle call initiation
  socket.on('call-user', async ({ callerId, receiverId, callType, roomUrl }) => {
    try {
      const caller = await Admin.findById(callerId).select('firstName lastName');
      if (!caller) return console.error('Caller not found');

      const callSignal = new CallSignal({
        callerId,
        receiverId,
        callType,
        status: 'calling',
        roomUrl,
      });

      if (connectedUsers[receiverId]) {
        io.to(connectedUsers[receiverId]).emit('incoming-call', { callerId, callType, roomUrl });
      } else {
        const missedCallNotification = new Notification({
          userId: receiverId,
          title: 'Missed Call',
          message: `You missed a ${callType} call from ${caller.firstName} ${caller.lastName}`,
        });
        await missedCallNotification.save();
      }
      await callSignal.save();
      await logAction('CALL_INITIATED', callerId, `Call initiated to ${receiverId} (${callType})`);
    } catch (error) {
      console.error('Error during call initiation:', error);
    }
  });

  socket.on('disconnect', () => {
    for (const userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
