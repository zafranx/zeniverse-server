import express from 'express';
import {
  getAllContactSocial,
  getContactSocialById,
  createContactSocial,
  updateContactSocial,
  deleteContactSocial,
  toggleContactSocialStatus, // Changed from publishContactSocial, unpublishContactSocial
  addContactDetail,
  updateContactDetail,
  removeContactDetail,
  addSocialMediaLink,
  updateSocialMediaLink,
  removeSocialMediaLink,
  getPublishedContactSocial
} from '../controllers/contactSocialController';
// import { authenticateToken } from '../middleware/auth'; // Assuming you have admin auth middleware

const router = express.Router();

// Public routes
router.get('/public', getPublishedContactSocial); // Get published contact and social media info

// Admin routes (protected)
// router.use(authenticateToken); // Uncomment when auth middleware is ready

// Main CRUD operations
router.get('/', getAllContactSocial);
router.get('/:id', getContactSocialById);
router.post('/', createContactSocial);
router.put('/:id', updateContactSocial);
router.delete('/:id', deleteContactSocial);

// Publishing operations - using toggle function
router.patch('/:id/toggle-status', toggleContactSocialStatus);

// Contact Details management
router.post('/:id/contact-details', addContactDetail);
router.put('/:id/contact-details/:contactId', updateContactDetail);
router.delete('/:id/contact-details/:contactId', removeContactDetail);

// Social Media Links management
router.post('/:id/social-media', addSocialMediaLink);
router.put('/:id/social-media/:socialId', updateSocialMediaLink);
router.delete('/:id/social-media/:socialId', removeSocialMediaLink);

export default router;