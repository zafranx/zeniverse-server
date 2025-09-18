"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contactInquiryController_1 = require("../controllers/contactInquiryController");
const router = express_1.default.Router();
// Public routes
router.post('/', contactInquiryController_1.createContactInquiry);
// Admin routes (protected)
// router.use(authenticateToken); // Uncomment when auth middleware is ready
router.get('/', contactInquiryController_1.getAllContactInquiries);
router.get('/unread-count', contactInquiryController_1.getUnreadCount);
router.get('/:id', contactInquiryController_1.getContactInquiryById);
router.patch('/:id/mark-read', contactInquiryController_1.markAsRead);
router.patch('/:id/reply', contactInquiryController_1.replyToInquiry);
router.patch('/:id/notes', contactInquiryController_1.updateInquiryNotes);
router.delete('/:id', contactInquiryController_1.deleteContactInquiry);
exports.default = router;
//# sourceMappingURL=contactInquiryRoutes.js.map