"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsController_1 = require("../controllers/newsController");
const auth_1 = require("../middleware/auth");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken); // All routes require authentication
router.use(auth_1.requireAdminOrSuperAdmin); // All routes require admin access
router.get("/", newsController_1.getAllNews);
router.get("/:id", newsController_1.getNewsById);
router.post("/", multer_1.__uploadNewsMedia, newsController_1.createNews);
router.put("/:id", multer_1.__uploadNewsMedia, newsController_1.updateNews);
router.patch("/:id/featured", newsController_1.toggleFeatured);
router.delete("/:id", newsController_1.deleteNews);
exports.default = router;
// import { Router } from "express";
// import {
//   getAllNews,
//   getNewsById,
//   createNews,
//   updateNews,
//   deleteNews,
// } from "../controllers/newsController";
// import { authenticateToken } from "../middleware/auth";
// import { upload } from "../middleware/upload";
// const router = Router();
// router.use(authenticateToken); // All routes require authentication
// router.get("/", getAllNews);
// router.get("/:id", getNewsById);
// router.post(
//   "/",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "heroImage", maxCount: 1 },
//   ]),
//   createNews
// );
// router.put(
//   "/:id",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "heroImage", maxCount: 1 },
//   ]),
//   updateNews
// );
// router.delete("/:id", deleteNews);
// export default router;
//# sourceMappingURL=newsRoutes.js.map