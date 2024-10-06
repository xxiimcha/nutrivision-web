const express = require('express');
const mongoose = require('mongoose'); // Import mongoose
const Admin = require('../models/Admin');
const User = require('../models/User');
const Log = require('../models/Log'); // Import the Log model
const sendOtpToEmail = require('../utils/sendOtpToEmail');
const crypto = require('crypto');
const sendPasswordResetEmail = require('../utils/sendPasswordResetEmail'); // A utility function to send emails

const router = express.Router();

// Login route
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email (including Super Admin)
    const admin = await Admin.findOne({ email });

    if (admin) {
      // Check if the provided password matches the stored plain text password (improve by hashing)
      if (password === admin.password) {
        // If Super Admin logs in
        if (admin.role === 'Super Admin') {
          console.log(`Super Admin logged in with email: ${email}`);

          // Example for logging the Super Admin login action
          try {
            const log = new Log({
              actionType: 'LOGIN',
              user: admin._id,
              description: 'Super Admin logged in.',
            });

            await log.save();
            console.log('Log inserted successfully'); // Log success message
          } catch (error) {
            console.error('Error inserting log:', error); // Log the error message
          }

          return res.status(200).send({
            email: admin.email,
            role: admin.role,
            otpRequired: false,
            _id: admin._id,
            name: `${admin.firstName} ${admin.lastName}`,
          });
        }

        // If regular admin logs in, generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP and expiration in the admin document
        admin.otp = otp;
        admin.otpExpires = Date.now() + 300000; // OTP valid for 5 minutes
        await admin.save();

        // Send OTP to admin's email
        await sendOtpToEmail(admin.email, otp);

        console.log(`Admin logged in with email: ${email}`);
        console.log(`OTP generated and sent to ${admin.email}: ${otp}`);

        // Log the login and OTP generation
        const log = new Log({
          actionType: 'LOGIN',
          user: admin._id,
          description: `Admin logged in, OTP sent to ${admin.email}`,
        });
        await log.save();

        const fullName = `${admin.firstName} ${admin.lastName}`;
        return res.status(200).send({
          otpRequired: true,
          email: admin.email,
          role: admin.role,
          _id: admin._id,
          name: fullName,
        });
      } else {
        console.log('Invalid credentials for email:', email);
        return res.status(401).send({ message: 'Invalid credentials' });
      }
    } else {
      console.log('Admin not found for email:', email);
      return res.status(401).send({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
});

// OTP verification route
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  console.log(`Received OTP for verification: ${otp} for email: ${email}`);

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });

    if (admin) {
      console.log(`Admin found for email: ${email}`);
      console.log(`Stored OTP: ${admin.otp}, Expiry: ${admin.otpExpires}`);
      console.log(`Received OTP: ${otp}`);

      if (admin.otp === otp && admin.otpExpires > Date.now()) {
        // OTP is correct and not expired
        console.log(`OTP matched for admin: ${email}`);
        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        // Log the OTP verification success
        const log = new Log({
          actionType: 'OTP_VERIFIED',
          user: admin._id,
          description: `OTP verified successfully for admin: ${email}`,
        });
        await log.save();

        const fullName = `${admin.firstName} ${admin.lastName}`;
        return res.status(200).send({
          role: admin.role,
          _id: admin._id,
          name: fullName,
          email: admin.email,
        });
      } else {
        console.log(`OTP verification failed for admin: ${email}.`);

        // Log the OTP verification failure
        const log = new Log({
          actionType: 'OTP_FAILED',
          user: admin._id,
          description: `Failed OTP verification for admin: ${email}`,
        });
        await log.save();

        return res.status(401).send({ message: 'Invalid or expired OTP' });
      }
    } else {
      console.log(`No admin found with email: ${email}`);
      return res.status(401).send({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during OTP verification:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).send({ message: 'Admin not found' });
    }

    // Generate a unique token for the password reset
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Save the reset token and its expiration date to the admin document
    admin.resetToken = resetToken;
    admin.resetTokenExpires = Date.now() + 3600000; // Token valid for 1 hour
    await admin.save();

    // Create the reset link
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Send the reset link to the admin's email
    await sendPasswordResetEmail(admin.email, resetLink);

    console.log(`Password reset link generated and sent to ${admin.email}: ${resetLink}`);

    // Log the password reset request
    const log = new Log({
      actionType: 'PASSWORD_RESET_REQUEST',
      user: admin._id,
      description: `Password reset requested for ${admin.email}`,
    });
    await log.save();

    return res.status(200).send({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error during password reset:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find the admin by the reset token
    const admin = await Admin.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!admin) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }

    // Update the password
    admin.password = newPassword;
    admin.resetToken = undefined;
    admin.resetTokenExpires = undefined;
    await admin.save();

    // Log the password reset action
    const log = new Log({
      actionType: 'PASSWORD_RESET',
      user: admin._id,
      description: `Password successfully reset for ${admin.email}`,
    });
    await log.save();

    res.status(200).send({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

router.post('/verify-password-and-update-status', async (req, res) => {
  const { email, password, userId, newStatus } = req.body;

  try {
    // Step 1: Verify the password of the logged-in user (the one performing the action)
    console.log(`Verifying password for email: ${email}`);
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log('Admin not found');
      return res.status(404).send({ success: false, message: 'Admin not found' });
    }

    if (password !== admin.password) { // Add hashing for real use
      console.log('Incorrect password');
      return res.status(401).send({ success: false, message: 'Incorrect password' });
    }

    const userToUpdate = await User.findById(userId); // Assuming User model represents the `users` table
    if (!userToUpdate) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    // Step 3: Update the status of the selected user
    userToUpdate.status = newStatus;
    await userToUpdate.save();

    // Send success response
    res.status(200).send({ success: true, updatedStatus: newStatus });
  } catch (error) {
    console.error('Error verifying password or updating status:', error);
    res.status(500).send({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
