const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { verifyToken } = require('../middleware/auth');

// Get all users (for sharing) - with debug logging
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('Fetching users...'); // Debug log
    
    const users = await User.find({}, 'username email');
    console.log('Found users:', users.length); // Debug log
    console.log('Users data:', users); // Debug log
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error); // Debug log
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
