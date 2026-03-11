import type { Request, Response, NextFunction } from "express";

/**
 * 通用的 Controller 封裝函數
 * @param logTitle 用於控制台輸出的標題 (例如: Fetching papers)
 * @param fn 實際執行資料庫操作的邏輯
 */
export const handleControllerRequest = (
  logTitle: string,
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(`🔍 [Controller] ${logTitle}...`);
    try {
      const result = await fn(req, res, next);

      // 如果 fn 已經回傳了 res (例如 res.json)，就不額外處理
      // 否則自動將 result 回傳為 JSON
      if (!res.headersSent) {
        return res.json(result);
      }
    } catch (err: any) {
      console.error(`❌ [Controller] ${logTitle} error:`, err.message);

      // 避免重複回傳
      if (!res.headersSent) {
        return res.status(500).json({
          message: "Server Error",
          error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
      next(err);
    }
  };
};
