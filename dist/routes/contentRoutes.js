"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contentController_1 = require("../controllers/contentController");
// import { authenticateToken } from '../middleware/auth'; // Assuming you have admin auth middleware
const router = express_1.default.Router();
// Public routes
router.get('/public/type/:type', contentController_1.getPublishedContentByType); // Get published content by type
router.get('/public/slug/:slug', contentController_1.getContentBySlug); // Get content by slug
// Admin routes (protected)
// router.use(authenticateToken); // Uncomment when auth middleware is ready
// Main CRUD operations
router.get('/', contentController_1.getAllContent);
router.get('/:id', contentController_1.getContentById);
router.post('/', contentController_1.createContent);
router.put('/:id', contentController_1.updateContent);
router.delete('/:id', contentController_1.deleteContent);
// Content filtering
router.get('/type/:type', contentController_1.getContentByType);
// Publishing operations
router.patch('/:id/publish', contentController_1.publishContent);
router.patch('/:id/unpublish', contentController_1.unpublishContent);
// SEO management
router.put('/:id/seo', contentController_1.updateSEOSettings);
exports.default = router;
//# sourceMappingURL=contentRoutes.js.map