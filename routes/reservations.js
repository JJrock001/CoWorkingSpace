const express = require('express');
const { createReservation, getReservations } = require('../controllers/reservations');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createReservation)
  .get(protect, getReservations);

module.exports = router;
