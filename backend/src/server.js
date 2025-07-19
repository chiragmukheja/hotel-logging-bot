const http = require('http');
const app = require('./app'); // your existing Express app
const { Server } = require('socket.io');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

// Attach the io instance to app so controllers can access it
app.set('io', io);

// Handle socket connection
io.on('connection', (socket) => {
  console.log('🟢 New WebSocket connection:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
