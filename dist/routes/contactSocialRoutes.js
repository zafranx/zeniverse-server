"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contactSocialController_1 = require("../controllers/contactSocialController");
// import { authenticateToken } from '../middleware/auth'; // Assuming you have admin auth middleware
const router = express_1.default.Router();
// Public routes
router.get('/public', contactSocialController_1.getPublishedContactSocial); // Get published contact and social media info
// Admin routes (protected)
// router.use(authenticateToken); // Uncomment when auth middleware is ready
// Main CRUD operations
router.get('/', contactSocialController_1.getAllContactSocial);
router.get('/:id', contactSocialController_1.getContactSocialById);
router.post('/', contactSocialController_1.createContactSocial);
router.put('/:id', contactSocialController_1.updateContactSocial);
router.delete('/:id', contactSocialController_1.deleteContactSocial);
// Publishing operations - using toggle function
router.patch('/:id/toggle-status', contactSocialController_1.toggleContactSocialStatus);
// Contact Details management
router.post('/:id/contact-details', contactSocialController_1.addContactDetail);
router.put('/:id/contact-details/:contactId', contactSocialController_1.updateContactDetail);
router.delete('/:id/contact-details/:contactId', contactSocialController_1.removeContactDetail);
// Social Media Links management
router.post('/:id/social-media', contactSocialController_1.addSocialMediaLink);
router.put('/:id/social-media/:socialId', contactSocialController_1.updateSocialMediaLink);
router.delete('/:id/social-media/:socialId', contactSocialController_1.removeSocialMediaLink);
exports.default = router;
//# sourceMappingURL=contactSocialRoutes.js.map