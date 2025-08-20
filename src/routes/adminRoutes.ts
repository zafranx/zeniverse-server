import { Router } from "express";
import {
  login,
  getDashboard,
  getProfile,
  updateProfile,
  logout,
} from "../controllers/adminController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.get("/dashboard", authenticateToken, getDashboard);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post("/logout", authenticateToken, logout);

export default router;

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
