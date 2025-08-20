"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthNames = exports.RESPONSE_MESSAGES = exports.RESPONSE_CODES = exports.__extractCloudinaryPublicId = exports.__deleteCloudinaryFile = exports.__deleteFile = void 0;
exports.__requestResponse = __requestResponse;
exports.__generateAuthToken = __generateAuthToken;
exports.__randomNumber = __randomNumber;
exports.__deepClone = __deepClone;
exports.__transformData = __transformData;
exports.__formatDate = __formatDate;
exports.__formatDateddMMMyyyy = __formatDateddMMMyyyy;
exports.__validateEmail = __validateEmail;
exports.__generateSlug = __generateSlug;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
// const _jwtSecret = process?.env?.JWT_SECRET || "default-secret-key";
// Ensure it's always a string, not undefined
const _jwtSecret = process.env.JWT_SECRET ?? "default-secret-key";
/**
 * Creates a standardized response object with response code, message, and data.
 * @param {number} response_code - The response code.
 * @param {string} response_message - The response message.
 * @param {any} data - The data to be included in the response object.
 * @returns {object} - The response object.
 */
function __requestResponse(response_code, response_message, data = null) {
    return {
        response: {
            response_code,
            response_message,
        },
        data,
    };
}
/**
 * Generates a JSON Web Token (JWT) for a given user object.
 * @param {Object} user - The user object.
 * @param {string} user._id - The user ID.
 * @param {string} expiresIn - Token expiration time (default: 24h).
 * @returns {string} - The generated JWT.
 */
// function __generateAuthToken(user: any, expiresIn: string = "24h") {
//   const data = {
//     user: {
//       id: user._id,
//       username: user.username,
//       role: user.role,
//     },
//   };
//   // const authtoken = jwt.sign(data, _jwtSecret, { expiresIn });
//   const authtoken = jwt.sign(data, _jwtSecret as jwt.Secret, {
//     expiresIn,
//   });
//   return authtoken;
// }
function __generateAuthToken(user) {
    const data = {
        user: {
            id: user._id,
            username: user.username,
            role: user.role,
        },
    };
    const authtoken = jsonwebtoken_1.default.sign(data, _jwtSecret);
    return authtoken;
}
/**
 * Generates a random 4-digit number between 1000 and 9999.
 * @returns {number} The random 4-digit number.
 */
function __randomNumber() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Deletes a file from the local filesystem.
 * @param {string} filePath - The path to the file to delete.
 */
const __deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
            if (err) {
                console.error(`File not found at path: ${filePath}`);
                reject(new Error(`File not found: ${filePath}`));
                return;
            }
            fs_1.default.unlink(filePath, (err) => {
                if (err) {
                    console.error("Error deleting file:", err);
                    reject(err);
                    return;
                }
                console.log(`File at path: ${filePath} has been deleted.`);
                resolve();
            });
        });
    });
};
exports.__deleteFile = __deleteFile;
/**
 * Deletes a file from Cloudinary.
 * @param {string} publicId - The public ID of the file in Cloudinary.
 */
const __deleteCloudinaryFile = async (publicId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
        console.log(`Cloudinary file deleted: ${publicId}`);
    }
    catch (error) {
        console.error("Error deleting Cloudinary file:", error);
        throw error;
    }
};
exports.__deleteCloudinaryFile = __deleteCloudinaryFile;
/**
 * Extracts public ID from Cloudinary URL.
 * @param {string} url - The Cloudinary URL.
 * @returns {string} - The public ID.
 */
const __extractCloudinaryPublicId = (url) => {
    const matches = url.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|pdf|mp4)$/);
    return matches ? matches[1] : "";
};
exports.__extractCloudinaryPublicId = __extractCloudinaryPublicId;
/**
 * Creates a deep clone of an object.
 * @param {any} value - The value to clone.
 * @returns {any} - The cloned value.
 */
function __deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}
/**
 * Transforms a list of objects to a standardized format.
 * @param {Object} params - The transformation parameters.
 * @param {Array} params.list - The list to transform.
 * @param {string} params.name - The name field.
 * @param {string} params.id - The ID field.
 * @returns {Array} - The transformed list.
 */
function __transformData({ list, name, id, }) {
    return list.map((item) => {
        return {
            id: item[id],
            name: item[name],
        };
    });
}
// Month names for date formatting
const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
exports.monthNames = monthNames;
/**
 * Formats a date to DD-MM-YYYY format.
 * @param {Date|string} date - The date to format.
 * @returns {string} - The formatted date.
 */
function __formatDate(date) {
    let inputDate = new Date(date);
    if (!(inputDate instanceof Date) || isNaN(inputDate.getTime())) {
        throw new Error("Input must be a valid Date object");
    }
    const day = inputDate.getDate().toString().padStart(2, "0");
    const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
    const year = inputDate.getFullYear();
    return `${day}-${month}-${year}`;
}
/**
 * Formats a date to DD-MMM-YYYY format.
 * @param {Date|string} date - The date to format.
 * @returns {string} - The formatted date.
 */
function __formatDateddMMMyyyy(date) {
    let inputDate = new Date(date);
    if (!(inputDate instanceof Date) || isNaN(inputDate.getTime())) {
        throw new Error("Input must be a valid Date object");
    }
    const day = inputDate.getDate().toString().padStart(2, "0");
    const month = monthNames[inputDate.getMonth()];
    const year = inputDate.getFullYear();
    return `${day}-${month}-${year}`;
}
/**
 * Validates email format.
 * @param {string} email - The email to validate.
 * @returns {boolean} - Whether the email is valid.
 */
function __validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Generates a slug from a string.
 * @param {string} text - The text to convert to slug.
 * @returns {string} - The slug.
 */
function __generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
}
/**
 * Response status codes.
 */
const RESPONSE_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    INTERNAL_SERVER_ERROR: 500,
};
exports.RESPONSE_CODES = RESPONSE_CODES;
/**
 * Standard response messages.
 */
const RESPONSE_MESSAGES = {
    SUCCESS: "Operation completed successfully",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    NOT_FOUND: "Resource not found",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",
    VALIDATION_ERROR: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
    INVALID_CREDENTIALS: "Invalid credentials",
    TOKEN_EXPIRED: "Token has expired",
    FILE_UPLOAD_ERROR: "File upload failed",
    FILE_DELETE_ERROR: "File deletion failed",
};
exports.RESPONSE_MESSAGES = RESPONSE_MESSAGES;
//# sourceMappingURL=constants.js.map