import { Router } from "express";
import {
  getAllVentures,
  getVentureById,
  createVenture,
  updateVenture,
  deleteVenture,
} from "../controllers/ventureController";
import {
  authenticateToken,
  requireAdminOrSuperAdmin,
} from "../middleware/auth";
import { __uploadVentureMedia } from "../utils/multer";

const router = Router();

// router.use(authenticateToken);
// router.use(requireAdminOrSuperAdmin);

router.get("/", getAllVentures);
router.get("/:id", getVentureById);

router.post("/", __uploadVentureMedia, createVenture);
router.put("/:id", __uploadVentureMedia, updateVenture);

router.delete("/:id", deleteVenture);

export default router;
