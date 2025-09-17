"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cloudinaryController_1 = require("../controllers/cloudinaryController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require admin authentication
router.use(auth_1.authenticateToken);
// Get all resources
router.get('/resources', cloudinaryController_1.getCloudinaryResources);
// Search resources
router.get('/search', cloudinaryController_1.searchCloudinaryMedia);
// Get folders
router.get('/folders', cloudinaryController_1.getCloudinaryFolders);
// Get resources by folder
router.get('/folder/:folder', cloudinaryController_1.getCloudinaryResourcesByFolder);
// Get resources by type
router.get('/type/:resourceType', cloudinaryController_1.getCloudinaryResourcesByType);
exports.default = router;
//# sourceMappingURL=cloudinaryRoutes.js.map