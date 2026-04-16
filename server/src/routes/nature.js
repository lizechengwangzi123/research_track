import { Router } from 'express';
import Parser from 'rss-parser';
const router = Router();
const parser = new Parser();
router.get('/latest', async (req, res) => {
    try {
        const feed = await parser.parseURL('https://www.nature.com/nature.rss');
        const articles = feed.items.map(item => ({
            title: item.title,
            link: item.link,
            authors: item.creator || item.author || 'Nature Research',
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }) : 'Recent',
            category: item.categories?.[0] || 'Research',
            description: item.contentSnippet || item.content || ''
        })).slice(0, 10);
        res.json(articles);
    }
    catch (err) {
        console.error('Failed to fetch Nature RSS:', err);
        // Fallback data if Nature is down or CORS issues on their end
        res.status(200).json([
            {
                title: "Global research trends in 2026",
                link: "https://www.nature.com/",
                authors: "Nature Editorial",
                date: new Date().toLocaleDateString(),
                category: "Editorial",
                description: "The latest updates from the world of scientific research."
            }
        ]);
    }
});
export default router;
//# sourceMappingURL=nature.js.map