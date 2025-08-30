const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const cors = require('cors');
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', ({ room, message }) => {
    console.log(`Msg to room ${room}: ${message}`);
    socket.to(room).emit('receive_message', { sender: socket.id, message });
    socket.to(room).emit('delete_message', { sender: socket.id, message });
  });
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
