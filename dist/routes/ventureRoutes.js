"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ventureController_1 = require("../controllers/ventureController");
const auth_1 = require("../middleware/auth");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
// router.use(authenticateToken);
// router.use(requireAdminOrSuperAdmin);
router.get("/", ventureController_1.getAllVentures);
router.get("/:id", ventureController_1.getVentureById);
router.post("/", multer_1.__uploadVentureMedia, ventureController_1.createVenture, auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin);
router.put("/:id", multer_1.__uploadVentureMedia, ventureController_1.updateVenture, auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin);
router.delete("/:id", ventureController_1.deleteVenture);
exports.default = router;
//# sourceMappingURL=ventureRoutes.js.map