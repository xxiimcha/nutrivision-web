const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

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
const userRoutes = require('./routes/users'); // Add this line to include the user routes
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
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
