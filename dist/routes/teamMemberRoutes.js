"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teamMemberController_1 = require("../controllers/teamMemberController");
const auth_1 = require("../middleware/auth");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
// Public routes
router.get("/", teamMemberController_1.getAllTeamMembers);
router.get("/detail/:id", teamMemberController_1.getTeamMemberById);
// Admin routes
router.get("/admin", auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, teamMemberController_1.getAllTeamMembersAdmin);
router.post("/", auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, multer_1.__uploadImage, teamMemberController_1.createTeamMember);
router.put("/:id", auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, multer_1.__uploadImage, teamMemberController_1.updateTeamMember);
router.delete("/:id", auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, teamMemberController_1.deleteTeamMember);
router.patch("/:id/toggle-status", auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, teamMemberController_1.toggleTeamMemberStatus);
exports.default = router;
//# sourceMappingURL=teamMemberRoutes.js.map