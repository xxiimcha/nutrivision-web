const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/nutrivision', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
const adminRoutes = require('./routes/admin');
const loginRoutes = require('./routes/login');

app.use('/api/admins', adminRoutes);
app.use('/api/login', loginRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
