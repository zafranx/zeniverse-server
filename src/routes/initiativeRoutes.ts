import { Router } from "express";
import {
  getAllInitiatives,
  getInitiativeById,
  createInitiative,
  updateInitiative,
  deleteInitiative,
} from "../controllers/initiativeController";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authenticateToken); // All routes require authentication

router.get("/", getAllInitiatives);
router.get("/:id", getInitiativeById);
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "heroImage", maxCount: 1 },
  ]),
  createInitiative
);
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "heroImage", maxCount: 1 },
  ]),
  updateInitiative
);
router.delete("/:id", deleteInitiative);

export default router;
