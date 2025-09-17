"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpublishContactSocial = exports.publishContactSocial = exports.removeSocialMediaLink = exports.updateSocialMediaLink = exports.addSocialMediaLink = exports.removeContactDetail = exports.updateContactDetail = exports.addContactDetail = exports.toggleContactSocialStatus = exports.deleteContactSocial = exports.updateContactSocial = exports.createContactSocial = exports.getPublishedContactSocial = exports.getContactSocialById = exports.getAllContactSocial = void 0;
const ContactSocial_1 = __importDefault(require("../models/ContactSocial"));
const constants_1 = require("../utils/constants");
const constants_2 = require("../utils/constants");
const uuid_1 = require("uuid");
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
        const existing = await ContactSocial_1.default.findOne(query);
        if (!existing) {
            return slug;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};
// Get all contact social records (Admin)
const getAllContactSocial = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", isPublished, sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { "contactDetails.label": { $regex: search, $options: "i" } },
                { "socialMediaLinks.label": { $regex: search, $options: "i" } },
            ];
        }
        if (isPublished !== undefined) {
            query.isPublished = isPublished === "true";
        }
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
        const [contactSocialRecords, totalRecords] = await Promise.all([
            ContactSocial_1.default.find(query)
                .populate("createdBy", "username email")
                .populate("lastModifiedBy", "username email")
                .sort(sort)
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            ContactSocial_1.default.countDocuments(query),
        ]);
        const totalPages = Math.ceil(totalRecords / limitNumber);
        const responseData = {
            contactSocialRecords,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalRecords,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
            },
        };
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, responseData));
    }
    catch (error) {
        console.error("Error fetching contact social records:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getAllContactSocial = getAllContactSocial;
// Get contact social by ID (Public)
const getContactSocialById = async (req, res) => {
    try {
        const { id } = req.params;
        const contactSocial = await ContactSocial_1.default.findById(id)
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email")
            .lean();
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, contactSocial));
    }
    catch (error) {
        console.error("Error fetching contact social by ID:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContactSocialById = getContactSocialById;
// Get published contact social (Public)
const getPublishedContactSocial = async (req, res) => {
    try {
        const contactSocial = await ContactSocial_1.default.findOne({ isPublished: true })
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email")
            .lean();
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "No published contact social information found"));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, contactSocial));
    }
    catch (error) {
        console.error("Error fetching published contact social:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getPublishedContactSocial = getPublishedContactSocial;
// Create contact social (Admin)
const createContactSocial = async (req, res) => {
    try {
        const { title = "Contact & Social Media Information", contactDetails = [], socialMediaLinks = [], isPublished = false, publishedAt, version = "1.0", } = req.body;
        // Check if there's already a published record when trying to publish
        if (isPublished) {
            const existingPublished = await ContactSocial_1.default.findOne({ isPublished: true });
            if (existingPublished) {
                return res
                    .status(constants_1.RESPONSE_CODES.CONFLICT)
                    .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, "A published contact social record already exists. Only one can be published at a time."));
            }
        }
        // Generate unique slug from title
        const slug = await generateUniqueSlug(title);
        // Add IDs to contact details and social media links if not present
        const processedContactDetails = contactDetails.map((detail) => ({
            ...detail,
            id: detail.id || (0, uuid_1.v4)(),
        }));
        const processedSocialMediaLinks = socialMediaLinks.map((link) => ({
            ...link,
            id: link.id || (0, uuid_1.v4)(),
        }));
        const newContactSocial = new ContactSocial_1.default({
            title,
            slug,
            contactDetails: processedContactDetails,
            socialMediaLinks: processedSocialMediaLinks,
            isPublished,
            publishedAt: isPublished ? publishedAt || new Date() : null,
            version,
            createdBy: req.user?.id,
            lastModifiedBy: req.user?.id,
        });
        const savedContactSocial = await newContactSocial.save();
        await savedContactSocial.populate("createdBy", "username email");
        await savedContactSocial.populate("lastModifiedBy", "username email");
        res
            .status(constants_1.RESPONSE_CODES.CREATED)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CREATED, constants_1.RESPONSE_MESSAGES.CREATED, savedContactSocial));
    }
    catch (error) {
        console.error("Error creating contact social:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res
                .status(constants_1.RESPONSE_CODES.CONFLICT)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Contact social with this ${field} already exists`));
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.createContactSocial = createContactSocial;
// Update contact social (Admin)
const updateContactSocial = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        // Remove fields that shouldn't be updated directly
        delete updateData.createdBy;
        delete updateData.createdAt;
        // Set last modified info
        updateData.lastModifiedBy = req.user?.id;
        updateData.updatedAt = new Date();
        // If publishing, check for existing published record
        if (updateData.isPublished) {
            const existingPublished = await ContactSocial_1.default.findOne({
                isPublished: true,
                _id: { $ne: id },
            });
            if (existingPublished) {
                return res
                    .status(constants_1.RESPONSE_CODES.CONFLICT)
                    .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, "A published contact social record already exists. Only one can be published at a time."));
            }
            updateData.publishedAt = updateData.publishedAt || new Date();
        }
        // Update slug if title is changed
        if (updateData.title) {
            updateData.slug = await generateUniqueSlug(updateData.title, id);
        }
        // Process contact details and social media links to ensure they have IDs
        if (updateData.contactDetails) {
            updateData.contactDetails = updateData.contactDetails.map((detail) => ({
                ...detail,
                id: detail.id || (0, uuid_1.v4)(),
            }));
        }
        if (updateData.socialMediaLinks) {
            updateData.socialMediaLinks = updateData.socialMediaLinks.map((link) => ({
                ...link,
                id: link.id || (0, uuid_1.v4)(),
            }));
        }
        const updatedContactSocial = await ContactSocial_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email");
        if (!updatedContactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.UPDATED, updatedContactSocial));
    }
    catch (error) {
        console.error("Error updating contact social:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res
                .status(constants_1.RESPONSE_CODES.CONFLICT)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `Contact social with this ${field} already exists`));
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateContactSocial = updateContactSocial;
// Delete contact social (Admin)
const deleteContactSocial = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedContactSocial = await ContactSocial_1.default.findByIdAndDelete(id);
        if (!deletedContactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Contact social deleted successfully", { id }));
    }
    catch (error) {
        console.error("Error deleting contact social:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.deleteContactSocial = deleteContactSocial;
// Toggle publish status (Admin)
const toggleContactSocialStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublished } = req.body;
        // If publishing, check for existing published record
        if (isPublished) {
            const existingPublished = await ContactSocial_1.default.findOne({
                isPublished: true,
                _id: { $ne: id },
            });
            if (existingPublished) {
                return res
                    .status(constants_1.RESPONSE_CODES.CONFLICT)
                    .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, "A published contact social record already exists. Only one can be published at a time."));
            }
        }
        const updateData = {
            isPublished,
            lastModifiedBy: req.user?.id,
            updatedAt: new Date(),
        };
        if (isPublished) {
            updateData.publishedAt = new Date();
        }
        const updatedContactSocial = await ContactSocial_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate("createdBy", "username email")
            .populate("lastModifiedBy", "username email");
        if (!updatedContactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, `Contact social ${isPublished ? "published" : "unpublished"} successfully`, updatedContactSocial));
    }
    catch (error) {
        console.error("Error toggling contact social status:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.toggleContactSocialStatus = toggleContactSocialStatus;
// ===== CONTACT DETAILS MANAGEMENT =====
// Add contact detail
const addContactDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const contactDetail = {
            ...req.body,
            id: req.body.id || (0, uuid_1.v4)(),
        };
        const contactSocial = await ContactSocial_1.default.findById(id);
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact social record not found"));
        }
        contactSocial.contactDetails.push(contactDetail);
        contactSocial.lastModifiedBy = req.user?.id;
        contactSocial.updatedAt = new Date();
        await contactSocial.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Contact detail added successfully", contactDetail));
    }
    catch (error) {
        console.error("Error adding contact detail:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.addContactDetail = addContactDetail;
// Update contact detail
const updateContactDetail = async (req, res) => {
    try {
        const { id, detailId } = req.params;
        const updateData = req.body;
        const contactSocial = await ContactSocial_1.default.findById(id);
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact social record not found"));
        }
        const detailIndex = contactSocial.contactDetails.findIndex((detail) => detail.id === detailId);
        if (detailIndex === -1) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact detail not found"));
        }
        contactSocial.contactDetails[detailIndex] = {
            ...contactSocial.contactDetails[detailIndex],
            ...updateData,
            id: detailId, // Preserve the ID
        };
        contactSocial.lastModifiedBy = req.user?.id;
        contactSocial.updatedAt = new Date();
        await contactSocial.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Contact detail updated successfully", contactSocial.contactDetails[detailIndex]));
    }
    catch (error) {
        console.error("Error updating contact detail:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateContactDetail = updateContactDetail;
// Remove contact detail
const removeContactDetail = async (req, res) => {
    try {
        const { id, detailId } = req.params;
        const contactSocial = await ContactSocial_1.default.findById(id);
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact social record not found"));
        }
        const initialLength = contactSocial.contactDetails.length;
        contactSocial.contactDetails = contactSocial.contactDetails.filter((detail) => detail.id !== detailId);
        if (contactSocial.contactDetails.length === initialLength) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact detail not found"));
        }
        contactSocial.lastModifiedBy = req.user?.id;
        contactSocial.updatedAt = new Date();
        await contactSocial.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Contact detail removed successfully", { id: detailId }));
    }
    catch (error) {
        console.error("Error removing contact detail:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.removeContactDetail = removeContactDetail;
// ===== SOCIAL MEDIA MANAGEMENT =====
// Add social media link
const addSocialMediaLink = async (req, res) => {
    try {
        const { id } = req.params;
        const socialMediaLink = {
            ...req.body,
            id: req.body.id || (0, uuid_1.v4)(),
        };
        const contactSocial = await ContactSocial_1.default.findById(id);
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact social record not found"));
        }
        contactSocial.socialMediaLinks.push(socialMediaLink);
        contactSocial.lastModifiedBy = req.user?.id;
        contactSocial.updatedAt = new Date();
        await contactSocial.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Social media link added successfully", socialMediaLink));
    }
    catch (error) {
        console.error("Error adding social media link:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.addSocialMediaLink = addSocialMediaLink;
// Update social media link
const updateSocialMediaLink = async (req, res) => {
    try {
        const { id, linkId } = req.params;
        const updateData = req.body;
        const contactSocial = await ContactSocial_1.default.findById(id);
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact social record not found"));
        }
        const linkIndex = contactSocial.socialMediaLinks.findIndex((link) => link.id === linkId);
        if (linkIndex === -1) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Social media link not found"));
        }
        contactSocial.socialMediaLinks[linkIndex] = {
            ...contactSocial.socialMediaLinks[linkIndex],
            ...updateData,
            id: linkId, // Preserve the ID
        };
        contactSocial.lastModifiedBy = req.user?.id;
        contactSocial.updatedAt = new Date();
        await contactSocial.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Social media link updated successfully", contactSocial.socialMediaLinks[linkIndex]));
    }
    catch (error) {
        console.error("Error updating social media link:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateSocialMediaLink = updateSocialMediaLink;
// Remove social media link
const removeSocialMediaLink = async (req, res) => {
    try {
        const { id, linkId } = req.params;
        const contactSocial = await ContactSocial_1.default.findById(id);
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact social record not found"));
        }
        const initialLength = contactSocial.socialMediaLinks.length;
        contactSocial.socialMediaLinks = contactSocial.socialMediaLinks.filter((link) => link.id !== linkId);
        if (contactSocial.socialMediaLinks.length === initialLength) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Social media link not found"));
        }
        contactSocial.lastModifiedBy = req.user?.id;
        contactSocial.updatedAt = new Date();
        await contactSocial.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Social media link removed successfully", { id: linkId }));
    }
    catch (error) {
        console.error("Error removing social media link:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.removeSocialMediaLink = removeSocialMediaLink;
// Publish contact social record
const publishContactSocial = async (req, res) => {
    try {
        const { id } = req.params;
        const contactSocial = await ContactSocial_1.default.findById(id);
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact social record not found", null));
        }
        contactSocial.isPublished = true;
        contactSocial.publishedAt = new Date();
        contactSocial.lastModifiedBy = req.user?.id;
        await contactSocial.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Contact social record published successfully", contactSocial));
    }
    catch (error) {
        console.error("Error publishing contact social record:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, null));
    }
};
exports.publishContactSocial = publishContactSocial;
// Unpublish contact social record
const unpublishContactSocial = async (req, res) => {
    try {
        const { id } = req.params;
        const contactSocial = await ContactSocial_1.default.findById(id);
        if (!contactSocial) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Contact social record not found", null));
        }
        contactSocial.isPublished = false;
        contactSocial.lastModifiedBy = req.user?.id;
        await contactSocial.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Contact social record unpublished successfully", contactSocial));
    }
    catch (error) {
        console.error("Error unpublishing contact social record:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_2.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, null));
    }
};
exports.unpublishContactSocial = unpublishContactSocial;
//# sourceMappingURL=contactSocialController.js.map