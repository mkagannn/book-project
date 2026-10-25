const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser, adminMiddleware } = require('../middleware/authorization');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', authenticateUser, adminMiddleware, userController.getAllUsers);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router;