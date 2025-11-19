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
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
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

// @desc    Get single reservation by ID
// @route   GET /api/v1/reservations/:id
// @access  Private
exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('roomId');
    
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    // Make sure reservation belongs to the user
    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this reservation' });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a reservation
// @route   PUT /api/v1/reservations/:id
// @access  Private
exports.updateReservation = async (req, res) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    // Make sure reservation belongs to the user
    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this reservation' });
    }

    const { roomId, date, startTime, endTime } = req.body;

    // Check for overlapping reservations (excluding current reservation)
    if (roomId || date || startTime || endTime) {
      const conflict = await Reservation.findOne({
        _id: { $ne: req.params.id }, // Exclude current reservation
        roomId: roomId || reservation.roomId,
        date: date || reservation.date,
        startTime: { $lt: endTime || reservation.endTime },
        endTime: { $gt: startTime || reservation.startTime }
      });

      if (conflict) {
        return res.status(409).json({ success: false, error: 'Room is already reserved for this time slot.' });
      }
    }

    // Enforce 3-reservation limit per user per day (if date is being changed)
    if (date) {
      const newDate = new Date(date);
      const existingDate = new Date(reservation.date);
      // Compare dates ignoring time
      const newDateStr = newDate.toISOString().split('T')[0];
      const existingDateStr = existingDate.toISOString().split('T')[0];
      
      if (newDateStr !== existingDateStr) {
        const userReservationsCount = await Reservation.countDocuments({ 
          user: req.user.id, 
          date: newDate,
          _id: { $ne: req.params.id } // Exclude current reservation
        });
        if (userReservationsCount >= 3) {
          return res.status(403).json({ success: false, error: 'You can only reserve up to 3 rooms per day.' });
        }
      }
    }

    reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('roomId');

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a reservation
// @route   DELETE /api/v1/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    // Make sure reservation belongs to the user
    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this reservation' });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};