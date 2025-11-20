const express = require('express');
const { createReview, getRoomReviews } = require('../controllers/reviews');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getRoomReviews)
  .post(protect, createReview);

module.exports = router;

