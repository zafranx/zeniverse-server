"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const constants_1 = require("../utils/constants");
const errorHandler = (error, req, res, next) => {
    console.error("Error:", error);
    // Handle specific error types
    if (error.code === "LIMIT_FILE_SIZE") {
        res
            .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "File size too large (max 5MB)"));
        return;
    }
    if (error.code === "LIMIT_FILE_COUNT") {
        res
            .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Too many files uploaded"));
        return;
    }
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        res
            .status(constants_1.RESPONSE_CODES.CONFLICT)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CONFLICT, `${field} already exists`));
        return;
    }
    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        res
            .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, messages.join(", ")));
        return;
    }
    if (error.name === "CastError") {
        res
            .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Invalid ID format"));
        return;
    }
    if (error.message && error.message.includes("Invalid file type")) {
        res
            .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, error.message));
        return;
    }
    // Default error response
    res
        .status(error.status || constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
        .json((0, constants_1.__requestResponse)(error.status || constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, error.message || constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR, process.env.NODE_ENV === "development" ? { stack: error.stack } : null));
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map