import express from 'express';
import { 
  getCloudinaryResources, 
  searchCloudinaryMedia, 
  getCloudinaryFolders,
  getCloudinaryResourcesByFolder,
  getCloudinaryResourcesByType 
} from '../controllers/cloudinaryController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);

// Get all resources
router.get('/resources', getCloudinaryResources);

// Search resources
router.get('/search', searchCloudinaryMedia);

// Get folders
router.get('/folders', getCloudinaryFolders);

// Get resources by folder
router.get('/folder/:folder', getCloudinaryResourcesByFolder);

// Get resources by type
router.get('/type/:resourceType', getCloudinaryResourcesByType);

export default router;