const express = require('express');
const { createReview, getRoomReviews, deleteReview, updateReview } = require('../controllers/reviews');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getRoomReviews)
  .post(protect, createReview);

router.route('/:reviewId')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;

