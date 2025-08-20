"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const initiativeController_1 = require("../controllers/initiativeController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken); // All routes require authentication
router.get("/", initiativeController_1.getAllInitiatives);
router.get("/:id", initiativeController_1.getInitiativeById);
router.post("/", upload_1.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "heroImage", maxCount: 1 },
]), initiativeController_1.createInitiative);
router.put("/:id", upload_1.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "heroImage", maxCount: 1 },
]), initiativeController_1.updateInitiative);
router.delete("/:id", initiativeController_1.deleteInitiative);
exports.default = router;
//# sourceMappingURL=initiativeRoutes.js.map