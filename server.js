const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // Allow all origins (for testing)
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 5000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// CORS middleware
app.use(cors());

// Store a mapping of user ID to socket ID
let users = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Event: User joins with an ID (simulating login)
    socket.on('join', (userId) => {
        users[userId] = socket.id; // Store the user's socket ID
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    });

    // Listen for messages from a client
    socket.on('sendMessage', ({ receiverId, message }) => {
        const receiverSocketId = users[receiverId];

        if (receiverSocketId) {
            console.log(`Message from ${socket.id} to ${receiverSocketId}: ${message}`);
            // Emit the message to the intended recipient
            io.to(receiverSocketId).emit('receiveMessage', {
                senderId: socket.id,
                message: message,
            });
        } else {
            console.log(`Receiver ${receiverId} not found or not connected.`);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const userId = Object.keys(users).find((key) => users[key] === socket.id);
        if (userId) {
            delete users[userId];
            console.log(`User ${userId} disconnected.`);
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
