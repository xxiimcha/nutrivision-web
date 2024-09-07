const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io'); // Import Socket.io

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

// WebRTC signaling with Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle offer event
  socket.on('offer', (offer, room) => {
    socket.to(room).emit('offer', offer);
  });

  // Handle answer event
  socket.on('answer', (answer, room) => {
    socket.to(room).emit('answer', answer);
  });

  // Handle ICE candidates
  socket.on('ice-candidate', (candidate, room) => {
    socket.to(room).emit('ice-candidate', candidate);
  });

  // Join a room
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Listen on the defined PORT
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
