import { Router } from "express";
import { flowMachine } from "..";

const router = Router();

router.get('/trigger', async (req, res) => {
    const userId = req.query.userId as string
    if (!userId) return res.status(400).json({ message: "No user id specified" })
    await flowMachine.initiateFlow("telegram", userId, "", "check-in", true)

    return {}
})

export default router