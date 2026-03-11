import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      // 直接使用 Multer.File 或是從外部引入
      file?: any;
      files?: any[];
    }
  }
}
