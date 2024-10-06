const express = require('express');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Log = require('../models/Log');
const sendOtpToEmail = require('../utils/sendOtpToEmail');
const crypto = require('crypto');
const sendPasswordResetEmail = require('../utils/sendPasswordResetEmail');

const router = express.Router();

// Login route
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin) {
      if (password === admin.password) {
        if (admin.role === 'Super Admin') {
          const log = new Log({
            actionType: 'LOGIN',
            user: admin._id,
            description: 'Super Admin logged in.',
          });
          await log.save();

          return res.status(200).send({
            email: admin.email,
            role: admin.role,
            otpRequired: false,
            _id: admin._id,
            name: `${admin.firstName} ${admin.lastName}`,
          });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.otp = otp;
        admin.otpExpires = Date.now() + 300000; // OTP valid for 5 minutes
        await admin.save();

        await sendOtpToEmail(admin.email, otp);

        const log = new Log({
          actionType: 'LOGIN',
          user: admin._id,
          description: `Admin logged in, OTP sent to ${admin.email}`,
        });
        await log.save();

        return res.status(200).send({
          otpRequired: true,
          email: admin.email,
          role: admin.role,
          _id: admin._id,
          name: `${admin.firstName} ${admin.lastName}`,
        });
      } else {
        const log = new Log({
          actionType: 'LOGIN_FAILED',
          user: admin._id,
          description: 'Invalid credentials provided.',
        });
        await log.save();

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

// OTP verification route
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin) {
      if (admin.otp === otp && admin.otpExpires > Date.now()) {
        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        const log = new Log({
          actionType: 'OTP_VERIFIED',
          user: admin._id,
          description: `OTP verified successfully for admin: ${email}`,
        });
        await log.save();

        return res.status(200).send({
          role: admin.role,
          _id: admin._id,
          name: `${admin.firstName} ${admin.lastName}`,
          email: admin.email,
        });
      } else {
        const log = new Log({
          actionType: 'OTP_FAILED',
          user: admin._id,
          description: `Failed OTP verification for admin: ${email}`,
        });
        await log.save();

        return res.status(401).send({ message: 'Invalid or expired OTP' });
      }
    } else {
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
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).send({ message: 'Admin not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    admin.resetToken = resetToken;
    admin.resetTokenExpires = Date.now() + 3600000; // Token valid for 1 hour
    await admin.save();

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(admin.email, resetLink);

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
    const admin = await Admin.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!admin) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }

    admin.password = newPassword;
    admin.resetToken = undefined;
    admin.resetTokenExpires = undefined;
    await admin.save();

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

// Verify password and update user status
router.post('/verify-password-and-update-status', async (req, res) => {
  const { email, password, userId, newStatus } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log('Admin not found');
      return res.status(404).send({ success: false, message: 'Admin not found' });
    }

    if (password !== admin.password) {
      const log = new Log({
        actionType: 'PASSWORD_VERIFICATION_FAILED',
        user: admin._id,
        description: `Password verification failed for admin: ${email}`,
      });
      await log.save();

      console.log('Incorrect password');
      return res.status(401).send({ success: false, message: 'Incorrect password' });
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      const log = new Log({
        actionType: 'USER_UPDATE_FAILED',
        user: admin._id,
        description: `Failed to update user status, user with ID ${userId} not found`,
      });
      await log.save();

      console.log(`User with ID ${userId} not found`);
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    userToUpdate.status = newStatus;
    await userToUpdate.save();

    const log = new Log({
      actionType: 'USER_STATUS_UPDATED',
      user: admin._id,
      description: `User status updated successfully for user ID: ${userId}`,
    });
    await log.save();

    res.status(200).send({ success: true, updatedStatus: newStatus });
  } catch (error) {
    console.error('Error verifying password or updating status:', error);
    res.status(500).send({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
