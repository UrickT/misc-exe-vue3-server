import { handleControllerRequest } from "../asyncHandler.js";
import { PaperModel } from "./model.js";

export const paperController = {
  // 獲取所有紙張
  getAll: handleControllerRequest("Fetching all papers", async () => {
    return await PaperModel.find().sort({ displayOrder: 1 }).lean();
  }),

  // 根據 SN 獲取單一紙張
  getBySn: handleControllerRequest("Fetching paper by SN", async (req, res) => {
    const snNumber = Number(req.params.sn);

    if (isNaN(snNumber)) {
      // 可以手動回傳特定狀態碼，封裝函數會判斷 headersSent
      return res.status(400).json({ message: "Invalid SN format" });
    }

    const data = await PaperModel.findOne({ paperSN: snNumber }).lean();

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    return data; // 直接回傳資料，封裝函數會自動處理 res.json(data)
  }),
};
