import { Router } from "express";
import { redis } from "../lib/redis.ts";

const router = Router();

router.get("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;

    const queueKey = `queue:${shopId}`;
    const names = await redis.lrange(queueKey, 0, -1);

    const queue = names.map((name, index) => ({
      id: `${shopId}-${index}`,
      name,
      position: index + 1,
    }));

    res.json({ queue });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch queue state" });
  }
});

export default router;