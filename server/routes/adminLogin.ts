import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();
console.log("🔥 adminLogin route file loaded");

router.post("/login", async (req, res) => {
    console.log("Hit /api/admin/login");

    try {
        const { shopId, pin } = req.body;
        const pinStr = String(pin);
        if (!shopId || !pin) {
            return res.status(400).json({ error: "Missing shopId or pin" });
        }
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            select: { adminPin: true },
        })

        if (!shop || shop.adminPin !== pinStr) {
            return res.status(401).json({ error: "Invalid PIN" });
        }
        res.cookie("admin_auth", shopId, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/",
        });

        return res.json({ success: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: " Interval server error" });

    }
});

export default router;