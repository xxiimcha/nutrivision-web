const express = require('express');
const Admin = require('../models/Admin');
const generatePassword = require('../utils/generatePassword');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// Create a new admin
router.post('/', async (req, res) => {
  const { firstName, lastName, email, role } = req.body;

  // Generate a password for the new admin
  const password = generatePassword();

  // Create a new admin with the generated password
  const newAdmin = new Admin({ firstName, lastName, email, role, password });

  try {
    await newAdmin.save();

    // Prepare the email content with the registered email
    const subject = 'Your Account Password';
    const text = `Dear ${firstName},\n\nYour admin account has been created successfully.\n\nYour registered email is: ${email}\nHere is your password: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nYour Company`;

    // Send the email with the generated password and registered email
    await sendEmail(email, subject, text);

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Retrieve all admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Retrieve an admin by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an admin by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(id, { firstName, lastName, email }, { new: true });
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an admin's password by ID
router.put('/:id/change-password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if the current password is correct (without bcrypt)
    if (admin.password !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update the password with the new one
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete an admin by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
