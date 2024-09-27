const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const generatePassword = require('../utils/generatePassword');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, `${req.params.id}${path.extname(file.originalname)}`); // Name file based on admin ID
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024, // Limit file size to 1MB
  }
});

// Create a new admin
router.post('/', async (req, res) => {
  const { firstName, lastName, email, role } = req.body;

  // Generate a password for the new admin
  const password = generatePassword();

  // Create a new admin with the generated password (no hashing)
  const newAdmin = new Admin({ firstName, lastName, email, role, password });

  try {
    await newAdmin.save();

    // Prepare the email content with the registered email
    const subject = 'Your Account Password';
    const text = `Dear ${firstName},\n\nYour admin account has been created successfully.\n\nYour registered email is: ${email}\nHere is your password: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nYour Company`;

    // Send the email with the generated password and registered email
    const emailSent = await sendEmail(email, subject, text);

    if (emailSent) {
      console.log(`Email successfully sent to ${email}`);
    } else {
      console.log(`Failed to send email to ${email}`);
    }

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload profile picture
router.post('/:id/upload-profile-picture', async (req, res) => {
  const { profilePicture } = req.body; // Get the Firebase Storage URL from the request body

  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Delete the old profile picture if it exists
    if (admin.profilePicture) {
      // Note: Firebase Storage does not support direct deletion from your server.
      // You'd need to manage it within your Firebase project if required.
    }

    admin.profilePicture = profilePicture; // Save the Firebase Storage URL to the database
    await admin.save();

    res.json({ profilePicture: admin.profilePicture });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
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
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.firstName = firstName;
    admin.lastName = lastName;

    // If email is changed, generate OTP and send it, don't update the email yet
    if (email && email !== admin.email) {
      const otp = crypto.randomBytes(3).toString('hex');
      const otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

      admin.otp = otp;
      admin.otpExpires = otpExpires;

      const subject = 'Email Change Verification';
      const text = `Your OTP code is ${otp}. It is valid for 15 minutes. Please use this code to verify your email change.`;

      const emailSent = await sendEmail(email, subject, text);

      if (emailSent) {
        console.log(`OTP email successfully sent to ${email}`);
      } else {
        console.log(`Failed to send OTP email to ${email}`);
      }

      await admin.save();
      return res.status(200).json({ message: 'OTP sent to new email. Please verify to confirm the email change.' });
    }

    await admin.save();
    res.status(200).json(admin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP for email change
router.put('/:id/verify-otp', async (req, res) => {
  const { id } = req.params;
  const { otp, newEmail } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify OTP
    if (admin.otp !== otp || admin.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update email address
    admin.email = newEmail;
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    res.status(200).json({ message: 'Email address updated successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
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

    // Check if the current password is correct (no hashing)
    if (admin.password !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update the password with the new one (no hashing)
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

    // Delete the associated profile picture if it exists
    if (deletedAdmin.profilePicture) {
      fs.unlink(path.join(__dirname, '..', deletedAdmin.profilePicture), (err) => {
        if (err) {
          console.error('Error deleting profile picture:', err);
        }
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
