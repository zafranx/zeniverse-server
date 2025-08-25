"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitiativeStats = exports.getInitiativesByStatus = exports.getFeaturedInitiatives = exports.deleteInitiative = exports.updateInitiative = exports.createInitiative = exports.getInitiativeById = exports.getAllInitiatives = void 0;
const Initiative_1 = __importDefault(require("../models/Initiative"));
const constants_1 = require("../utils/constants");
const getAllInitiatives = async (req, res) => {
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
                { title: searchRegex },
                { excerpt: searchRegex },
                { impact: searchRegex },
            ];
        }
        // Status filter
        if (req.query.status && req.query.status !== "all") {
            filterQuery.status = req.query.status;
        }
        // Category filter
        if (req.query.category && req.query.category !== "all") {
            filterQuery.category = req.query.category;
        }
        // Featured filter
        if (req.query.featured && req.query.featured !== "all") {
            filterQuery.featured = req.query.featured === "true";
        }
        const [initiatives, total] = await Promise.all([
            Initiative_1.default.find(filterQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Initiative_1.default.countDocuments(filterQuery),
        ]);
        // Get unique categories and authors for filters
        const [categories, authors] = await Promise.all([
            Initiative_1.default.distinct("category"),
            Initiative_1.default.distinct("author"),
        ]);
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            initiatives,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            filters: {
                categories: categories.filter(Boolean), // Remove empty values
                authors: authors.filter(Boolean),
            },
        }));
    }
    catch (error) {
        console.error("Get all initiatives error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getAllInitiatives = getAllInitiatives;
const getInitiativeById = async (req, res) => {
    try {
        const initiative = await Initiative_1.default.findById(req.params.id);
        if (!initiative) {
            res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Initiative not found"));
            return;
        }
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            initiative,
        }));
    }
    catch (error) {
        console.error("Get initiative by ID error:", error);
        // Handle invalid ObjectId error
        if (error.name === "CastError") {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Invalid initiative ID format"));
            return;
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getInitiativeById = getInitiativeById;
const createInitiative = async (req, res) => {
    try {
        const initiativeData = req.body;
        // Validate required fields
        if (!initiativeData.title || !initiativeData.author) {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Title and author are required fields"));
            return;
        }
        // Handle file uploads if present (for backward compatibility)
        if (req.files) {
            const files = req.files;
            if (files.image) {
                initiativeData.image = `/uploads/${files.image[0].filename}`;
            }
            if (files.heroImage) {
                initiativeData.heroImage = `/uploads/${files.heroImage[0].filename}`;
            }
        }
        const initiative = new Initiative_1.default(initiativeData);
        await initiative.save();
        res.status(constants_1.RESPONSE_CODES.CREATED).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CREATED, "Initiative created successfully", {
            initiative,
        }));
    }
    catch (error) {
        console.error("Create initiative error:", error);
        // Handle validation errors
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error).map((err) => err.message);
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, `Validation failed: ${validationErrors.join(", ")}`));
            return;
        }
        // Handle duplicate key error
        if (error.code === 11000) {
            res
                .status(constants_1.RESPONSE_CODES.CONFLICT)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, "Initiative with this title already exists"));
            return;
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.createInitiative = createInitiative;
const updateInitiative = async (req, res) => {
    try {
        const initiativeData = req.body;
        // Validate required fields if provided
        if (initiativeData.title && !initiativeData.title.trim()) {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Title cannot be empty"));
            return;
        }
        if (initiativeData.author && !initiativeData.author.trim()) {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Author cannot be empty"));
            return;
        }
        // Handle file uploads if present (for backward compatibility)
        if (req.files) {
            const files = req.files;
            if (files.image) {
                initiativeData.image = `/uploads/${files.image[0].filename}`;
            }
            if (files.heroImage) {
                initiativeData.heroImage = `/uploads/${files.heroImage[0].filename}`;
            }
        }
        const initiative = await Initiative_1.default.findByIdAndUpdate(req.params.id, initiativeData, { new: true, runValidators: true });
        if (!initiative) {
            res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Initiative not found"));
            return;
        }
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Initiative updated successfully", {
            initiative,
        }));
    }
    catch (error) {
        console.error("Update initiative error:", error);
        // Handle invalid ObjectId error
        if (error.name === "CastError") {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Invalid initiative ID format"));
            return;
        }
        // Handle validation errors
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error).map((err) => err.message);
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, `Validation failed: ${validationErrors.join(", ")}`));
            return;
        }
        // Handle duplicate key error
        if (error.code === 11000) {
            res
                .status(constants_1.RESPONSE_CODES.CONFLICT)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, "Initiative with this title already exists"));
            return;
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateInitiative = updateInitiative;
const deleteInitiative = async (req, res) => {
    try {
        const initiative = await Initiative_1.default.findByIdAndDelete(req.params.id);
        if (!initiative) {
            res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Initiative not found"));
            return;
        }
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Initiative deleted successfully", {
            deletedInitiative: {
                id: initiative._id,
                title: initiative.title,
            },
        }));
    }
    catch (error) {
        console.error("Delete initiative error:", error);
        // Handle invalid ObjectId error
        if (error.name === "CastError") {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Invalid initiative ID format"));
            return;
        }
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.deleteInitiative = deleteInitiative;
// Additional utility functions for advanced features
const getFeaturedInitiatives = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const featuredInitiatives = await Initiative_1.default.find({ featured: true })
            .sort({ createdAt: -1 })
            .limit(limit);
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            initiatives: featuredInitiatives,
            count: featuredInitiatives.length,
        }));
    }
    catch (error) {
        console.error("Get featured initiatives error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getFeaturedInitiatives = getFeaturedInitiatives;
const getInitiativesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ["Active", "In Progress", "Planned", "Completed"];
        if (!validStatuses.includes(status)) {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`));
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [initiatives, total] = await Promise.all([
            Initiative_1.default.find({ status })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Initiative_1.default.countDocuments({ status }),
        ]);
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            initiatives,
            status,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        }));
    }
    catch (error) {
        console.error("Get initiatives by status error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getInitiativesByStatus = getInitiativesByStatus;
const getInitiativeStats = async (req, res) => {
    try {
        const [totalInitiatives, activeInitiatives, inProgressInitiatives, plannedInitiatives, completedInitiatives, featuredInitiatives, categoryCounts,] = await Promise.all([
            Initiative_1.default.countDocuments(),
            Initiative_1.default.countDocuments({ status: "Active" }),
            Initiative_1.default.countDocuments({ status: "In Progress" }),
            Initiative_1.default.countDocuments({ status: "Planned" }),
            Initiative_1.default.countDocuments({ status: "Completed" }),
            Initiative_1.default.countDocuments({ featured: true }),
            Initiative_1.default.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);
        const stats = {
            total: totalInitiatives,
            byStatus: {
                active: activeInitiatives,
                inProgress: inProgressInitiatives,
                planned: plannedInitiatives,
                completed: completedInitiatives,
            },
            featured: featuredInitiatives,
            categories: categoryCounts.reduce((acc, item) => {
                acc[item._id || "Uncategorized"] = item.count;
                return acc;
            }, {}),
            completionRate: totalInitiatives > 0
                ? Math.round((completedInitiatives / totalInitiatives) * 100)
                : 0,
        };
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            stats,
        }));
    }
    catch (error) {
        console.error("Get initiative stats error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getInitiativeStats = getInitiativeStats;
//# sourceMappingURL=initiativeController.js.map