import { Router } from "express";
import { prisma } from "../lib/prisma.ts";
import { redis } from "../lib/redis.ts";
import { emitQueueUpdate } from "../socket/emitter.ts";
const router = Router();

router.post("/join", async (req, res) => {
    try {
        const { name, shopId } = req.body;

        if (!name || !shopId) {
            return res.status(400).json({ error: "Missing name or shopId" });
        }

        const queueKey = `queue:${shopId}`;
        const position = await redis.llen(queueKey);

        await redis.rpush(queueKey, name);

        // Ensure shop exists
        await prisma.shop.upsert({
            where: { id: shopId },
            update: {},
            create: {
                id: shopId,
                name: shopId, // placeholder, can be updated later
            },
        });

        const entry = await prisma.queueEntry.create({
            data: {
                name,
                position: position + 1,
                shopId,
            },
        });
        emitQueueUpdate({
            shopId,
            entry,
        });

        res.json({ entry });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;