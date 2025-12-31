import { Router } from "express";
import { redis } from "../lib/redis.ts";
import { emitQueueUpdate } from "../socket/emitter.ts";

const router = Router();

router.post("/:shopId/remove", async (req, res) => {
  try {
    const { shopId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Missing name" });
    }

    const queueKey = `queue:${shopId}`;

    // Remove ALL occurrences just in case
    await redis.lrem(queueKey, 0, name);

    const names = await redis.lrange(queueKey, 0, -1);

    const AVG_SERVICE_MIN = 4;

    const queue = names.map((n, i) => ({
      id: `${shopId}-${i}`,
      name: n,
      position: i + 1,
      etaMinutes: i * AVG_SERVICE_MIN,
    }));

    emitQueueUpdate({
      shopId,
      type: "REMOVE",
      removed: name,
      queue,
    });

    res.json({ removed: name, queue });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to remove user" });
  }
});

export default router;