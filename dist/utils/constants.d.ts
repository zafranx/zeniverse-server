/**
 * Creates a standardized response object with response code, message, and data.
 * @param {number} response_code - The response code.
 * @param {string} response_message - The response message.
 * @param {any} data - The data to be included in the response object.
 * @returns {object} - The response object.
 */
declare function __requestResponse(response_code: number, response_message: string, data?: any): {
    response: {
        response_code: number;
        response_message: string;
    };
    data: any;
};
/**
 * Generates a JSON Web Token (JWT) for a given user object.
 * @param {Object} user - The user object.
 * @param {string} user._id - The user ID.
 * @param {string} expiresIn - Token expiration time (default: 24h).
 * @returns {string} - The generated JWT.
 */
declare function __generateAuthToken(user: any): string;
/**
 * Generates a random 4-digit number between 1000 and 9999.
 * @returns {number} The random 4-digit number.
 */
declare function __randomNumber(): number;
/**
 * Deletes a file from the local filesystem.
 * @param {string} filePath - The path to the file to delete.
 */
declare const __deleteFile: (filePath: string) => Promise<void>;
/**
 * Deletes a file from Cloudinary.
 * @param {string} publicId - The public ID of the file in Cloudinary.
 */
declare const __deleteCloudinaryFile: (publicId: string) => Promise<void>;
/**
 * Extracts public ID from Cloudinary URL.
 * @param {string} url - The Cloudinary URL.
 * @returns {string} - The public ID.
 */
declare const __extractCloudinaryPublicId: (url: string) => string;
/**
 * Creates a deep clone of an object.
 * @param {any} value - The value to clone.
 * @returns {any} - The cloned value.
 */
declare function __deepClone(value: any): any;
/**
 * Transforms a list of objects to a standardized format.
 * @param {Object} params - The transformation parameters.
 * @param {Array} params.list - The list to transform.
 * @param {string} params.name - The name field.
 * @param {string} params.id - The ID field.
 * @returns {Array} - The transformed list.
 */
declare function __transformData({ list, name, id, }: {
    list: any[];
    name: string;
    id: string;
}): {
    id: any;
    name: any;
}[];
declare const monthNames: string[];
/**
 * Formats a date to DD-MM-YYYY format.
 * @param {Date|string} date - The date to format.
 * @returns {string} - The formatted date.
 */
declare function __formatDate(date: Date | string): string;
/**
 * Formats a date to DD-MMM-YYYY format.
 * @param {Date|string} date - The date to format.
 * @returns {string} - The formatted date.
 */
declare function __formatDateddMMMyyyy(date: Date | string): string;
/**
 * Validates email format.
 * @param {string} email - The email to validate.
 * @returns {boolean} - Whether the email is valid.
 */
declare function __validateEmail(email: string): boolean;
/**
 * Generates a slug from a string.
 * @param {string} text - The text to convert to slug.
 * @returns {string} - The slug.
 */
declare function __generateSlug(text: string): string;
/**
 * Response status codes.
 */
declare const RESPONSE_CODES: {
    SUCCESS: number;
    CREATED: number;
    BAD_REQUEST: number;
    UNAUTHORIZED: number;
    FORBIDDEN: number;
    NOT_FOUND: number;
    CONFLICT: number;
    VALIDATION_ERROR: number;
    INTERNAL_SERVER_ERROR: number;
};
/**
 * Standard response messages.
 */
declare const RESPONSE_MESSAGES: {
    SUCCESS: string;
    CREATED: string;
    UPDATED: string;
    DELETED: string;
    NOT_FOUND: string;
    UNAUTHORIZED: string;
    FORBIDDEN: string;
    VALIDATION_ERROR: string;
    INTERNAL_ERROR: string;
    INVALID_CREDENTIALS: string;
    TOKEN_EXPIRED: string;
    FILE_UPLOAD_ERROR: string;
    FILE_DELETE_ERROR: string;
    EMAIL_SEND: string;
};
export { __requestResponse, __generateAuthToken, __randomNumber, __deleteFile, __deleteCloudinaryFile, __extractCloudinaryPublicId, __deepClone, __transformData, __formatDate, __formatDateddMMMyyyy, __validateEmail, __generateSlug, RESPONSE_CODES, RESPONSE_MESSAGES, monthNames, };
//# sourceMappingURL=constants.d.ts.map