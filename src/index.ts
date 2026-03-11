import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { API_ROUTES } from "@/apiCollectionsBackend.js";
import { router as paperRoutes } from "@/api/papers/route.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// --- 1. 基礎 Middleware ---
app.use(cors());
app.use(express.json());

// --- 2. 業務路由掛載 ---
app.use(API_ROUTES.PAPER.BASE, paperRoutes);

// --- 3. MongoDB 連線 ---
const uri = process.env.MONGODB_URI || "";
if (uri) {
  mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("✅ [MongoDB] Connected successfully"))
    .catch((err) =>
      console.error("❌ [MongoDB] Connection error:", err.message),
    );
} else {
  console.warn("⚠️ [MongoDB] No URI found in .env");
}

// --- 4. 啟動監聽 ---
app.listen(PORT, "0.0.0.0", () => {
  console.log("=========================================");
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log("=========================================");
});
