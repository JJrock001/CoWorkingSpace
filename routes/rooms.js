const express = require('express');
const {getRooms, getRoom, createRoom, updateRoom, deleteRoom} = require('../controllers/rooms');
const {protect,authorize} = require('../middleware/auth');
const reviewRouter = require('./reviews');

const router = express.Router();

router.route('/').get(getRooms).post(protect,authorize('admin'), createRoom);
router.use('/:roomId/reviews', reviewRouter);

router.route('/:id').get(getRoom).put(protect,authorize('admin'),updateRoom).delete(protect,authorize('admin'),deleteRoom);

module.exports = router;
