import { Router } from "express";
import { API_ROUTES } from "../../apiCollectionsBackend.js"; 
import { paperController } from "./controller.js";

const router: Router = Router();

// GET ALL: 假設路徑是 /api/papers/
router.get(API_ROUTES.PAPER.GET_ALL, paperController.getAll);

// GET BY SN: 假設路徑是 /api/papers/:sn
router.get(API_ROUTES.PAPER.GET_BY_SN, paperController.getBySn);

export { router };