const express = require('express');
const { createReview, getRoomReviews, deleteReview } = require('../controllers/reviews');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getRoomReviews)
  .post(protect, createReview);

router.route('/:reviewId')
  .delete(protect, deleteReview);

module.exports = router;

