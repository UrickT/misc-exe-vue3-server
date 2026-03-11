import type { Request, Response } from "express";
import { handleControllerRequest } from "../asyncHandler.js";
import { UploadedFileModel } from "./model.js";

// 定義 Multer Request 型別
interface MulterRequest extends Request {
  file?: any;
}

export const uploadedFileController = {
  // 1. 獲取所有檔案清單
  getAll: handleControllerRequest("Fetching all files", async () => {
    // 照你的風格，按序號或日期排序
    return await UploadedFileModel.find().sort({ fileSN: -1 }).lean();
  }),

  // 2. 根據 fileSN 獲取單一檔案
  getBySn: handleControllerRequest("Fetching file by SN", async (req, res) => {
    const snNumber = Number(req.params.sn);

    if (isNaN(snNumber)) {
      return res.status(400).json({ message: "Invalid SN format" });
    }

    const data = await UploadedFileModel.findOne({ fileSN: snNumber }).lean();

    if (!data) {
      return res.status(404).json({ message: "File not found" });
    }

    return data;
  }),

  // 3. 上傳檔案 (並自動處理 fileSN)
  upload: handleControllerRequest(
    "Uploading file",
    async (req: MulterRequest, res: Response) => {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file detected" });

      // 解決中文亂碼：Multer 預設用 latin1，手動轉回 UTF-8
      const correctName = Buffer.from(file.originalname, "latin1").toString(
        "utf8",
      );

      // 將 Windows 路徑反斜線 "\" 改為正斜線 "/"：這樣前端拼接 URL 才不會出錯 (例如 uploads\123.jpg -> uploads/123.jpg)
      const normalizedPath = file.path.replace(/\\/g, "/");

      // 自動計算下一個 fileSN (取最大值 + 1)
      const lastFile = await UploadedFileModel.findOne().sort({ fileSN: -1 });
      const nextSN = lastFile && lastFile.fileSN ? lastFile.fileSN + 1 : 1;

      const fileData = new UploadedFileModel({
        fileSN: nextSN,
        originalName: correctName,
        fileName: req.file.filename,
        path: normalizedPath,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      return await fileData.save();
    },
  ),

  // 4. 根據 SN 刪除檔案
  deleteBySn: handleControllerRequest(
    "Deleting file by SN",
    async (req, res) => {
      const snNumber = Number(req.params.sn);
      if (isNaN(snNumber))
        return res.status(400).json({ message: "Invalid SN" });

      const data = await UploadedFileModel.findOneAndDelete({
        fileSN: snNumber,
      });

      if (!data) {
        return res.status(404).json({ message: "File not found" });
      }

      // 這裡通常會加上 fs.unlinkSync(data.path) 來刪除實體檔案
      return { success: true, message: `File SN:${snNumber} deleted` };
    },
  ),
};
