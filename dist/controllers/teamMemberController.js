"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTeamMemberStatus = exports.deleteTeamMember = exports.updateTeamMember = exports.createTeamMember = exports.getTeamMemberById = exports.getAllTeamMembersAdmin = exports.getAllTeamMembers = void 0;
const TeamMember_1 = __importDefault(require("../models/TeamMember"));
const multer_1 = require("../utils/multer");
const constants_1 = require("../utils/constants");
// Get all team members
const getAllTeamMembers = async (req, res) => {
    try {
        const teamMembers = await TeamMember_1.default.find({ isActive: true })
            .sort({ sort_order: 1, name: 1 })
            .lean();
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, teamMembers));
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Get team members error:", error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getAllTeamMembers = getAllTeamMembers;
// Get all team members (admin)
const getAllTeamMembersAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Build filter query
        const filterQuery = {};
        // Search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");
            filterQuery.$or = [
                { name: searchRegex },
                { role: searchRegex },
                { description: searchRegex },
            ];
        }
        // Status filter
        if (req.query.status && req.query.status !== "all") {
            filterQuery.isActive = req.query.status === "true";
        }
        const [teamMembers, total] = await Promise.all([
            TeamMember_1.default.find(filterQuery)
                .sort({ sort_order: 1, name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            TeamMember_1.default.countDocuments(filterQuery),
        ]);
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            teamMembers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        }));
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Get team members admin error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getAllTeamMembersAdmin = getAllTeamMembersAdmin;
// Get team member by ID
const getTeamMemberById = async (req, res) => {
    try {
        const teamMember = await TeamMember_1.default.findById(req.params.id).lean();
        if (!teamMember) {
            return res.status(constants_1.RESPONSE_CODES.NOT_FOUND).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, teamMember));
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Get team member by ID error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getTeamMemberById = getTeamMemberById;
// Create team member
const createTeamMember = async (req, res) => {
    try {
        const { name, role, description, sort_order, isActive, imageUrl } = req.body;
        // Handle image - either from file upload or Cloudinary URL
        let imageToSave = null;
        // Check for Cloudinary URL first (since you always use Cloudinary)
        if (imageUrl && typeof imageUrl === "string") {
            imageToSave = imageUrl;
        }
        else {
            // Fallback to file upload if no URL provided
            const files = req.files;
            const processedFiles = await (0, multer_1.processUploadedFiles)(req, files);
            imageToSave = processedFiles.image;
        }
        if (!imageToSave) {
            return res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Image is required"));
        }
        const newTeamMember = new TeamMember_1.default({
            name,
            role,
            description,
            image: imageToSave,
            sort_order: sort_order || 0,
            isActive: isActive !== undefined ? isActive : true,
        });
        await newTeamMember.save();
        res
            .status(constants_1.RESPONSE_CODES.CREATED)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CREATED, constants_1.RESPONSE_MESSAGES.CREATED, newTeamMember));
    }
    catch (error) {
        console.error("Create team member error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.createTeamMember = createTeamMember;
// Update team member
const updateTeamMember = async (req, res) => {
    try {
        const { name, role, description, sort_order, isActive } = req.body;
        const teamMember = await TeamMember_1.default.findById(req.params.id);
        if (!teamMember) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        // Process uploaded image if provided
        const files = req.files;
        const processedFiles = await (0, multer_1.processUploadedFiles)(req, files);
        // Update fields
        teamMember.name = name || teamMember.name;
        teamMember.role = role || teamMember.role;
        teamMember.description = description || teamMember.description;
        if (sort_order !== undefined) {
            teamMember.sort_order = sort_order;
        }
        if (isActive !== undefined) {
            teamMember.isActive = isActive;
        }
        // Update image if provided
        if (processedFiles.image) {
            // Delete old image if it's a Cloudinary URL
            if (teamMember.image && teamMember.image.includes("cloudinary")) {
                const publicId = (0, constants_1.__extractCloudinaryPublicId)(teamMember.image);
                if (publicId) {
                    await (0, constants_1.__deleteCloudinaryFile)(publicId);
                }
            }
            else if (teamMember.image) {
                // Delete local file
                await (0, constants_1.__deleteFile)(teamMember.image);
            }
            teamMember.image = processedFiles.image;
        }
        await teamMember.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.UPDATED, teamMember));
    }
    catch (error) {
        console.error("Update team member error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateTeamMember = updateTeamMember;
// Delete team member
const deleteTeamMember = async (req, res) => {
    try {
        const teamMember = await TeamMember_1.default.findById(req.params.id);
        if (!teamMember) {
            return res.status(constants_1.RESPONSE_CODES.NOT_FOUND).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        // Delete image if it's a Cloudinary URL
        if (teamMember.image && teamMember.image.includes('cloudinary')) {
            const publicId = (0, constants_1.__extractCloudinaryPublicId)(teamMember.image);
            if (publicId) {
                await (0, constants_1.__deleteCloudinaryFile)(publicId);
            }
        }
        else if (teamMember.image) {
            // Delete local file
            await (0, constants_1.__deleteFile)(teamMember.image);
        }
        await teamMember.deleteOne();
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.DELETED));
    }
    catch (error) {
        console.error("Delete team member error:", error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.deleteTeamMember = deleteTeamMember;
// Toggle team member active status
const toggleTeamMemberStatus = async (req, res) => {
    try {
        const teamMember = await TeamMember_1.default.findById(req.params.id);
        if (!teamMember) {
            return res.status(constants_1.RESPONSE_CODES.NOT_FOUND).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        teamMember.isActive = !teamMember.isActive;
        await teamMember.save();
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.UPDATED, { isActive: teamMember.isActive }));
    }
    catch (error) {
        console.error("Toggle team member status error:", error);
        res.status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.toggleTeamMemberStatus = toggleTeamMemberStatus;
//# sourceMappingURL=teamMemberController.js.map