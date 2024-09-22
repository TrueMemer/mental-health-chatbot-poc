import express, { Application, Request, Response } from 'express';
import session from 'express-session'
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import conversationRouter from './routes/conversations';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import interactionsRouter from './routes/interactions';
import passport from './config/passport';
import auth from './middleware/auth';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

import ConversationManager from './services/conversation-manager';
import FlowManager from './services/flow-manager';
import AIResponder from './services/ai-responder';

const flowManager = new FlowManager();
const conversationManager = new ConversationManager(flowManager);
const aiResponder = new AIResponder();

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());

app.get('/', (req: Request, res: Response) => {
    res.send('Mental Health Chatbot API');
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    try {
        const tokenWithoutBearer = token.replace('Bearer ', '');
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET as string);
        (socket as any).user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', (socket as any).user.id);
    const userId = (socket as any).user.id;


    socket.on('joinConversation', async (conversationId) => {

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });

        if (conversation && conversation.userId === userId) {
            socket.join(`conversation_${conversationId}`);
        } else {
            socket.emit('error', { message: 'Unauthorized access to conversation.' });
        }
    });


    socket.on('leaveConversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
    });


    socket.on('sendMessage', async (messageData) => {
        try {
            if (messageData.sender === "BOT") return
            const userId = (socket as any).user.id;
            const { conversationId, content } = messageData;


            const conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
            });

            if (!conversation || conversation.userId !== userId) {
                socket.emit('error', { message: 'Unauthorized access to conversation.' });
                return;
            }


            const message = await prisma.message.create({
                data: {
                    conversationId,
                    sender: 'USER',
                    content,
                    timestamp: new Date(),
                },
            });


            io.to(`conversation_${conversationId}`).emit('newMessage', message);

            let botResponse = await conversationManager.handleMessage(userId, content);
            console.log(botResponse)

            if (botResponse !== undefined && botResponse.trim() !== '') {

                const botMessage = await prisma.message.create({
                    data: {
                        conversationId,
                        sender: 'BOT',
                        content: botResponse,
                        timestamp: new Date(),
                    },
                });

                io.to(`conversation_${conversationId}`).emit('newMessage', botMessage);
            } else {

                if (await conversationManager.isUserInFlow(userId)) {

                } else {

                    const aiResponse = await aiResponder.generateResponse(content);


                    const aiMessage = await prisma.message.create({
                        data: {
                            conversationId,
                            sender: 'BOT',
                            content: aiResponse,
                            timestamp: new Date(),
                        },
                    });

                    io.to(`conversation_${conversationId}`).emit('newMessage', aiMessage);
                }
            }
        } catch (error) {
            console.error('Error handling sendMessage:', error);
            socket.emit('error', { message: 'Failed to send message.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', (socket as any).user.id);
    });
});

const botResponses = [
    'Thank you for reaching out!',
    'I understand how you feel.',
    'Can you tell me more about that?',
    'That sounds interesting.',
    'I\'m here to listen.',
    'How does that make you feel?',
    'Let\'s explore that further.',
    'What do you think about it?',
    'I\'m sorry to hear that.',
    'That must be challenging.',

];

async function generateBotResponse(conversationId: number) {

    const randomIndex = Math.floor(Math.random() * botResponses.length);
    const content = botResponses[randomIndex];


    const botMessage = await prisma.message.create({
        data: {
            conversationId,
            sender: 'BOT',
            content,
            timestamp: new Date(),
        },
    });

    return botMessage;
}

const router = express.Router();
router.use('/conversations', auth, conversationRouter);
router.use('/users', auth, usersRouter);
router.use('/auth', authRouter);
router.use('/interactions', interactionsRouter)

app.use('/api', router);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});