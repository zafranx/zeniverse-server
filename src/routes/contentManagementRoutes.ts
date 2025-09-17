import express from 'express';
import {
  getContentByType,
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  toggleContentStatus,
  getContactDetails,
  updateContactDetails,
  getSocialMediaLinks,
  updateSocialMediaLinks,
  getSEOSettings,
  updateSEOSettings
} from '../controllers/contentManagementController';
// import { authenticateToken } from '../middleware/auth';
const router = express.Router();

// Public routes
router.get('/public/:type', getContentByType); // Get privacy policy, terms, or contact details

// Admin routes (protected)
// router.use(authenticateToken); // Uncomment when auth middleware is ready

router.get('/', getAllContent);
router.get('/:id', getContentById);
router.post('/', createContent);
router.put('/:id', updateContent);
router.patch('/:id/toggle-status', toggleContentStatus);
router.delete('/:id', deleteContent);

// Separated API endpoints
// Contact Details
router.get('/:id/contact-details', getContactDetails);
router.put('/:id/contact-details', updateContactDetails);

// Social Media Links
router.get('/:id/social-media', getSocialMediaLinks);
router.put('/:id/social-media', updateSocialMediaLinks);

// SEO Settings
router.get('/:id/seo', getSEOSettings);
router.put('/:id/seo', updateSEOSettings);

export default router;