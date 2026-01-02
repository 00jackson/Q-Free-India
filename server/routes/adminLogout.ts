import { Router } from "express";

const router = Router();

router.post("/logout", (_req, res) => {
  res.clearCookie("admin_auth", {
    path: "/",
    sameSite: "lax",
  });
  return res.json({ success: true });
});

export default router;