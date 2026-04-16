import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// Create paper
router.post('/', authenticate, async (req, res) => {
    try {
        const { title, abstract, status, journalName, link, authors, submittedAt, order } = req.body;
        const userId = req.userId;
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create paper' });
    }
});
// Get user's papers
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const papers = await prisma.paper.findMany({
            where: { userId },
            orderBy: { order: 'asc' }
        });
        res.json(papers);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch papers' });
    }
});
// Update paper reorder
router.post('/reorder', authenticate, async (req, res) => {
    try {
        const { orders } = req.body; // Array of {id, order}
        const userId = req.userId;
        await Promise.all(orders.map((o) => prisma.paper.updateMany({
            where: { id: o.id, userId },
            data: { order: o.order }
        })));
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to reorder papers' });
    }
});
// Update paper
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { title, abstract, status, journalName, link, authors, submittedAt, order } = req.body;
        const id = req.params.id;
        const userId = req.userId;
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update paper' });
    }
});
// Delete paper
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        const paper = await prisma.paper.findUnique({ where: { id } });
        if (!paper || paper.userId !== userId) {
            return res.status(404).json({ error: 'Paper not found' });
        }
        await prisma.paper.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete paper' });
    }
});
export default router;
//# sourceMappingURL=papers.js.map