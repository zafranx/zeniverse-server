"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedContentByType = exports.unpublishContent = exports.publishContent = exports.updateSEOSettings = exports.getSEOSettings = exports.toggleContentStatus = exports.deleteContent = exports.updateContent = exports.createContent = exports.getContentBySlug = exports.getContentByType = exports.getContentById = exports.getAllContent = void 0;
const Content_1 = __importDefault(require("../models/Content"));
const constants_1 = require("../utils/constants");
const constants_2 = require("../utils/constants");
// Helper function to generate unique slug
const generateUniqueSlug = async (title, excludeId) => {
    let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const query = { slug };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const existing = await Content_1.default.findOne(query);
        if (!existing) {
            return slug;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};
// Get all content (Admin)
const getAllContent = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", type, isPublished, sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { "sections.title": { $regex: search, $options: "i" } },
                { "sections.content": { $regex: search, $options: "i" } },
            ];
        }
        if (type) {
            query.type = type;
        }
        if (isPublished !== undefined) {
            query.isPublished = isPublished === "true";
        }
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
        const [content, totalContent] = await Promise.all([
            Content_1.default.find(query)
                .populate("createdBy", "username email")
                .populate("lastModifiedBy", "username email")
                .sort(sort)
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            Content_1.default.countDocuments(query),
        ]);
        const totalPages = Math.ceil(totalContent / limitNumber);
        const responseData = {
            content,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalContent,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
            },
        };
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, responseData));
    }
    catch (error) {
        console.error("Error fetching content:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getAllContent = getAllContent;
// Get content by ID (Public)
const getContentById = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content_1.default.findById(id)
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email")
            .lean();
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, content));
    }
    catch (error) {
        console.error("Error fetching content by ID:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContentById = getContentById;
// Get content by type and published status (Public)
const getContentByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { published = "true" } = req.query;
        const query = { type };
        if (published === "true") {
            query.isPublished = true;
        }
        const content = await Content_1.default.findOne(query)
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email")
            .lean();
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, `No ${published === "true" ? "published " : ""}content found for type: ${type}`));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, content));
    }
    catch (error) {
        console.error("Error fetching content by type:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContentByType = getContentByType;
// Get content by slug (Public)
const getContentBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { published = "true" } = req.query;
        const query = { slug };
        if (published === "true") {
            query.isPublished = true;
        }
        const content = await Content_1.default.findOne(query)
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email")
            .lean();
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, `No ${published === "true" ? "published " : ""}content found for slug: ${slug}`));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, content));
    }
    catch (error) {
        console.error("Error fetching content by slug:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContentBySlug = getContentBySlug;
// Create content (Admin)
const createContent = async (req, res) => {
    try {
        const { type, title, content, sections = [], seo, isPublished = false, publishedAt, version = "1.0", } = req.body;
        // Check if there's already a published content of the same type when trying to publish
        if (isPublished) {
            const existingActiveContent = await Content_1.default.findOne({
                type,
                isPublished: true,
            });
            if (existingActiveContent) {
                return res
                    .status(constants_1.RESPONSE_CODES.CONFLICT)
                    .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Active ${type} content already exists. Only one active content per type is allowed.`));
            }
        }
        // Generate unique slug from title
        const slug = await generateUniqueSlug(title);
        const newContent = new Content_1.default({
            type,
            title,
            slug,
            content,
            sections,
            seo,
            isPublished,
            publishedAt: isPublished ? publishedAt || new Date() : null,
            version,
            createdBy: req.user?.id,
            lastModifiedBy: req.user?.id,
        });
        const savedContent = await newContent.save();
        await savedContent.populate("createdBy", "username email");
        await savedContent.populate("lastModifiedBy", "username email");
        res
            .status(constants_1.RESPONSE_CODES.CREATED)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CREATED, constants_1.RESPONSE_MESSAGES.CREATED, savedContent));
    }
    catch (error) {
        console.error("Error creating content:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res
                .status(constants_1.RESPONSE_CODES.CONFLICT)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Content with this ${field} already exists`));
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.createContent = createContent;
// Update content (Admin)
const updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        // Remove fields that shouldn't be updated directly
        delete updateData.createdBy;
        delete updateData.createdAt;
        // Set last modified info
        updateData.lastModifiedBy = req.user?.id;
        updateData.updatedAt = new Date();
        // If publishing, check for existing active content
        if (updateData.isPublished) {
            const currentContent = await Content_1.default.findById(id);
            if (!currentContent) {
                return res
                    .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                    .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
            }
            const existingActiveContent = await Content_1.default.findOne({
                type: currentContent.type,
                isPublished: true,
                _id: { $ne: id },
            });
            if (existingActiveContent) {
                return res
                    .status(constants_1.RESPONSE_CODES.CONFLICT)
                    .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Active ${currentContent.type} content already exists. Only one active content per type is allowed.`));
            }
            updateData.publishedAt = updateData.publishedAt || new Date();
        }
        // Update slug if title is changed
        if (updateData.title) {
            updateData.slug = await generateUniqueSlug(updateData.title, id);
        }
        const updatedContent = await Content_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email");
        if (!updatedContent) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.UPDATED, updatedContent));
    }
    catch (error) {
        console.error("Error updating content:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res
                .status(constants_1.RESPONSE_CODES.CONFLICT)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Content with this ${field} already exists`));
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateContent = updateContent;
// Delete content (Admin)
const deleteContent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedContent = await Content_1.default.findByIdAndDelete(id);
        if (!deletedContent) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Content deleted successfully", { id }));
    }
    catch (error) {
        console.error("Error deleting content:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.deleteContent = deleteContent;
// Toggle publish status (Admin)
const toggleContentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublished } = req.body;
        // If publishing, check for existing active content
        if (isPublished) {
            const currentContent = await Content_1.default.findById(id);
            if (!currentContent) {
                return res
                    .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                    .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
            }
            const existingActiveContent = await Content_1.default.findOne({
                type: currentContent.type,
                isPublished: true,
                _id: { $ne: id },
            });
            if (existingActiveContent) {
                return res
                    .status(constants_1.RESPONSE_CODES.CONFLICT)
                    .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Active ${currentContent.type} content already exists. Only one active content per type is allowed.`));
            }
        } // <- This closing brace was missing!
        const updateData = {
            isPublished,
            lastModifiedBy: req.user?.id,
            updatedAt: new Date(),
        };
        if (isPublished) {
            updateData.publishedAt = new Date();
        }
        const updatedContent = await Content_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email");
        if (!updatedContent) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, `Content ${isPublished ? "published" : "unpublished"} successfully`, updatedContent));
    }
    catch (error) {
        console.error("Error toggling content status:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.toggleContentStatus = toggleContentStatus;
// ===== SEO SETTINGS MANAGEMENT =====
// Get SEO settings for a content item
const getSEOSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content_1.default.findById(id).select('seo');
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Content not found"));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, content.seo || {}));
    }
    catch (error) {
        console.error("Error fetching SEO settings:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getSEOSettings = getSEOSettings;
// Update SEO settings for a content item
const updateSEOSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const { seo } = req.body;
        const updatedContent = await Content_1.default.findByIdAndUpdate(id, {
            seo,
            lastModifiedBy: req.user?.id,
            updatedAt: new Date(),
        }, { new: true, runValidators: true }).select('seo');
        if (!updatedContent) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "SEO settings updated successfully", updatedContent.seo));
    }
    catch (error) {
        console.error("Error updating SEO settings:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateSEOSettings = updateSEOSettings;
// Publish content
const publishContent = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content_1.default.findById(id);
        if (!content) {
            return res.status(constants_1.RESPONSE_CODES.NOT_FOUND).json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND, null));
        }
        content.isPublished = true;
        content.publishedAt = new Date();
        content.lastModifiedBy = req.user?.id;
        content.lastModifiedAt = new Date();
        await content.save();
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Content published successfully", content));
    }
    catch (error) {
        console.error("Error publishing content:", error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, error.message, null));
    }
};
exports.publishContent = publishContent;
// Unpublish content
const unpublishContent = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content_1.default.findById(id);
        if (!content) {
            return res.status(constants_1.RESPONSE_CODES.NOT_FOUND).json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND, null));
        }
        content.isPublished = false;
        content.publishedAt = undefined;
        content.lastModifiedBy = req.user?.id;
        content.lastModifiedAt = new Date();
        await content.save();
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Content unpublished successfully", content));
    }
    catch (error) {
        console.error("Error unpublishing content:", error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, error.message, null));
    }
};
exports.unpublishContent = unpublishContent;
// Get published content by type (Public)
const getPublishedContentByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 10, search = "", sortBy = "publishedAt", sortOrder = "desc", } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        // Build query for published content only
        const query = {
            type,
            isPublished: true,
        };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { "sections.title": { $regex: search, $options: "i" } },
                { "sections.content": { $regex: search, $options: "i" } },
            ];
        }
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
        const [content, totalContent] = await Promise.all([
            Content_1.default.find(query)
                .select("-createdBy -lastModifiedBy -lastModifiedAt") // Hide admin fields for public
                .sort(sort)
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            Content_1.default.countDocuments(query),
        ]);
        const totalPages = Math.ceil(totalContent / limitNumber);
        const responseData = {
            content,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalContent,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
            },
        };
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, responseData));
    }
    catch (error) {
        console.error("Error fetching published content by type:", error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, error.message, null));
    }
};
exports.getPublishedContentByType = getPublishedContentByType;
//# sourceMappingURL=contentController.js.map