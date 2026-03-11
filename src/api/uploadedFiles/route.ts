import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { API_ROUTES } from "../apiCollectionsBackend.js";
import { uploadedFileController } from "./controller.js";

const router: Router = Router();

// --- Multer 配置 ---
// 確保上傳目錄存在，避免啟動時報錯
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 檔名規則：時間戳記-隨機數.副檔名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制 5MB，可依需求調整
});

// --- 路由定義 ---

// POST: 上傳單一檔案 (對應路徑如 /api/uploaded-files/upload)
router.post(
  API_ROUTES.UPLOADED_FILE.UPLOAD,
  upload.single("file"),
  uploadedFileController.upload,
);

// GET ALL: 獲取所有檔案清單 (對應路徑如 /api/uploaded-files/list)
router.get(API_ROUTES.UPLOADED_FILE.GET_ALL, uploadedFileController.getAll);

// GET BY SN: 獲取單一檔案紀錄 (對應路徑如 /api/uploaded-files/:sn)
router.get(API_ROUTES.UPLOADED_FILE.GET_BY_SN, uploadedFileController.getBySn);

// DELETE BY SN: 根據序號刪除檔案紀錄
router.delete(
  API_ROUTES.UPLOADED_FILE.DELETE_BY_SN,
  uploadedFileController.deleteBySn,
);

export { router };
