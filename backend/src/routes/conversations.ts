import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: any, res: Response) => {
  const userId = req.user.id;
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    include: { messages: true },
  });
  res.json(conversations);
});

router.get('/:id/messages', async (req: Request, res: Response) => {
  const conversationId = parseInt(req.params.id, 10);
  const userId = (req as any).user.id;

  if (isNaN(conversationId)) {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }

  try {

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }


    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req: any, res: Response) => {
  const userId = req.user.id;
  const conversation = await prisma.conversation.create({
    data: { userId },
  });

  console.log(conversation)

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: 'BOT',
      content: 'Hello! I am here to support you with your mental health. How are you feeling today?',
    },
  });
  res.json(conversation);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const conversationId = parseInt(req.params.id, 10);
  const userId = (req as any).user.id;

  if (isNaN(conversationId)) {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }

  try {

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this conversation' });
    }


    await prisma.message.deleteMany({
      where: { conversationId },
    });

    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;