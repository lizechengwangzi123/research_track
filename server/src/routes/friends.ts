import { Router } from 'express';
import type { Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

// Send friend request
router.post('/request', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { addresseeId } = req.body;
    const requesterId = req.userId!;

    if (requesterId === addresseeId) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend' });
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Friend request already exists or friendship is already established' });
    }

    const friendship = await prisma.friendship.create({
      data: { requesterId, addresseeId, status: 'PENDING' }
    });

    res.status(201).json(friendship);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept friend request
router.put('/accept/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const friendship = await prisma.friendship.findUnique({ where: { id } });
    if (!friendship || friendship.addresseeId !== userId) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });

    res.json(updatedFriendship);
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// List friends
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
        status: 'ACCEPTED'
      },
      include: {
        requester: { select: { id: true, name: true, email: true, papers: true } },
        addressee: { select: { id: true, name: true, email: true, papers: true } }
      }
    });

    const friends = friendships.map((f: any) => f.requesterId === userId ? f.addressee : f.requester);
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Get pending friend requests
router.get('/requests', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const requests = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
        status: 'PENDING'
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        addressee: { select: { id: true, name: true, email: true } }
      }
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

export default router;
