import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: any, res: Response) => {
    const userId = req.user.id;
    const messages = await prisma.message.findMany({
        where: { userId },
    });
    res.json(messages);
});

router.get('/:id', async (req, res) => {
    const messageId = parseInt(req.params.id);

    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });

    return res.json({
        message,
    });
});

export default router;