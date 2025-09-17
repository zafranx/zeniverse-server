"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.deleteContactInquiry = exports.updateInquiryNotes = exports.replyToInquiry = exports.markAsRead = exports.getContactInquiryById = exports.getAllContactInquiries = exports.createContactInquiry = void 0;
const ContactInquiry_1 = __importDefault(require("../models/ContactInquiry"));
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../utils/constants");
const emailService_1 = __importDefault(require("../utils/emailService"));
const Admin_1 = __importDefault(require("../models/Admin")); //  for getting admin info
// Add this to test your email service
emailService_1.default.verifyConnection().then((result) => {
    console.log("SMTP Connection:", result ? "Success" : "Failed");
});
// Create new contact inquiry (Public endpoint)
const createContactInquiry = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        // Validate required fields
        const requiredFields = ["name", "email", "message"];
        const missing = requiredFields.filter((field) => !req.body[field]);
        if (missing.length > 0) {
            return res
                .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, `Missing required fields: ${missing.join(", ")}`));
        }
        const contactInquiry = new ContactInquiry_1.default({
            name,
            email,
            phone,
            subject,
            message,
            status: "new",
            isRead: false,
        });
        await contactInquiry.save();
        // Send email notifications
        try {
            // Send notification to admin/company email
            const companyEmail = process.env.COMPANY_EMAIL ||
                process.env.SMTP_USER ||
                "admin@zeniverse-ventures.com";
            await emailService_1.default.sendContactFormNotification({
                inquiry: contactInquiry,
                companyEmail: companyEmail,
            });
            // Send auto-reply to user
            await emailService_1.default.sendContactFormAutoReply(contactInquiry);
            console.warn("Email notifications sent successfully");
        }
        catch (emailError) {
            console.error("Failed to send email notifications:", emailError);
            // Don't fail the request if email fails, just log it
        }
        const responseData = {
            id: contactInquiry._id,
            name: contactInquiry.name,
            email: contactInquiry.email,
            subject: contactInquiry.subject,
            createdAt: contactInquiry.createdAt,
        };
        res
            .status(constants_1.RESPONSE_CODES.CREATED)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CREATED, constants_1.RESPONSE_MESSAGES.EMAIL_SEND, responseData));
    }
    catch (error) {
        console.error("Error creating contact inquiry:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.createContactInquiry = createContactInquiry;
// Get all contact inquiries (Admin only)
const getAllContactInquiries = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, isRead, search, sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        // Build filter object
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (isRead !== undefined) {
            filter.isRead = isRead === "true";
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
            ];
        }
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        const inquiries = await ContactInquiry_1.default.find(filter)
            .populate("readBy", "username email")
            .populate("repliedBy", "username email")
            .sort(sort)
            .skip(skip)
            .limit(limitNumber)
            .lean();
        const totalInquiries = await ContactInquiry_1.default.countDocuments(filter);
        const totalPages = Math.ceil(totalInquiries / limitNumber);
        const unreadCount = await ContactInquiry_1.default.countDocuments({ isRead: false });
        const responseData = {
            inquiries,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalInquiries,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
            },
            unreadCount,
        };
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, responseData));
    }
    catch (error) {
        console.error("Error fetching contact inquiries:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getAllContactInquiries = getAllContactInquiries;
// Get single contact inquiry by ID (Admin only)
const getContactInquiryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Invalid inquiry ID"));
        }
        const inquiry = await ContactInquiry_1.default.findById(id)
            .populate("readBy", "username email")
            .populate("repliedBy", "username email")
            .lean();
        if (!inquiry) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, inquiry));
    }
    catch (error) {
        console.error("Error fetching contact inquiry:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getContactInquiryById = getContactInquiryById;
// Mark inquiry as read (Admin only)
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = new mongoose_1.default.Types.ObjectId(req.user?.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Invalid inquiry ID"));
        }
        const inquiry = await ContactInquiry_1.default.findByIdAndUpdate(id, {
            isRead: true,
            readAt: new Date(),
            readBy: adminId,
            status: "read",
        }, { new: true })
            .populate("readBy", "username email")
            .populate("repliedBy", "username email");
        if (!inquiry) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Inquiry marked as read successfully", inquiry));
    }
    catch (error) {
        console.error("Error marking inquiry as read:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.markAsRead = markAsRead;
// Reply to contact inquiry (Admin only)
const replyToInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { replyMessage } = req.body;
        const adminId = new mongoose_1.default.Types.ObjectId(req.user?.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "Invalid inquiry ID"));
        }
        if (!replyMessage || replyMessage.trim().length === 0) {
            return res
                .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, "Reply message is required"));
        }
        const inquiry = await ContactInquiry_1.default.findById(id);
        if (!inquiry) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        // Get admin user info for email
        const adminUser = await Admin_1.default.findById(adminId).select("username email firstName lastName");
        const adminName = adminUser?.firstName && adminUser?.lastName
            ? `${adminUser.firstName} ${adminUser.lastName}`
            : adminUser?.username || "Admin";
        // Update inquiry with reply
        inquiry.replyMessage = replyMessage;
        inquiry.repliedAt = new Date();
        inquiry.repliedBy = adminId;
        inquiry.status = "replied";
        inquiry.isRead = true;
        if (!inquiry.readAt) {
            inquiry.readAt = new Date();
            inquiry.readBy = adminId;
        }
        await inquiry.save();
        // Send email reply to user
        try {
            await emailService_1.default.sendInquiryReply(inquiry, replyMessage, adminName);
            console.log("Reply email sent successfully to:", inquiry.email);
        }
        catch (emailError) {
            console.error("Failed to send reply email:", emailError);
            // Don't fail the request if email fails, just log it
        }
        const updatedInquiry = await ContactInquiry_1.default.findById(id)
            .populate("readBy", "username email")
            .populate("repliedBy", "username email");
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, "Reply sent successfully", updatedInquiry));
    }
    catch (error) {
        console.error("Error sending reply:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.replyToInquiry = replyToInquiry;
// Update inquiry notes (Admin only)
const updateInquiryNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, 'Invalid inquiry ID'));
        }
        const inquiry = await ContactInquiry_1.default.findByIdAndUpdate(id, { adminNotes }, { new: true })
            .populate('readBy', 'username email')
            .populate('repliedBy', 'username email');
        if (!inquiry) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.UPDATED, inquiry));
    }
    catch (error) {
        console.error('Error updating notes:', error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.updateInquiryNotes = updateInquiryNotes;
// Delete contact inquiry (Admin only)
const deleteContactInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, 'Invalid inquiry ID'));
        }
        const inquiry = await ContactInquiry_1.default.findByIdAndDelete(id);
        if (!inquiry) {
            return res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, constants_1.RESPONSE_MESSAGES.NOT_FOUND));
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.DELETED, { id: inquiry._id }));
    }
    catch (error) {
        console.error('Error deleting contact inquiry:', error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.deleteContactInquiry = deleteContactInquiry;
// Get unread notifications count (Admin only)
const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await ContactInquiry_1.default.countDocuments({ isRead: false });
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, { unreadCount }));
    }
    catch (error) {
        console.error('Error fetching unread count:', error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getUnreadCount = getUnreadCount;
//# sourceMappingURL=contactInquiryController.js.map