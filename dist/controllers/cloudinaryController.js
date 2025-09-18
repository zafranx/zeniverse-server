"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudinaryResourcesByType = exports.getCloudinaryResourcesByFolder = exports.getCloudinaryFolders = exports.searchCloudinaryMedia = exports.getCloudinaryResources = void 0;
const multer_1 = require("../utils/multer");
const constants_1 = require("../utils/constants");
// Get all Cloudinary resources
const getCloudinaryResources = async (req, res) => {
    try {
        const { resource_type = 'image', type = 'upload', max_results = 30, next_cursor, prefix, tags, sort_by = 'created_at', direction = 'desc' } = req.query;
        // Validate resource_type
        const validResourceTypes = ['image', 'video', 'raw'];
        const resourceType = validResourceTypes.includes(resource_type)
            ? resource_type
            : 'image';
        const searchParams = {
            resource_type: resourceType,
            type,
            max_results: parseInt(max_results),
            sort_by: `${sort_by}:${direction}`,
        };
        if (next_cursor)
            searchParams.next_cursor = next_cursor;
        if (prefix)
            searchParams.prefix = prefix;
        if (tags) {
            searchParams.tags = Array.isArray(tags) ? tags : [tags];
        }
        const result = await multer_1.cloudinary.api.resources(searchParams);
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            resources: result.resources || [],
            next_cursor: result.next_cursor,
            total_count: result.total_count || 0,
        }));
    }
    catch (error) {
        console.error('Cloudinary API Error:', error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, 'Failed to fetch Cloudinary resources', { error: error.message }));
    }
};
exports.getCloudinaryResources = getCloudinaryResources;
// Search Cloudinary media
const searchCloudinaryMedia = async (req, res) => {
    try {
        const { query, resource_type = 'image', max_results = 30, next_cursor, sort_by = 'created_at', direction = 'desc' } = req.query;
        if (!query) {
            res.status(constants_1.RESPONSE_CODES.BAD_REQUEST).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, 'Search query is required'));
            return;
        }
        const searchParams = {
            expression: `resource_type:${resource_type} AND ${query}`,
            max_results: parseInt(max_results),
            sort_by: `${sort_by}:${direction}`,
        };
        if (next_cursor)
            searchParams.next_cursor = next_cursor;
        const result = await multer_1.cloudinary.search
            .expression(searchParams.expression)
            .max_results(searchParams.max_results)
            // .sort_by(searchParams.sort_by)
            .sort_by(sort_by, direction)
            .execute();
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            resources: result.resources,
            next_cursor: result.next_cursor,
            total_count: result.total_count,
        }));
    }
    catch (error) {
        console.error('Cloudinary Search Error:', error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, 'Failed to search Cloudinary media'));
    }
};
exports.searchCloudinaryMedia = searchCloudinaryMedia;
// Get Cloudinary folders
const getCloudinaryFolders = async (req, res) => {
    try {
        const result = await multer_1.cloudinary.api.root_folders();
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            folders: result.folders,
        }));
    }
    catch (error) {
        console.error('Cloudinary Folders Error:', error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, 'Failed to fetch Cloudinary folders'));
    }
};
exports.getCloudinaryFolders = getCloudinaryFolders;
// Get resources by folder
const getCloudinaryResourcesByFolder = async (req, res) => {
    try {
        const { folder } = req.params;
        const { resource_type = 'image', max_results = 30, next_cursor, sort_by = 'created_at', direction = 'desc' } = req.query;
        const searchParams = {
            type: 'upload',
            prefix: folder,
            resource_type,
            max_results: parseInt(max_results),
            sort_by: `${sort_by}:${direction}`,
        };
        if (next_cursor)
            searchParams.next_cursor = next_cursor;
        const result = await multer_1.cloudinary.api.resources(searchParams);
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            resources: result.resources,
            next_cursor: result.next_cursor,
            total_count: result.total_count,
        }));
    }
    catch (error) {
        console.error('Cloudinary Folder Resources Error:', error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, 'Failed to fetch folder resources'));
    }
};
exports.getCloudinaryResourcesByFolder = getCloudinaryResourcesByFolder;
// Get resources by type
const getCloudinaryResourcesByType = async (req, res) => {
    try {
        const { resourceType } = req.params;
        const { max_results = 30, next_cursor, sort_by = 'created_at', direction = 'desc' } = req.query;
        const searchParams = {
            resource_type: resourceType,
            type: 'upload',
            max_results: parseInt(max_results),
            sort_by: `${sort_by}:${direction}`,
        };
        if (next_cursor)
            searchParams.next_cursor = next_cursor;
        const result = await multer_1.cloudinary.api.resources(searchParams);
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            resources: result.resources,
            next_cursor: result.next_cursor,
            total_count: result.total_count,
        }));
    }
    catch (error) {
        console.error('Cloudinary Type Resources Error:', error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, 'Failed to fetch resources by type'));
    }
};
exports.getCloudinaryResourcesByType = getCloudinaryResourcesByType;
//# sourceMappingURL=cloudinaryController.js.map