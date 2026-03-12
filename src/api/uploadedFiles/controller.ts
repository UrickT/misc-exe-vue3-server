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
    if (isNaN(snNumber))
      return res.status(400).json({ message: "Invalid SN format" });

    const data = await UploadedFileModel.findOne({ fileSN: snNumber }).lean();
    if (!data) return res.status(404).json({ message: "File not found" });

    return data;
  }),

  // 3. 上傳檔案 (針對 PDF 修正路徑類型)
  upload: handleControllerRequest(
    "Uploading file to Cloudinary",
    async (req: MulterRequest, res: Response) => {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file detected" });

      const correctName = Buffer.from(file.originalname, "latin1").toString(
        "utf8",
      );

      // 💡 1. 判斷是否為 PDF
      const isPdf = correctName.toLowerCase().endsWith(".pdf");

      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "misc-exe-vue3",
          // 關鍵：PDF 必須強制設為 image 類別
          // 這樣 secure_url 就會變成 .../image/upload/... 而不是 .../raw/upload/...
          resource_type: isPdf ? "image" : "auto",
        });

        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        const lastFile = await UploadedFileModel.findOne().sort({ fileSN: -1 });
        const nextSN = lastFile && lastFile.fileSN ? lastFile.fileSN + 1 : 1;

        const fileData = new UploadedFileModel({
          fileSN: nextSN,
          originalName: correctName,
          path: uploadResult.secure_url,
          publicID: uploadResult.public_id,
          size: uploadResult.bytes,
          mimetype: file.mimetype,
        });

        return await fileData.save();
      } catch (error) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw error;
      }
    },
  ),

  // 4. 根據 SN 刪除檔案 (支援 PDF 刪除)
  deleteBySn: handleControllerRequest(
    "Deleting file from Cloudinary and DB",
    async (req, res) => {
      const snNumber = Number(req.params.sn);
      if (isNaN(snNumber))
        return res.status(400).json({ message: "Invalid SN" });

      // 1. 先找出資料，獲取 publicID 與類型
      const data = await UploadedFileModel.findOne({ fileSN: snNumber });

      if (!data) {
        return res.status(404).json({ message: "File not found" });
      }

      // 2. 從 Cloudinary 刪除實體檔案
      if (data.publicID) {
        const isPdf = data.originalName.toLowerCase().endsWith(".pdf");

        // 💡 刪除 PDF (raw) 時必須指定 resource_type
        await cloudinary.uploader.destroy(data.publicID, {
          resource_type: isPdf ? "raw" : "image",
        });
      }

      // 3. 從 MongoDB 刪除記錄
      await UploadedFileModel.deleteOne({ fileSN: snNumber });

      return {
        success: true,
        message: `File SN:${snNumber} deleted from Cloudinary and DB`,
      };
    },
  ),
};
