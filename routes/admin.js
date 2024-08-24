const express = require('express');
const Admin = require('../models/Admin');
const generatePassword = require('../utils/generatePassword');
const sendEmail = require('../utils/sendEmail'); // Import the sendEmail utility

const router = express.Router();

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

    res.status(201).send(newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).send(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, role } = req.body;

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(id, { firstName, lastName, email, role }, { new: true });
    res.status(200).send(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Admin.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
