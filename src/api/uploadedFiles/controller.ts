import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { handleControllerRequest } from "../asyncHandler.js";
import { UploadedFileModel } from "./model.js";

// Cloudinary 配置
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface MulterRequest extends Request {
  file?: any;
}

export const uploadedFileController = {
  // 1. 獲取所有檔案清單
  getAll: handleControllerRequest("Fetching all files", async () => {
    return await UploadedFileModel.find().sort({ fileSN: -1 }).lean();
  }),

  // 2. 根據 fileSN 獲取單一檔案
  getBySn: handleControllerRequest("Fetching file by SN", async (req, res) => {
    const snNumber = Number(req.params.sn);
    if (isNaN(snNumber)) return res.status(400).json({ message: "Invalid SN format" });

    const data = await UploadedFileModel.findOne({ fileSN: snNumber }).lean();
    if (!data) return res.status(404).json({ message: "File not found" });

    return data;
  }),

  // 3. 上傳檔案 (整合 Cloudinary)
  upload: handleControllerRequest(
    "Uploading file to Cloudinary",
    async (req: MulterRequest, res: Response) => {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file detected" });

      // 解決中文亂碼
      const correctName = Buffer.from(file.originalname, "latin1").toString("utf8");

      try {
        // A. 轉發檔案到 Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "misc-exe-vue3",
          resource_type: "auto",
          transformation: [{ quality: "auto", fetch_format: "auto" }]
        });

        // B. 立即刪除 Render 伺服器上的臨時暫存檔
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        // C. 自動計算下一個 fileSN
        const lastFile = await UploadedFileModel.findOne().sort({ fileSN: -1 });
        const nextSN = lastFile && lastFile.fileSN ? lastFile.fileSN + 1 : 1;

        // D. 建立資料庫記錄 (改用 Cloudinary 回傳的資料)
        const fileData = new UploadedFileModel({
          fileSN: nextSN,
          originalName: correctName,
          path: uploadResult.secure_url,    // 存入 HTTPS 網址
          publicID: uploadResult.public_id, // 存入 Cloudinary ID
          size: uploadResult.bytes,
          mimetype: file.mimetype,
        });

        return await fileData.save();
      } catch (error) {
        // 出錯時也要嘗試清理暫存
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw error; // 讓 asyncHandler 捕獲錯誤
      }
    }
  ),

  // 4. 根據 SN 刪除檔案
  deleteBySn: handleControllerRequest(
    "Deleting file from Cloudinary and DB",
    async (req, res) => {
      const snNumber = Number(req.params.sn);
      if (isNaN(snNumber)) return res.status(400).json({ message: "Invalid SN" });

      // 1. 先找出資料，獲取 publicID
      const data = await UploadedFileModel.findOne({ fileSN: snNumber });

      if (!data) {
        return res.status(404).json({ message: "File not found" });
      }

      // 2. 從 Cloudinary 刪除實體檔案
      if (data.publicID) {
        await cloudinary.uploader.destroy(data.publicID);
      }

      // 3. 從 MongoDB 刪除記錄
      await UploadedFileModel.deleteOne({ fileSN: snNumber });

      return { success: true, message: `File SN:${snNumber} deleted from Cloudinary and DB` };
    }
  ),
};