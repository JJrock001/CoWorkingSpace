const Reservation = require('../models/Reservation');

// @desc    Create a reservation (join a room)
// @route   POST /api/v1/reservations
// @access  Private
exports.createReservation = async (req, res) => {
  try {
  const { roomId, date, startTime, endTime } = req.body;
    const user = req.user.id;

    // Check for overlapping reservations
    const conflict = await Reservation.findOne({
      roomId,
      date,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });
    if (conflict) {
      return res.status(409).json({ success: false, error: 'Room is already reserved for this time slot.' });
    }

    // Enforce 3-reservation limit per user per day
    const userReservationsCount = await Reservation.countDocuments({ user, date });
    if (userReservationsCount >= 3) {
      return res.status(403).json({ success: false, error: 'You can only reserve up to 3 rooms per day.' });
    }

    const reservation = await Reservation.create({
      user,
      roomId,
      date,
      startTime,
      endTime
    });
    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all reservations for a user
// @route   GET /api/v1/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
  const reservations = await Reservation.find({ user: req.user.id }).populate('roomId');
    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
