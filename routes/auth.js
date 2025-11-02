const express = require('express');
const
{register,login,getMe} = require('../controllers/auth');
const router = express.Router();

const {protect} = require('../middleware/auth');

router.get('/me', protect, getMe);
router.post('/register', register);
router.post('/login', login);

module.exports = router;