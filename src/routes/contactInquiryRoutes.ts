import express from 'express';
import {
  createContactInquiry,
  getAllContactInquiries,
  getContactInquiryById,
  markAsRead,
  replyToInquiry,
  updateInquiryNotes,
  deleteContactInquiry,
  getUnreadCount
} from '../controllers/contactInquiryController';
import {
  authenticateToken,
  requireAdminOrSuperAdmin,
} from "../middleware/auth"; // Assuming you have admin auth middleware

const router = express.Router();

// Public routes
router.post('/', createContactInquiry);

// Admin routes (protected)
// router.use(authenticateToken); // Uncomment when auth middleware is ready

router.get('/', getAllContactInquiries);
router.get('/unread-count', getUnreadCount);
router.get('/:id', getContactInquiryById);
router.patch('/:id/mark-read', markAsRead);
router.patch('/:id/reply', replyToInquiry);
router.patch('/:id/notes', updateInquiryNotes);
router.delete('/:id', deleteContactInquiry);

export default router;