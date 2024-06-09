const express = require('express');
const Admin = require('../models/Admin');

const router = express.Router();

// Default super admin credentials
const superAdminEmail = "superadmin@gmail.com";
const superAdminPassword = "SecurePassword123!";

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  // Check for super admin credentials
  if (email === superAdminEmail && password === superAdminPassword) {
    return res.status(200).send({ email, role: 'Super Admin' });
  }

  // Check for other admin credentials in the database
  const admin = await Admin.findOne({ email, password });
  if (admin) {
    res.status(200).send(admin);
  } else {
    res.status(401).send({ message: 'Invalid credentials' });
  }
});

module.exports = router;
