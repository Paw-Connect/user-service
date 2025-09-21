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
  try {
    const { userId } = req.params;
    console.log(`Fetching user profile for userId: ${userId}`);
    
    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return user data (excluding password hash)
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles || ['volunteer'],
      skills: user.skills || [],
      points: user.points || 0,
      badges: user.badges || [],
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    console.log('User profile found:', userProfile);
    res.status(200).json(userProfile);
    
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error fetching user profile.' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // 1. Find the user by email
    console.log('Looking for user with email:', email);
    const user = await User.findByEmail(email);
    if (!user) {
      console.log('User not found with email:', email);
      // Use a generic error message for security
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    console.log('User found:', user.id);
    // 2. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    console.log('Login successful for:', email);
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
    console.error('Login error:', err);
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
