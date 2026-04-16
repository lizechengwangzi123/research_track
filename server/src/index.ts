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
// Increase limit for Base64 image/file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3001;

app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/nature', natureRoutes);

app.get('/health', (req, res) => {
  res.send({ status: 'ok', timestamp: new Date() });
});

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

  socket.on('send_message', async ({ receiverId, content, fileUrl, fileName, fileType }) => {
    try {
      const message = await prisma.message.create({
        data: { 
          senderId: userId, 
          receiverId, 
          content,
          fileUrl,
          fileName,
          fileType
        }
      });

      io.to(receiverId).emit('receive_message', message);
      
      const unreadCount = await prisma.message.count({
        where: { receiverId, read: false }
      });
      io.to(receiverId).emit('unread_count_update', { totalUnread: unreadCount });
      
      socket.emit('message_sent', message);
    } catch (err) {
      console.error('Database save failed:', err);
      socket.emit('error', { message: 'Message could not be saved' });
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
