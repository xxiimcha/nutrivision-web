const express = require('express');
const Admin = require('../models/Admin');
const generatePassword = require('../utils/generatePassword');

const router = express.Router();

router.post('/', async (req, res) => {
  const { firstName, lastName, email, role } = req.body;
  const password = generatePassword();
  const newAdmin = new Admin({ firstName, lastName, email, role, password });
  await newAdmin.save();
  res.status(201).send(newAdmin);
});

router.get('/', async (req, res) => {
  const admins = await Admin.find();
  res.status(200).send(admins);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, role } = req.body;
  const updatedAdmin = await Admin.findByIdAndUpdate(id, { firstName, lastName, email, role }, { new: true });
  res.status(200).send(updatedAdmin);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Admin.findByIdAndDelete(id);
  res.status(204).send();
});

module.exports = router;
