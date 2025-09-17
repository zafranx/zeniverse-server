"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contentManagementController_1 = require("../controllers/contentManagementController");
// import { authenticateToken } from '../middleware/auth';
const router = express_1.default.Router();
// Public routes
router.get('/public/:type', contentManagementController_1.getContentByType); // Get privacy policy, terms, or contact details
// Admin routes (protected)
// router.use(authenticateToken); // Uncomment when auth middleware is ready
router.get('/', contentManagementController_1.getAllContent);
router.get('/:id', contentManagementController_1.getContentById);
router.post('/', contentManagementController_1.createContent);
router.put('/:id', contentManagementController_1.updateContent);
router.patch('/:id/toggle-status', contentManagementController_1.toggleContentStatus);
router.delete('/:id', contentManagementController_1.deleteContent);
// Separated API endpoints
// Contact Details
router.get('/:id/contact-details', contentManagementController_1.getContactDetails);
router.put('/:id/contact-details', contentManagementController_1.updateContactDetails);
// Social Media Links
router.get('/:id/social-media', contentManagementController_1.getSocialMediaLinks);
router.put('/:id/social-media', contentManagementController_1.updateSocialMediaLinks);
// SEO Settings
router.get('/:id/seo', contentManagementController_1.getSEOSettings);
router.put('/:id/seo', contentManagementController_1.updateSEOSettings);
exports.default = router;
//# sourceMappingURL=contentManagementRoutes.js.map