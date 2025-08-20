const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chat'); // Add this line
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Configure CORS for HTTP requests
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.io setup for real-time collaboration
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware and routes
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes); // Add this line

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    // Document collaboration events (your existing code)
    socket.on('joinDocument', (documentId) => {
        socket.join(documentId);
        console.log(`User joined document ${documentId}`);
    });

    socket.on('documentUpdate', ({ documentId, title, content }) => {
        socket.to(documentId).emit('receiveUpdate', { title, content });
    });

    // NEW CHAT EVENTS
    socket.on('joinChatRoom', ({ roomId, userId, username }) => {
        socket.join(roomId);
        console.log(`${username} joined chat room ${roomId}`);
        
        // Notify others that user joined
        socket.to(roomId).emit('userJoined', {
            message: `${username} joined the chat`,
            userId,
            username,
            timestamp: new Date()
        });
    });

    socket.on('sendChatMessage', async ({ roomId, message, userId, username }) => {
        try {
            // Save message to database
            const Chat = require('./models/Chat');
            const newMessage = new Chat({
                roomId,
                sender: userId,
                message,
                messageType: 'text'
            });
            await newMessage.save();

            // Broadcast message to all users in the room
            const messageData = {
                _id: newMessage._id,
                roomId,
                message,
                sender: { _id: userId, name: username },
                createdAt: newMessage.createdAt,
                messageType: 'text'
            };

            io.to(roomId).emit('receiveChatMessage', messageData);
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    });

    socket.on('leaveChatRoom', ({ roomId, username }) => {
        socket.leave(roomId);
        socket.to(roomId).emit('userLeft', {
            message: `${username} left the chat`,
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
