"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.updateProfile = exports.getProfile = exports.getDashboard = exports.login = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const News_1 = __importDefault(require("../models/News"));
const Initiative_1 = __importDefault(require("../models/Initiative"));
const Ventures_1 = __importDefault(require("../models/Ventures"));
const constants_1 = require("../utils/constants");
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Validation
        if (!username || !password) {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Username and password are required"));
            return;
        }
        // Find admin
        const admin = await Admin_1.default.findOne({
            $or: [{ username }, { email: username }],
            isActive: true,
        });
        if (!admin) {
            res
                .status(constants_1.RESPONSE_CODES.UNAUTHORIZED)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.UNAUTHORIZED, constants_1.RESPONSE_MESSAGES.INVALID_CREDENTIALS));
            return;
        }
        // Check password
        const isValidPassword = await admin.comparePassword(password);
        if (!isValidPassword) {
            res
                .status(constants_1.RESPONSE_CODES.UNAUTHORIZED)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.UNAUTHORIZED, constants_1.RESPONSE_MESSAGES.INVALID_CREDENTIALS));
            return;
        }
        // Update last login
        admin.lastLogin = new Date();
        await admin.save();
        // Generate token
        const token = (0, constants_1.__generateAuthToken)(admin);
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Login successful", {
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                lastLogin: admin.lastLogin,
            },
        }));
    }
    catch (error) {
        console.error("Login error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.login = login;
const getDashboard = async (req, res) => {
    try {
        // Get counts with Promise.all for better performance
        const [newsCount, initiativeCount, portfolioCount, adminCount, featuredNews, featuredInitiatives, activeInitiatives,] = await Promise.all([
            News_1.default.countDocuments(),
            Initiative_1.default.countDocuments(),
            Ventures_1.default.countDocuments(),
            Admin_1.default.countDocuments({ isActive: true }),
            News_1.default.countDocuments({ featured: true }),
            Initiative_1.default.countDocuments({ featured: true }),
            Initiative_1.default.countDocuments({ status: "Active" }),
        ]);
        // Get recent activities
        const [recentNews, recentInitiatives, recentPortfolio] = await Promise.all([
            News_1.default.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("title createdAt category author")
                .lean(),
            Initiative_1.default.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("title createdAt category status")
                .lean(),
            Ventures_1.default.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("name createdAt")
                .lean(),
        ]);
        // Get category statistics
        const [newsCategories, initiativeCategories] = await Promise.all([
            News_1.default.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
            Initiative_1.default.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);
        const dashboardData = {
            counts: {
                news: newsCount,
                initiatives: initiativeCount,
                portfolio: portfolioCount,
                admins: adminCount,
                featuredNews,
                featuredInitiatives,
                activeInitiatives,
            },
            recentActivities: {
                news: recentNews,
                initiatives: recentInitiatives,
                portfolio: recentPortfolio,
            },
            statistics: {
                newsCategories,
                initiativeCategories,
            },
        };
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, dashboardData));
    }
    catch (error) {
        console.error("Dashboard error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getDashboard = getDashboard;
const getProfile = async (req, res) => {
    try {
        const admin = await Admin_1.default.findById(req.user?.id).select("-password").lean();
        if (!admin) {
            res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Admin not found"));
            return;
        }
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            admin,
        }));
    }
    catch (error) {
        console.error("Get profile error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const adminId = req.user?.id;
        const admin = await Admin_1.default.findById(adminId);
        if (!admin) {
            res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "Admin not found"));
            return;
        }
        // Validate email if provided
        if (email && !(0, constants_1.__validateEmail)(email)) {
            res
                .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, "Invalid email format"));
            return;
        }
        // Update basic info
        if (name)
            admin.name = name;
        if (email)
            admin.email = email;
        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                res
                    .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                    .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Current password is required"));
                return;
            }
            const isValidPassword = await admin.comparePassword(currentPassword);
            if (!isValidPassword) {
                res
                    .status(constants_1.RESPONSE_CODES.UNAUTHORIZED)
                    .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.UNAUTHORIZED, "Current password is incorrect"));
                return;
            }
            admin.password = newPassword;
        }
        await admin.save();
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.UPDATED, {
            admin: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        }));
    }
    catch (error) {
        console.error("Update profile error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateProfile = updateProfile;
const logout = async (req, res) => {
    res
        .status(constants_1.RESPONSE_CODES.SUCCESS)
        .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Logout successful"));
};
exports.logout = logout;
//# sourceMappingURL=adminController.js.map