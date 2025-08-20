const express = require('express');
const Chat = require('../models/Chat');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all chat messages for a room
router.get('/room/:roomId', verifyToken, async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Chat.find({ roomId })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 })
            .limit(100); // Limit to last 100 messages
        
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new chat room
router.post('/room', verifyToken, async (req, res) => {
    try {
        const { roomName, description } = req.body;
        
        // For now, we'll just return success - you can create a Room model later if needed
        res.json({ 
            roomId: roomName.toLowerCase().replace(/\s+/g, '-'),
            message: 'Room created successfully' 
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
