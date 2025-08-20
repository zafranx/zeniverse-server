"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/login", adminController_1.login);
router.get("/dashboard", auth_1.authenticateToken, adminController_1.getDashboard);
router.get("/profile", auth_1.authenticateToken, adminController_1.getProfile);
router.put("/profile", auth_1.authenticateToken, adminController_1.updateProfile);
router.post("/logout", auth_1.authenticateToken, adminController_1.logout);
exports.default = router;
// import { Router } from "express";
// import {
//   login,
//   getDashboard,
//   getProfile,
//   logout,
// } from "../controllers/adminController";
// import { authenticateToken } from "../middleware/auth";
// const router = Router();
// router.post("/login", login);
// router.get("/dashboard", authenticateToken, getDashboard);
// router.get("/profile", authenticateToken, getProfile);
// router.post("/logout", authenticateToken, logout);
// export default router;
//# sourceMappingURL=adminRoutes.js.map