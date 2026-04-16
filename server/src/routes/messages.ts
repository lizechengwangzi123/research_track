import { Router } from 'express';
import type { Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { io } from '../index.js';

const router = Router();

// Get unread counts for all conversations
router.get('/unread-counts', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const unreadMessages = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        receiverId: userId,
        read: false
      },
      _count: true
    });
    res.json(unreadMessages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread counts' });
  }
});

// Mark messages from a specific friend as read
router.post('/read/:friendId', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const friendId = req.params.friendId as string;

    await prisma.message.updateMany({
      where: {
        senderId: friendId,
        receiverId: userId,
        read: false
      },
      data: { read: true }
    });

    // Notify the user about their new total unread count
    const unreadCount = await prisma.message.count({
      where: { receiverId: userId, read: false }
    });
    
    // We can't easily find the socket from here, but we can emit a global user-specific event 
    // or just assume the client will fetch. Actually, if we emit to a room with the userId, it works!
    io.to(userId).emit('unread_count_update', { totalUnread: unreadCount });

    res.json({ success: true, totalUnread: unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get chat history with a specific friend
router.get('/:friendId', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const friendId = req.params.friendId as string;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
