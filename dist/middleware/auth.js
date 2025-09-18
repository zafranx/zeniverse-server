"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminOrSuperAdmin = exports.requireSuperAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../models/Admin"));
const constants_1 = require("../utils/constants");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            res
                .status(constants_1.RESPONSE_CODES.UNAUTHORIZED)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.UNAUTHORIZED, "Access token required"));
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default-secret-key");
        const admin = await Admin_1.default.findById(decoded.user.id).select("-password");
        if (!admin || !admin.isActive) {
            res
                .status(constants_1.RESPONSE_CODES.UNAUTHORIZED)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.UNAUTHORIZED, "Invalid or inactive admin"));
            return;
        }
        req.user = {
            id: admin._id.toString(),
            username: admin.username,
            role: admin.role,
        };
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            res
                .status(constants_1.RESPONSE_CODES.UNAUTHORIZED)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.UNAUTHORIZED, constants_1.RESPONSE_MESSAGES.TOKEN_EXPIRED));
        }
        else {
            res
                .status(constants_1.RESPONSE_CODES.FORBIDDEN)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.FORBIDDEN, "Invalid token"));
        }
    }
};
exports.authenticateToken = authenticateToken;
const requireSuperAdmin = (req, res, next) => {
    if (req.user?.role !== "superadmin") {
        res
            .status(constants_1.RESPONSE_CODES.FORBIDDEN)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.FORBIDDEN, "Super admin access required"));
        return;
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
const requireAdminOrSuperAdmin = (req, res, next) => {
    if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
        res
            .status(constants_1.RESPONSE_CODES.FORBIDDEN)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.FORBIDDEN, "Admin access required"));
        return;
    }
    next();
};
exports.requireAdminOrSuperAdmin = requireAdminOrSuperAdmin;
//# sourceMappingURL=auth.js.map