import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { API_ROUTES } from "../apiCollectionsBackend.js";
import { uploadedFileController } from "./controller.js";

const router: Router = Router();

// --- Multer 配置 (雲端轉發版) ---

// 建立臨時暫存目錄
const tempDir = "temp/";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// 檔案上傳後會暫存在 temp/，Controller 上傳完後會負責刪除它
const upload = multer({
  dest: tempDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制 5MB
});

// --- 路由定義 ---

// POST: 上傳檔案 (轉發至 Cloudinary)
router.post(
  API_ROUTES.UPLOADED_FILE.UPLOAD,
  upload.single("file"),
  uploadedFileController.upload,
);

// GET ALL: 獲取所有檔案清單
router.get(API_ROUTES.UPLOADED_FILE.GET_ALL, uploadedFileController.getAll);

// GET BY SN: 獲取單一檔案紀錄
router.get(API_ROUTES.UPLOADED_FILE.GET_BY_SN, uploadedFileController.getBySn);

// DELETE BY SN: 刪除檔案 (同步刪除 Cloudinary 實體)
router.delete(
  API_ROUTES.UPLOADED_FILE.DELETE_BY_SN,
  uploadedFileController.deleteBySn,
);

export { router };
