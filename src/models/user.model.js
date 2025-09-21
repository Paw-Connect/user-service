// src/models/user.model.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {};

User.create = async (newUser) => {
  // Hash the password before storing it
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newUser.password, salt);

  const query = `
    INSERT INTO users (name, email, password_hash, phone)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, phone, roles, created_at;
  `;
  const values = [newUser.name, newUser.email, hashedPassword, newUser.phone];

  try {
    const res = await db.query(query, values);
    return res.rows[0];
  } catch (err) {
    throw err;
  }
};

User.findByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  try {
    const res = await db.query(query, [email]);
    return res.rows[0]; // Returns the user object or undefined if not found
  } catch (err) {
    throw err;
  }
};

User.findById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  try {
    const res = await db.query(query, [id]);
    return res.rows[0]; // Returns the user object or undefined if not found
  } catch (err) {
    throw err;
  }
};

User.updateSkills = async (userId, skills) => {
  const query = 'UPDATE users SET skills = $1, updated_at = now() WHERE id = $2 RETURNING id, name, email, skills';
  try {
    const res = await db.query(query, [JSON.stringify(skills), userId]);
    return res.rows[0];
  } catch (err) {
    throw err;
  }
};

User.updateAvailability = async (userId, availability) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Delete existing availability for this user
    await client.query('DELETE FROM volunteer_availability WHERE user_id = $1', [userId]);

    // Insert new availability slots
    const insertPromises = availability.map(slot => {
      const query = `
        INSERT INTO volunteer_availability (user_id, day_of_week, start_time, end_time) 
        VALUES ($1, $2, $3, $4)
      `;
      return client.query(query, [userId, slot.day_of_week, slot.start_time, slot.end_time]);
    });
    await Promise.all(insertPromises);

    await client.query('COMMIT');
    return { message: 'Availability updated successfully' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = User;