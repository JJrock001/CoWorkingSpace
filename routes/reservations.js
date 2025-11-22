const express = require('express');
const { 
  createReservation, 
  getReservations, 
  getReservation,
  updateReservation, 
  deleteReservation 
} = require('../controllers/reservations');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createReservation)
  .get(protect, getReservations);

router.route('/:id')
  .get(protect, getReservation)
  .put(protect, updateReservation)
  .delete(protect, deleteReservation);

module.exports = router;
