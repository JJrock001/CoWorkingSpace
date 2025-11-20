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

// @desc    Delete a review (admin or review owner)
// @route   DELETE /api/v1/rooms/:roomId/reviews/:reviewId
// @access  Private (admin or review creator)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    // Only admin or review creator can delete
    if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this review' });
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a review (admin or review owner)
// @route   PUT /api/v1/rooms/:roomId/reviews/:reviewId
// @access  Private (admin or review creator)
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    // Only admin or review creator can update
    if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this review' });
    }
    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

