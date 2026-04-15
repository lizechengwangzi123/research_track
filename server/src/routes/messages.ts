import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get chat history with a specific friend
router.get('/:friendId', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const { friendId } = req.params;

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
