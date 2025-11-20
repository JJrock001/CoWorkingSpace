const Review = require('../models/Review');
const Reservation = require('../models/Reservation');

// @desc    Create a review for a room
// @route   POST /api/v1/rooms/:roomId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const roomId = req.params.roomId;
    const userId = req.user.id;

    if (rating === undefined) {
      return res.status(400).json({ success: false, error: 'Please provide a rating between 1 and 5.' });
    }

    // Verify user has at least one reservation for this room
    const hasReservation = await Reservation.exists({ user: userId, roomId });
    if (!hasReservation) {
      return res.status(403).json({ success: false, error: 'You can only review rooms you have reserved.' });
    }

    const review = await Review.create({
      rating,
      comment,
      room: roomId,
      user: userId
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this room.' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get reviews for a room
// @route   GET /api/v1/rooms/:roomId/reviews
// @access  Public
exports.getRoomReviews = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const reviews = await Review.find({ room: roomId })
      .populate('user', 'name')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

