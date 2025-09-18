"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/uploadRoutes.ts
const express_1 = require("express");
const multer_1 = require("../utils/multer");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/upload", auth_1.authenticateToken, auth_1.requireAdminOrSuperAdmin, multer_1.__uploadMedia, uploadController_1.uploadFiles);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map