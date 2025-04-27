const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// 🔥 Lisää tämä register-reitti
router.post('/register', authController.registerUser);

router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.post('/token', authController.refreshAccessToken);

module.exports = router;
