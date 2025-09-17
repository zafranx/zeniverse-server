"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSEOSettings = exports.getSEOSettings = exports.updateSocialMediaLinks = exports.getSocialMediaLinks = exports.updateContactDetails = exports.getContactDetails = exports.updateContactInfo = exports.getContactInfo = exports.toggleContentStatus = exports.deleteContent = exports.updateContent = exports.createContent = exports.getContentBySlug = exports.getContentById = exports.getContentByType = exports.getAllContent = void 0;
const ContentManagement_1 = __importDefault(require("../models/ContentManagement"));
const constants_1 = require("../utils/constants");
// Helper function to generate unique slug
const generateUniqueSlug = async (title, excludeId) => {
    let baseSlug = (0, constants_1.__generateSlug)(title);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const query = { slug };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const existingSlug = await ContentManagement_1.default.findOne(query);
        if (!existingSlug) {
            break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
};
// Get all content with filters and pagination (Public)
const getAllContent = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, isPublished, search, sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        // Build filter object
        const filter = {};
        if (type) {
            filter.type = type;
        }
        if (isPublished !== undefined) {
            filter.isPublished = isPublished === "true";
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { "seo.metaDescription": { $regex: search, $options: "i" } },
            ];
        }
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        const content = await ContentManagement_1.default.find(filter)
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email")
            .sort(sort)
            .skip(skip)
            .limit(limitNumber)
            .lean();
        const totalContent = await ContentManagement_1.default.countDocuments(filter);
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
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, responseData));
    }
    catch (error) {
        console.error("Error fetching content:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getAllContent = getAllContent;
// Get content by type (Public)
const getContentByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { isPublished = "true" } = req.query;
        const filter = { type };
        if (isPublished === "true") {
            filter.isPublished = true;
        }
        const content = await ContentManagement_1.default.findOne(filter)
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email")
            .lean();
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, `${type} content not found`));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, content));
    }
    catch (error) {
        console.error("Error fetching content by type:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContentByType = getContentByType;
// Get content by ID (Public)
const getContentById = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await ContentManagement_1.default.findById(id)
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email")
            .lean();
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, content));
    }
    catch (error) {
        console.error("Error fetching content by ID:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContentById = getContentById;
// Get content by slug (Public)
const getContentBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const content = await ContentManagement_1.default.findOne({
            slug,
            isPublished: true,
        })
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email")
            .lean();
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Content not found"));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, content));
    }
    catch (error) {
        console.error("Error fetching content by slug:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContentBySlug = getContentBySlug;
// Create new content (Admin)
const createContent = async (req, res) => {
    try {
        const { type, title, content, sections, contactDetails, socialMediaLinks, seo, isPublished = false, publishedAt, version = "1.0", } = req.body;
        // Validate required fields
        const requiredFields = ["type", "title"];
        const missing = requiredFields.filter((field) => !req.body[field]);
        if (missing.length > 0) {
            return res
                .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, `Missing required fields: ${missing.join(", ")}`));
        }
        // Validate content type
        const validTypes = [
            "privacy_policy",
            "terms_of_service",
            "contact_details",
            "about_us",
            "faq",
        ];
        if (!validTypes.includes(type)) {
            return res
                .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, `Invalid content type. Must be one of: ${validTypes.join(", ")}`));
        }
        // Check if active content of this type already exists
        if (isPublished) {
            const existingActiveContent = await ContentManagement_1.default.findOne({
                type,
                isPublished: true,
            });
            if (existingActiveContent) {
                return res
                    .status(constants_1.RESPONSE_CODES.CONFLICT)
                    .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Active ${type} content already exists. Only one active content per type is allowed.`));
            }
        }
        // Generate unique slug from title
        const slug = await generateUniqueSlug(title);
        // Remove the duplicate slug check since generateUniqueSlug handles it
        // const existingSlug = await ContentManagement.findOne({ slug });
        // if (existingSlug) {
        //   return res
        //     .status(RESPONSE_CODES.CONFLICT)
        //     .json(
        //       __requestResponse(
        //         RESPONSE_CODES.CONFLICT,
        //         "Content with this title already exists"
        //       )
        //     );
        // }
        const newContent = new ContentManagement_1.default({
            type,
            title,
            slug,
            content,
            sections,
            contactDetails,
            socialMediaLinks,
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
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CREATED, constants_1.RESPONSE_MESSAGES.CREATED, savedContent));
    }
    catch (error) {
        console.error("Error creating content:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res
                .status(constants_1.RESPONSE_CODES.CONFLICT)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Content with this ${field} already exists`));
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
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
            const currentContent = await ContentManagement_1.default.findById(id);
            if (!currentContent) {
                return res
                    .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                    .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
            }
            const existingActiveContent = await ContentManagement_1.default.findOne({
                type: currentContent.type,
                isPublished: true,
                _id: { $ne: id },
            });
            if (existingActiveContent) {
                return res
                    .status(constants_1.RESPONSE_CODES.CONFLICT)
                    .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Active ${currentContent.type} content already exists. Only one active content per type is allowed.`));
            }
            updateData.publishedAt = updateData.publishedAt || new Date();
        }
        // Update slug if title is changed
        if (updateData.title) {
            updateData.slug = await generateUniqueSlug(updateData.title, id);
            // Remove the duplicate slug check
            // const existingSlug = await ContentManagement.findOne({
            //   slug: updateData.slug,
            //   _id: { $ne: id },
            // });
            // if (existingSlug) {
            //   return res
            //     .status(RESPONSE_CODES.CONFLICT)
            //     .json(
            //       __requestResponse(
            //         RESPONSE_CODES.CONFLICT,
            //         "Content with this title already exists"
            //       )
            //     );
            // }
        }
        const updatedContent = await ContentManagement_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email");
        if (!updatedContent) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.UPDATED, updatedContent));
    }
    catch (error) {
        console.error("Error updating content:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res
                .status(constants_1.RESPONSE_CODES.CONFLICT)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Content with this ${field} already exists`));
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateContent = updateContent;
// Delete content (Admin)
const deleteContent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedContent = await ContentManagement_1.default.findByIdAndDelete(id);
        if (!deletedContent) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.DELETED, {
            id: deletedContent._id,
        }));
    }
    catch (error) {
        console.error("Error deleting content:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.deleteContent = deleteContent;
// Toggle content status (Admin)
const toggleContentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await ContentManagement_1.default.findById(id);
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        const newStatus = !content.isPublished;
        // If publishing, check for existing active content
        if (newStatus) {
            const existingActiveContent = await ContentManagement_1.default.findOne({
                type: content.type,
                isPublished: true,
                _id: { $ne: id },
            });
            if (existingActiveContent) {
                return res
                    .status(constants_1.RESPONSE_CODES.CONFLICT)
                    .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Active ${content.type} content already exists. Only one active content per type is allowed.`));
            }
        }
        const updatedContent = await ContentManagement_1.default.findByIdAndUpdate(id, {
            isPublished: newStatus,
            publishedAt: newStatus ? new Date() : null,
            lastModifiedBy: req.user?.id,
            updatedAt: new Date(),
        }, { new: true })
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email");
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, `Content ${newStatus ? "published" : "unpublished"} successfully`, updatedContent));
    }
    catch (error) {
        console.error("Error toggling content status:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.toggleContentStatus = toggleContentStatus;
// ===== UNIFIED CONTACT INFO MANAGEMENT =====
// Get all contact info (both contact details and social media)
const getContactInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // Optional filter by type
        const content = await ContentManagement_1.default.findById(id).select('contactInfo');
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Content not found"));
        }
        let contactInfo = content.contactInfo || [];
        // Filter by type if specified
        if (type) {
            contactInfo = contactInfo.filter(info => info.type === type);
        }
        // Separate contact details and social media for backward compatibility
        const contactDetails = contactInfo.filter(info => info.type !== 'social');
        const socialMedia = contactInfo.filter(info => info.type === 'social');
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            contactInfo,
            contactDetails, // For backward compatibility
            socialMedia, // For backward compatibility
        }));
    }
    catch (error) {
        console.error("Error fetching contact info:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContactInfo = getContactInfo;
// Update contact info (unified endpoint)
const updateContactInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { contactInfo } = req.body;
        const updatedContent = await ContentManagement_1.default.findByIdAndUpdate(id, {
            contactInfo,
            lastModifiedBy: req.user?.id,
            updatedAt: new Date(),
        }, { new: true, runValidators: true }).select('contactInfo');
        if (!updatedContent) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        const contactInfo_result = updatedContent.contactInfo || [];
        const contactDetails = contactInfo_result.filter(info => info.type !== 'social');
        const socialMedia = contactInfo_result.filter(info => info.type === 'social');
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Contact information updated successfully", {
            contactInfo: contactInfo_result,
            contactDetails,
            socialMedia,
        }));
    }
    catch (error) {
        console.error("Error updating contact info:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateContactInfo = updateContactInfo;
// Legacy endpoints for backward compatibility
const getContactDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await ContentManagement_1.default.findById(id).select('contactInfo');
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Content not found"));
        }
        const contactDetails = (content.contactInfo || []).filter(info => info.type !== 'social');
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, contactDetails));
    }
    catch (error) {
        console.error("Error fetching contact details:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContactDetails = getContactDetails;
const updateContactDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { contactDetails } = req.body;
        // Get existing contact info
        const content = await ContentManagement_1.default.findById(id);
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        // Keep social media, replace contact details
        const socialMedia = (content.contactInfo || []).filter(info => info.type === 'social');
        const newContactInfo = [...contactDetails, ...socialMedia];
        const updatedContent = await ContentManagement_1.default.findByIdAndUpdate(id, {
            contactInfo: newContactInfo,
            lastModifiedBy: req.user?.id,
            updatedAt: new Date(),
        }, { new: true, runValidators: true }).select('contactInfo');
        const updatedContactDetails = (updatedContent?.contactInfo || []).filter(info => info.type !== 'social');
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Contact details updated successfully", updatedContactDetails));
    }
    catch (error) {
        console.error("Error updating contact details:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateContactDetails = updateContactDetails;
const getSocialMediaLinks = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await ContentManagement_1.default.findById(id).select('contactInfo');
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Content not found"));
        }
        const socialMediaLinks = (content.contactInfo || []).filter(info => info.type === 'social');
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, socialMediaLinks));
    }
    catch (error) {
        console.error("Error fetching social media links:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getSocialMediaLinks = getSocialMediaLinks;
const updateSocialMediaLinks = async (req, res) => {
    try {
        const { id } = req.params;
        const { socialMediaLinks } = req.body;
        // Get existing contact info
        const content = await ContentManagement_1.default.findById(id);
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        // Keep contact details, replace social media
        const contactDetails = (content.contactInfo || []).filter(info => info.type !== 'social');
        const newContactInfo = [...contactDetails, ...socialMediaLinks];
        const updatedContent = await ContentManagement_1.default.findByIdAndUpdate(id, {
            contactInfo: newContactInfo,
            lastModifiedBy: req.user?.id,
            updatedAt: new Date(),
        }, { new: true, runValidators: true }).select('contactInfo');
        const updatedSocialMedia = (updatedContent?.contactInfo || []).filter(info => info.type === 'social');
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Social media links updated successfully", updatedSocialMedia));
    }
    catch (error) {
        console.error("Error updating social media links:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateSocialMediaLinks = updateSocialMediaLinks;
// ===== SEO SETTINGS MANAGEMENT =====
// Get SEO settings for a content item
const getSEOSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await ContentManagement_1.default.findById(id).select('seo');
        if (!content) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Content not found"));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, content.seo || {}));
    }
    catch (error) {
        console.error("Error fetching SEO settings:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getSEOSettings = getSEOSettings;
// Update SEO settings for a content item
const updateSEOSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const { seo } = req.body;
        const updatedContent = await ContentManagement_1.default.findByIdAndUpdate(id, {
            seo,
            lastModifiedBy: req.user?.id,
            updatedAt: new Date(),
        }, { new: true, runValidators: true }).select('seo');
        if (!updatedContent) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "SEO settings updated successfully", updatedContent.seo));
    }
    catch (error) {
        console.error("Error updating SEO settings:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateSEOSettings = updateSEOSettings;
//# sourceMappingURL=contentManagementController.js.map