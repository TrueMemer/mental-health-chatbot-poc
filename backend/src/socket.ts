import { Server } from 'socket.io';
import { flowMachine, server } from './index'
import prisma from './prisma';
import jwt from 'jsonwebtoken';
import { SocketAdapter } from './adapters/socket';

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

flowMachine.registerAdapter(new SocketAdapter(io))

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
    const userId = (socket as any).user.id
    console.log('User connected:', userId);

    socket.on('joinConversation', async () => {
        socket.join(`user_${userId}`);
    });

    socket.on('leaveConversation', () => {
        socket.leave(`user_${userId}`);
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            if (messageData.sender === "BOT") return
            const userId = (socket as any).user.id;
            const { content } = messageData;

            const message = await prisma.message.create({
                data: {
                    sender: 'USER',
                    content,
                    userId: userId,
                    timestamp: new Date(),
                },
            });

            io.to(`user_${userId}`).emit('newMessage', message);

            const result = await flowMachine.handleInput('socket', userId, content);

            console.log(result)

            for (const botResponse of result.outputMessages) {
                const botMessage = await prisma.message.create({
                    data: {
                        sender: 'BOT',
                        userId: userId,
                        content: botResponse,
                        timestamp: new Date(),
                    },
                });

                io.to(`user_${userId}`).emit('newMessage', botMessage);
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