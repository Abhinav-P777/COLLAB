const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const userRoutes = require('./routes/users');

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

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);

// Store online users per document
const onlineUsers = new Map(); // documentId -> Set of users

io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    // User joins document
    socket.on('joinDocument', ({ documentId, userId, username }) => {
        socket.join(documentId);
        socket.documentId = documentId;
        socket.userId = userId;
        socket.username = username;
        
        console.log(`✅ User ${username} (${userId}) joined document ${documentId}`);
        
        // Add user to online users
        if (!onlineUsers.has(documentId)) {
            onlineUsers.set(documentId, new Map());
        }
        
        onlineUsers.get(documentId).set(socket.id, {
            userId,
            username: username || 'Anonymous',
            socketId: socket.id
        });

        // Broadcast updated online users to all clients in the document
        const docUsers = Array.from(onlineUsers.get(documentId).values());
        io.to(documentId).emit('onlineUsers', docUsers);
        
        console.log(`📊 Online users in ${documentId}: ${docUsers.length}`);
    });

    // 🔥 FIXED: Document Updates with userId
// Replace this in your server.js:
socket.on('documentUpdate', ({ documentId, title, content, userId }) => {
    console.log('📝 Server received document update:', { 
        documentId, 
        titleLength: title.length, 
        contentLength: content.length,
        requestUserId: userId,  // ← User ID from request
        socketUserId: socket.userId  // ← User ID from socket (might be undefined)
    });
    
    // Use userId from request (more reliable)
    const actualUserId = userId;
    
    if (!actualUserId) {
        console.error('⚠️ ERROR: No userId provided in update request!');
        return; // Don't broadcast if no userId
    }
    
    // Broadcast to all other users in the room
    socket.to(documentId).emit('receiveUpdate', { 
        title, 
        content, 
        userId: actualUserId  // ← Use userId from request
    });
    
    console.log('📤 Broadcasted update with userId:', actualUserId);
});


    // User leaves document or disconnects
    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
        
        if (socket.documentId && onlineUsers.has(socket.documentId)) {
            const docUsers = onlineUsers.get(socket.documentId);
            docUsers.delete(socket.id);
            
            // If no users left, remove the document entry
            if (docUsers.size === 0) {
                onlineUsers.delete(socket.documentId);
            } else {
                // Broadcast updated online users
                const remainingUsers = Array.from(docUsers.values());
                io.to(socket.documentId).emit('onlineUsers', remainingUsers);
            }
            
            console.log(`📊 User left document ${socket.documentId}`);
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
