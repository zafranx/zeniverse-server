// src/routes/uploadRoutes.ts
import { Router } from "express";
import { __uploadMedia } from "../utils/multer";
import { uploadFiles } from "../controllers/uploadController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post(
  "/upload",
//    authenticateToken,
  __uploadMedia,
  uploadFiles
);

export default router;
