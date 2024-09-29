import { telegramAdapter } from "@/adapters/telegram";
import { Router } from "express";

const router = Router();

router.post('/webhook', async (req, res) => {
    telegramAdapter.bot.processUpdate(req.body);
    res.sendStatus(200);
})

export default router