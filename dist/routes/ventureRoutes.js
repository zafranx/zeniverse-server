"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ventureController_1 = require("../controllers/ventureController");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
// router.use(authenticateToken);
// router.use(requireAdminOrSuperAdmin);
router.get("/", ventureController_1.getAllVentures);
router.get("/:id", ventureController_1.getVentureById);
router.post("/", multer_1.__uploadVentureMedia, ventureController_1.createVenture);
router.put("/:id", multer_1.__uploadVentureMedia, ventureController_1.updateVenture);
router.delete("/:id", ventureController_1.deleteVenture);
exports.default = router;
//# sourceMappingURL=ventureRoutes.js.map