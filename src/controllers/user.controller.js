// src/controllers/user.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
  try {
    // Basic validation
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const newUser = { name, email, password, phone };
    const createdUser = await User.create(newUser);

    // Don't send the password back, even the hash
    const { password_hash, ...userWithoutPassword } = createdUser;
    
    res.status(201).json(userWithoutPassword);

  } catch (err) {
    // Handle potential duplicate email error
    if (err.code === '23505') { // PostgreSQL unique violation error code
        return res.status(409).json({ message: 'Email already exists.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error during user registration.' });
  }
};

// MOCK ENDPOINT FOR K (AI Service)
exports.getProfilesForMatching = async (req, res) => {
  console.log('Serving mock profiles for AI Service...');
  const mockProfiles = [
    {
      userId: "u-abc-123",
      skills: ["dog_walking", "medical_care_basic"],
      location: { lat: 40.801, lng: -124.164 },
      availability: [{ day: 6, start_time: "09:00", end_time: "13:00" }] // Saturday
    },
    {
      userId: "u-def-456",
      skills: ["social_media", "event_planning"],
      location: { lat: 40.866, lng: -124.082 },
      availability: [{ day: 6, start_time: "12:00", end_time: "17:00" }] // Saturday
    }
  ];
  res.status(200).json(mockProfiles);
};

// MOCK ENDPOINT FOR R (Task Service)
exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  console.log(`Serving mock profile for userId: ${userId}`);
  const mockUser = {
      userId: userId,
      name: "Mock Volunteer",
      email: "mock@volunteer.org",
      phone: "555-555-5555"
  };
  res.status(200).json(mockUser);
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // 1. Find the user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Use a generic error message for security
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 2. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. If credentials are correct, create a JWT
    const payload = {
      id: user.id,
      roles: user.roles, // Include roles for authorization later
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    res.status(200).json({
      accessToken: accessToken,
      userId: user.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.updateUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    const { skills } = req.body; // Expect an array of strings, e.g., ["dog_walking", "cat_care"]

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills must be an array.' });
    }

    await User.updateSkills(userId, skills);
    res.status(200).json({ message: 'Skills updated successfully.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating skills.' });
  }
};

exports.updateUserAvailability = async (req, res) => {
  try {
    const { userId } = req.params;
    const { availability } = req.body; // Expect an array of objects

    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'Availability must be an array.' });
    }

    await User.updateAvailability(userId, availability);
    res.status(200).json({ message: 'Availability updated successfully.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating availability.' });
  }
};
