import dotenv from 'dotenv';
dotenv.config(); // Must be first

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import prisma from './lib/prisma.js';

import authRoutes from './routes/auth.js';
import paperRoutes from './routes/papers.js';
import friendRoutes from './routes/friends.js';
import messageRoutes from './routes/messages.js';
import natureRoutes from './routes/nature.js';

import { verifyToken } from './utils/auth.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for production stability
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/nature', natureRoutes);

app.get('/health', (req, res) => {
  res.send({ status: 'ok', timestamp: new Date() });
});

// Socket.io connection logic with JWT auth
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  
  const decoded = verifyToken(token);
  if (!decoded) return next(new Error('Invalid token'));
  
  (socket as any).userId = decoded.userId;
  next();
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId;
  socket.join(userId);
  console.log(`User connected: ${userId}`);

  socket.on('send_message', async ({ receiverId, content }) => {
    try {
      const message = await prisma.message.create({
        data: { senderId: userId, receiverId, content }
      });

      // Emit to receiver
      io.to(receiverId).emit('receive_message', message);
      
      // Update unread count for receiver
      const unreadCount = await prisma.message.count({
        where: { receiverId, read: false }
      });
      io.to(receiverId).emit('unread_count_update', { totalUnread: unreadCount });
      
      // Confirm to sender that it's saved
      socket.emit('message_sent', message);
    } catch (err) {
      console.error('Database save failed:', err);
      socket.emit('error', { message: 'Message could not be saved to database' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io, prisma };
