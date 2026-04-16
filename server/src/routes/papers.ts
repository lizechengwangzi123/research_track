import { Router } from 'express';
import type { Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

// Create paper
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { title, abstract, status, journalName, link, authors, submittedAt, order } = req.body;
    const userId = req.userId!;

    const paper = await prisma.paper.create({
      data: { 
        title, 
        abstract, 
        status, 
        journalName, 
        link, 
        authors, 
        submittedAt: submittedAt ? new Date(submittedAt) : null,
        order: order || 0,
        userId 
      }
    });

    res.status(201).json(paper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create paper' });
  }
});

// Get user's papers
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const papers = await prisma.paper.findMany({ 
      where: { userId },
      orderBy: { order: 'asc' }
    });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// Update paper reorder
router.post('/reorder', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { orders } = req.body; // Array of {id, order}
    const userId = req.userId!;

    await Promise.all(orders.map((o: any) => 
      prisma.paper.updateMany({
        where: { id: o.id, userId },
        data: { order: o.order }
      })
    ));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder papers' });
  }
});

// Update paper
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { title, abstract, status, journalName, link, authors, submittedAt, order } = req.body;
    const id = req.params.id as string;
    const userId = req.userId!;

    const paper = await prisma.paper.findUnique({ where: { id } });
    if (!paper || paper.userId !== userId) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const updatedPaper = await prisma.paper.update({
      where: { id },
      data: { 
        title, 
        abstract, 
        status, 
        journalName, 
        link, 
        authors, 
        submittedAt: submittedAt ? new Date(submittedAt) : null,
        order: order !== undefined ? order : paper.order
      }
    });

    res.json(updatedPaper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update paper' });
  }
});

// Delete paper
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const paper = await prisma.paper.findUnique({ where: { id } });
    if (!paper || paper.userId !== userId) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    await prisma.paper.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

export default router;
