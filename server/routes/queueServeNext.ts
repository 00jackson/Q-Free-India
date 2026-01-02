import { Router } from "express";
import { redis } from "../lib/redis.js";
import { emitQueueUpdate } from "../socket/emitter.js";
import { requireAdmin } from "../middleware/adminAuth.js";


console.log("🔥 queueServeNext route loaded");
const router = Router();

router.post("/:shopId", requireAdmin, async (req, res) => {
    console.log("🔥 HIT serve-next", req.params.shopId, req.cookies);
    try {
        const { shopId } = req.params;
        const queueKey = `queue:${shopId}`;

        // Remove first person atomically
        const name = await redis.lpop(queueKey);

        if (!name) {
            return res.status(400).json({ error: "Queue is empty" });
        }

        // Get updated queue
        const names = await redis.lrange(queueKey, 0, -1);

        const queue = names.map((n: string, i: number) => ({
            id: `${shopId}-${i}`,
            name: n,
            position: i + 1,
        }));

        // Notify all clients
        const AVG_SERVICE_MIN = 4;

        emitQueueUpdate({
            shopId,
            type: "SERVE_NEXT",
            served: name,
            queue: queue.map(
                (q: { id: string; name: string; position: number }) => ({
                    ...q,
                    etaMinutes: (q.position - 1) * AVG_SERVICE_MIN,
                })
            ),
        });

        res.json({ served: name, queue });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to serve next" });
    }
});

export default router;