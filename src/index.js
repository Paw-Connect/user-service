// src/index.js
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001; // Port for the User Service

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('User Service is up and running!');
});

// Import and use the user routes
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes); // All user routes will be prefixed with /api/users

app.listen(PORT, () => {
  console.log(`User Service listening on port ${PORT}`);
});