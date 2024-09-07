const express = require('express');
const router = express.Router();

// Handle WebRTC offer
router.post('/offer', (req, res) => {
  const { offer, to } = req.body;
  req.io.to(to).emit('receiveOffer', { offer, from: req.body.from });
  res.status(200).send({ message: 'Offer sent' });
});

// Handle WebRTC answer
router.post('/answer', (req, res) => {
  const { answer, to } = req.body;
  req.io.to(to).emit('receiveAnswer', { answer });
  res.status(200).send({ message: 'Answer sent' });
});

// Handle ICE candidate exchange
router.post('/candidate', (req, res) => {
  const { candidate, to } = req.body;
  req.io.to(to).emit('receiveCandidate', { candidate });
  res.status(200).send({ message: 'Candidate sent' });
});

module.exports = router;
