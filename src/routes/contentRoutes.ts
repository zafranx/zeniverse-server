import express from 'express';
import {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  getContentByType,
  getContentBySlug,
  publishContent,
  unpublishContent,
  updateSEOSettings,
  getPublishedContentByType
} from '../controllers/contentController';
// import { authenticateToken } from '../middleware/auth'; 

const router = express.Router();

// Public routes
router.get('/public/type/:type', getPublishedContentByType); // Get published content by type
router.get('/public/slug/:slug', getContentBySlug); // Get content by slug

// Admin routes (protected)
// router.use(authenticateToken); // Uncomment when auth middleware is ready

// Main CRUD operations
router.get('/', getAllContent);
router.get('/:id', getContentById);
router.post('/', createContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

// Content filtering
router.get('/type/:type', getContentByType);

// Publishing operations
router.patch('/:id/publish', publishContent);
router.patch('/:id/unpublish', unpublishContent);

// SEO management
router.put('/:id/seo', updateSEOSettings);

export default router;