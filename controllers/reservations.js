const Reservation = require('../models/Reservation');

// @desc    Create a reservation (join a room)
// @route   POST /api/v1/reservations
// @access  Private
exports.createReservation = async (req, res) => {
  try {
    const { roomId, date, startTime, endTime } = req.body;
    const user = req.user.id;

    // Validate required fields
    if (!roomId || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: 'Please provide roomId, date, startTime, and endTime' });
    }

    // Normalize date to Date object (set to start of day to ensure consistent comparison)
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    // Check for overlapping reservations
    // Two time slots overlap if: startTime1 < endTime2 AND endTime1 > startTime2
    const conflict = await Reservation.findOne({
      roomId,
      date: {
        $gte: new Date(reservationDate),
        $lt: new Date(reservationDate.getTime() + 24 * 60 * 60 * 1000)
      },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });
    if (conflict) {
      return res.status(409).json({ success: false, error: 'Room is already reserved for this time slot.' });
    }

    // Enforce 3-reservation limit per user per day
    // Use date range to match all reservations on the same day regardless of time
    const startOfDay = new Date(reservationDate);
    const endOfDay = new Date(reservationDate.getTime() + 24 * 60 * 60 * 1000);
    const userReservationsCount = await Reservation.countDocuments({ 
      user, 
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    if (userReservationsCount >= 3) {
      return res.status(403).json({ success: false, error: 'You can only reserve up to 3 rooms per day.' });
    }

    const reservation = await Reservation.create({
      user,
      roomId,
      date: reservationDate,
      startTime,
      endTime
    });
    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all reservations for a user (or all reservations if admin)
// @route   GET /api/v1/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    // If admin, return all reservations; otherwise return only user's reservations
    const query = req.user.role === 'admin' ? {} : { user: req.user.id };
    const reservations = await Reservation.find(query).populate('roomId');
    
    // Only populate user info if admin (to see who made each reservation)
    if (req.user.role === 'admin') {
      await Reservation.populate(reservations, { path: 'user', select: 'name email telephone' });
    }
    
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

    // Admin can view any reservation; regular users can only view their own
    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this reservation' });
    }

    // Only populate user info if admin
    if (req.user.role === 'admin') {
      await Reservation.populate(reservation, { path: 'user', select: 'name email telephone' });
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

    // Admin can update any reservation; regular users can only update their own
    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this reservation' });
    }

    const { roomId, date, startTime, endTime } = req.body;

    // Normalize date if provided
    const updateDate = date ? new Date(date) : reservation.date;
    const updateRoomId = roomId || reservation.roomId;
    const updateStartTime = startTime || reservation.startTime;
    const updateEndTime = endTime || reservation.endTime;

    // Check for overlapping reservations (excluding current reservation)
    // Only check if time-related fields are being updated
    if (roomId || date || startTime || endTime) {
      const conflict = await Reservation.findOne({
        _id: { $ne: req.params.id }, // Exclude current reservation
        roomId: updateRoomId,
        date: updateDate,
        startTime: { $lt: updateEndTime },
        endTime: { $gt: updateStartTime }
      });

      if (conflict) {
        return res.status(409).json({ success: false, error: 'Room is already reserved for this time slot.' });
      }
    }

    // Enforce 3-reservation limit per user per day (if date is being changed)
    // Always check the limit for the reservation owner, regardless of who is making the update
    if (date) {
      const newDate = new Date(date);
      const existingDate = new Date(reservation.date);
      // Compare dates ignoring time (normalize to YYYY-MM-DD)
      const newDateStr = newDate.toISOString().split('T')[0];
      const existingDateStr = existingDate.toISOString().split('T')[0];
      
      if (newDateStr !== existingDateStr) {
        // Check limit for the reservation owner (not the admin making the update)
        const reservationOwner = reservation.user.toString();
        const userReservationsCount = await Reservation.countDocuments({ 
          user: reservationOwner, 
          date: newDate,
          _id: { $ne: req.params.id } // Exclude current reservation
        });
        if (userReservationsCount >= 3) {
          return res.status(403).json({ success: false, error: 'User can only reserve up to 3 rooms per day.' });
        }
      }
    }

    // Prepare update data with normalized date
    const updateData = { ...req.body };
    if (date) {
      updateData.date = new Date(date);
    }

    reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('roomId');

    // Only populate user info if admin
    if (req.user.role === 'admin') {
      await Reservation.populate(reservation, { path: 'user', select: 'name email telephone' });
    }

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

    // Admin can delete any reservation; regular users can only delete their own
    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this reservation' });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};