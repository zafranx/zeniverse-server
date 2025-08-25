// src/routes/uploadRoutes.ts
import { Router } from "express";
import { __uploadMedia } from "../utils/multer";
import { uploadFiles } from "../controllers/uploadController";
import {
  authenticateToken,
  requireAdminOrSuperAdmin,
} from "../middleware/auth";

const router = Router();

router.post(
  "/upload",
  authenticateToken,
  requireAdminOrSuperAdmin,
  __uploadMedia,
  uploadFiles
);

export default router;
