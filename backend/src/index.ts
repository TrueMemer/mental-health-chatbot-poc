import express, { Application, Request, Response } from 'express';
import session from 'express-session'
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import messagesRouter from './routes/messages';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import passport from './config/passport';
import auth from './middleware/auth';
import { FlowMachine } from './services/flow-machine';

dotenv.config();

const systemPrompt = `You are a compassionate and empathetic virtual assistant designed to support users who may be experiencing emotional distress. Your primary goal is to provide a safe, non-judgmental space for users to express their feelings. In your responses:
- Listen actively and empathetically to what the user is sharing.
- Acknowledge their feelings and validate their experiences.
- Use supportive and gentle language to convey understanding.
- Encourage them to seek professional help if they express severe distress or mention thoughts of self-harm.
- Avoid giving medical diagnoses or specific medical advice.
- Maintain confidentiality and trust, ensuring the user feels safe sharing their thoughts.
- Do not make assumptions or judgments about their situation.`

export const flowMachine = new FlowMachine();
flowMachine.loadFlows()
flowMachine.setSystemPrompt(systemPrompt)

const app: Application = express();
export const server = http.createServer(app);

import './socket'

const port = process.env.PORT || 5000;

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

const router = express.Router();
router.use('/messages', auth, messagesRouter);
router.use('/users', auth, usersRouter);
router.use('/auth', authRouter);

app.use('/api', router);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});