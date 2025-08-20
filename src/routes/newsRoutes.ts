import { Router } from "express";
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  toggleFeatured,
} from "../controllers/newsController";
import {
  authenticateToken,
  requireAdminOrSuperAdmin,
} from "../middleware/auth";
import { __uploadNewsMedia } from "../utils/multer";

const router = Router();

router.use(authenticateToken); // All routes require authentication
router.use(requireAdminOrSuperAdmin); // All routes require admin access

router.get("/", getAllNews);
router.get("/:id", getNewsById);
router.post("/", __uploadNewsMedia, createNews);
router.put("/:id", __uploadNewsMedia, updateNews);
router.patch("/:id/featured", toggleFeatured);
router.delete("/:id", deleteNews);

export default router;

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
