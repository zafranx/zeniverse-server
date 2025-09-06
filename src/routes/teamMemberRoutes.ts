import { Router } from "express";
import {
  getAllTeamMembers,
  getAllTeamMembersAdmin,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamMemberStatus
} from "../controllers/teamMemberController";
import {
  authenticateToken,
  requireAdminOrSuperAdmin
} from "../middleware/auth";
import { __uploadImage } from "../utils/multer";

const router = Router();

// Public routes
router.get("/", getAllTeamMembers);
router.get("/detail/:id", getTeamMemberById);

// Admin routes
router.get(
  "/admin",
  authenticateToken,
  requireAdminOrSuperAdmin,
  getAllTeamMembersAdmin
);

router.post(
  "/",
  authenticateToken,
  requireAdminOrSuperAdmin,
  __uploadImage,
  createTeamMember
);

router.put(
  "/:id",
  authenticateToken,
  requireAdminOrSuperAdmin,
  __uploadImage,
  updateTeamMember
);

router.delete(
  "/:id",
  authenticateToken,
  requireAdminOrSuperAdmin,
  deleteTeamMember
);

router.patch(
  "/:id/toggle-status",
  authenticateToken,
  requireAdminOrSuperAdmin,
  toggleTeamMemberStatus
);

export default router;