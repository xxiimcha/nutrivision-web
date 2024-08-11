const express = require('express');
const Admin = require('../models/Admin');

const router = express.Router();

// Default super admin credentials (in a real app, store these securely, not in code)
const superAdminEmail = "superadmin@gmail.com";
const superAdminPassword = "SecurePassword123!";

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  // Check for super admin credentials
  if (email === superAdminEmail) {
    if (password === superAdminPassword) {
      return res.status(200).send({ email, role: 'Super Admin' });
    } else {
      return res.status(401).send({ message: 'Invalid credentials' });
    }
  }

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (admin) {
      // Compare the provided password with the stored plain text password
      if (password === admin.password) {
        return res.status(200).send({ email: admin.email, role: admin.role });
      } else {
        return res.status(401).send({ message: 'Invalid credentials' });
      }
    } else {
      return res.status(401).send({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
