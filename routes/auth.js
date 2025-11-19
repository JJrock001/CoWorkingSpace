const express = require('express');
const router = express.Router();
const {register,login,getMe,logout} = require('../controllers/auth');
router.get('/logout', logout);

const {protect} = require('../middleware/auth');

router.get('/me', protect, getMe);
router.post('/register', register);
router.post('/login', login);

module.exports = router;