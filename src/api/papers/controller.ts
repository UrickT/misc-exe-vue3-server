import type { Request, Response, NextFunction } from "express";
import { PaperModel } from "./model.js";

export const paperController = {
  // 獲取所有紙張
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    console.log("🔍 [Controller] Fetching all papers...");
    try {
      const data = await PaperModel.find().sort({ displayOrder: 1 }).lean();
      return res.json(data);
    } catch (err: any) {
      console.error("❌ [Controller] getAll error:", err.message);
      return res
        .status(500)
        .json({ message: "Database Error", error: err.message });
    }
  },

  // 根據 SN 獲取單一紙張
  getBySn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const snNumber = Number(req.params.sn);
      if (isNaN(snNumber)) {
        return res.status(400).json({ message: "Invalid SN format" });
      }

      const data = await PaperModel.findOne({ paperSN: snNumber }).lean();

      if (!data) {
        return res.status(404).json({ message: "Data not found" });
      }
      return res.json(data);
    } catch (err: any) {
      console.error("❌ [Controller] getBySn error:", err.message);
      return res.status(500).json({ message: "Server Error" });
    }
  },
};
