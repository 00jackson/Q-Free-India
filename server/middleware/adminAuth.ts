import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const shopId = req.params.shopId;
    const authShop = req.cookies?.admin_auth;
  
    console.log("🔐 auth check:", { shopId, authShop });
  
    if (!authShop) {
      return res.status(401).json({ error: "No auth cookie" });
    }
  
    if (authShop !== shopId) {
      return res.status(401).json({ error: "Shop mismatch" });
    }
  
    next();
  }
  