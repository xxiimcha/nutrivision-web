require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin'); // Firebase Admin SDK

// ✅ DECODE base64 and initialize Firebase Admin
const base64Key = process.env.FIREBASE_BASE64;
if (!base64Key) {
  throw new Error('FIREBASE_BASE64 is missing in your environment variables');
}
const serviceAccount = JSON.parse(Buffer.from(base64Key, 'base64').toString('utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Models & Utils
const CallSignal = require('./models/CallSignal');
const Notification = require('./models/Notification');
const Admin = require('./models/Admin');
const logAction = require('./utils/logAction');

const app = express();
const PORT = process.env.PORT || 5003;
const allowedOrigins = [
  'https://nutrivision-orcin.vercel.app',
  'http://localhost:3000'
];

app.use(bodyParser.json());
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'fallback-mongo-uri';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected successfully.');

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
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/logs', require('./routes/logs'));
app.use('/api/admins', require('./routes/admin'));
app.use('/api/login', require('./routes/login'));
app.use('/api/events', require('./routes/events'));
app.use('/api/patient-records', require('./routes/patientRecords'));
app.use('/api/meal-plans', require('./routes/mealPlans'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/calls', require('./routes/calls'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'client', 'build');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }
}

// Socket setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

let connectedUsers = {}; // userId -> socketId
let fcmTokens = {};      // userId -> FCM Token

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('register-user', ({ userId, fcmToken }) => {
    if (userId) {
      connectedUsers[userId] = socket.id;
      if (fcmToken) {
        fcmTokens[userId] = fcmToken;
        console.log(`FCM token registered for ${userId}`);
      }
      console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    }
  });

  socket.on('call-user', async ({ callerId, receiverId, callType, roomUrl }) => {
    try {
      const caller = await Admin.findById(callerId).select('firstName lastName');
      if (!caller) return console.error('Caller not found');

      const callSignal = new CallSignal({ callerId, receiverId, callType, status: 'calling', roomUrl });

      if (connectedUsers[receiverId]) {
        io.to(connectedUsers[receiverId]).emit('incoming-call', { callerId, callType, roomUrl });
      } else {
        if (fcmTokens[receiverId]) {
          await admin.messaging().send({
            token: fcmTokens[receiverId],
            notification: {
              title: 'Incoming Call',
              body: `Call from ${caller.firstName} ${caller.lastName}`,
            },
            data: {
              callerId,
              callType,
              roomUrl,
              type: 'incoming-call',
            },
          });
          console.log(`Push notification sent to ${receiverId}`);
        }

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

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
