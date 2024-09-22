import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const interactions = await prisma.interaction.findMany({
            orderBy: { timestamp: 'desc' },
        });
        res.json(interactions);
    } catch (error) {
        console.error('Error fetching interactions:', error);
        res.status(500).json({ error: 'Failed to fetch interactions' });
    }
});


router.get('/user/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const interactions = await prisma.interaction.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
        });
        res.json(interactions);
    } catch (error) {
        console.error('Error fetching interactions:', error);
        res.status(500).json({ error: 'Failed to fetch interactions' });
    }
});


router.get('/flow/:flowId', async (req, res) => {
    const { flowId } = req.params;
    try {
        const interactions = await prisma.interaction.findMany({
            where: { flowId },
            orderBy: { timestamp: 'desc' },
        });
        res.json(interactions);
    } catch (error) {
        console.error('Error fetching interactions:', error);
        res.status(500).json({ error: 'Failed to fetch interactions' });
    }
});

router.get('/conversation-path/:userId/:flowId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { flowId } = req.params;

    try {
        const interactions = await prisma.interaction.findMany({
            where: {
                userId,
                flowId,
            },
            orderBy: {
                timestamp: 'asc',
            },
        });
        res.json(interactions);
    } catch (error) {
        console.error('Error fetching conversation path:', error);
        res.status(500).json({ error: 'Failed to fetch conversation path' });
    }
});


export default router;
