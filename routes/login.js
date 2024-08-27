const express = require('express');
const Admin = require('../models/Admin');
const sendOtpToEmail = require('../utils/sendOtpToEmail');
const crypto = require('crypto');
const sendPasswordResetEmail = require('../utils/sendPasswordResetEmail'); // A utility function to send emails

const router = express.Router();

// Default super admin credentials (in a real app, store these securely, not in code)
const superAdminEmail = "superadmin@gmail.com";
const superAdminPassword = "SecurePassword123!";

// Login route
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  // Check for super admin credentials
  if (email === superAdminEmail) {
    if (password === superAdminPassword) {
      // No OTP required for super admin, directly login
      return res.status(200).send({ email, role: 'Super Admin', otpRequired: false, _id: 'super-admin-id', name: 'Super Admin' });
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
        // Generate OTP for the admin
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP and expiration in the admin document
        admin.otp = otp;
        admin.otpExpires = Date.now() + 300000; // OTP valid for 5 minutes
        await admin.save();

        // Send OTP to admin's email
        await sendOtpToEmail(admin.email, otp);

        console.log(`OTP generated and sent to ${admin.email}: ${otp}`);

        const fullName = `${admin.firstName} ${admin.lastName}`;
        return res.status(200).send({ otpRequired: true, email: admin.email, role: admin.role, _id: admin._id, name: fullName });
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
      console.log(`Current Time: ${Date.now()}, OTP Expires At: ${admin.otpExpires}`);
      
      if (admin.otp === otp && admin.otpExpires > Date.now()) {
        // OTP is correct and not expired
        console.log(`OTP matched for admin: ${email}`);
        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        const fullName = `${admin.firstName} ${admin.lastName}`;
        return res.status(200).send({ role: admin.role, _id: admin._id, name: fullName, email: admin.email });
      } else {
        console.log(`OTP verification failed for admin: ${email}.`);
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

    res.status(200).send({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
