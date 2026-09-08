require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const householdRoutes = require('./routes/householdRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/workers', workerRoutes); // For public lookups like /:id/ratings
app.use('/api/requests', householdRoutes);
app.use('/api/ratings', ratingRoutes);

// Bind io to app for use in routes
app.set('io', io);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CoDSM API is running' });
});

app.get('/', (req, res) => {
  res.status(200).send('<h1>CoDSM Backend is Running!</h1><p>The server is successfully running. Please use Postman or the frontend app to interact with the API.</p>');
});

app.get('/ready', (req, res) => {
  res.status(200).send('<h1>Ready!</h1><p>The CoDSM API is ready for requests.</p>');
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  // Clients can join a room based on their user ID to receive targeted updates
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room.`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
