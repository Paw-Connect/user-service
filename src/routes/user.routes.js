// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Create a new user
router.post('/', userController.registerUser);

// --- ADD THE NEW MOCK ROUTES HERE ---

// GET /api/users/profiles-for-matching (for K)
router.get('/profiles-for-matching', userController.getProfilesForMatching);

// --- ADD THE LOGIN ROUTE ---
router.post('/login', userController.loginUser);

// --- ADD THE UPDATE ROUTES ---
router.patch('/:userId/skills', userController.updateUserSkills);
router.patch('/:userId/availability', userController.updateUserAvailability);

// GET /api/users/:userId (for R)
// This route must be last, as it is a dynamic route
router.get('/:userId', userController.getUserById);

module.exports = router;
