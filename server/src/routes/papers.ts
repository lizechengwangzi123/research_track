import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Create paper
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { title, abstract, status } = req.body;
    const userId = req.userId!;

    const paper = await prisma.paper.create({
      data: { title, abstract, status, userId }
    });

    res.status(201).json(paper);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create paper' });
  }
});

// Get user's papers
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId!;
    const papers = await prisma.paper.findMany({ where: { userId } });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// Update paper
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { title, abstract, status } = req.body;
    const { id } = req.params;
    const userId = req.userId!;

    const paper = await prisma.paper.findUnique({ where: { id } });
    if (!paper || paper.userId !== userId) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const updatedPaper = await prisma.paper.update({
      where: { id },
      data: { title, abstract, status }
    });

    res.json(updatedPaper);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update paper' });
  }
});

// Delete paper
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
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
