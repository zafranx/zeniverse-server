import { Request, Response } from 'express';
import ContactInquiry, { ContactInquiryDocument } from '../models/ContactInquiry';
import mongoose from 'mongoose';
import {
  __requestResponse,
  RESPONSE_CODES,
  RESPONSE_MESSAGES,
} from '../utils/constants';
import { AuthRequest } from '../types';

// Create new contact inquiry (Public endpoint)
export const createContactInquiry = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    const requiredFields = ['name', 'email', 'message'];
    const missing = requiredFields.filter(field => !req.body[field]);

    if (missing.length > 0) {
      return res
        .status(RESPONSE_CODES.VALIDATION_ERROR)
        .json(
          __requestResponse(
            RESPONSE_CODES.VALIDATION_ERROR,
            `Missing required fields: ${missing.join(', ')}`
          )
        );
    }

    const contactInquiry = new ContactInquiry({
      name,
      email,
      phone,
      subject,
      message,
      status: 'new',
      isRead: false
    });

    await contactInquiry.save();

    const responseData = {
      id: contactInquiry._id,
      name: contactInquiry.name,
      email: contactInquiry.email,
      subject: contactInquiry.subject,
      createdAt: contactInquiry.createdAt
    };

    res
      .status(RESPONSE_CODES.CREATED)
      .json(
        __requestResponse(
          RESPONSE_CODES.CREATED,
          RESPONSE_MESSAGES.CREATED,
          responseData
        )
      );
  } catch (error: any) {
    console.error('Error creating contact inquiry:', error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

// Get all contact inquiries (Admin only)
export const getAllContactInquiries = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      isRead,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter object
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const inquiries = await ContactInquiry.find(filter)
      .populate('readBy', 'username email')
      .populate('repliedBy', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const totalInquiries = await ContactInquiry.countDocuments(filter);
    const totalPages = Math.ceil(totalInquiries / limitNumber);
    const unreadCount = await ContactInquiry.countDocuments({ isRead: false });

    const responseData = {
      inquiries,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalInquiries,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
      unreadCount
    };

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          responseData
        )
      );
  } catch (error: any) {
    console.error('Error fetching contact inquiries:', error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

// Get single contact inquiry by ID (Admin only)
export const getContactInquiryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            'Invalid inquiry ID'
          )
        );
    }

    const inquiry = await ContactInquiry.findById(id)
      .populate('readBy', 'username email')
      .populate('repliedBy', 'username email')
      .lean();

    if (!inquiry) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          inquiry
        )
      );
  } catch (error: any) {
    console.error('Error fetching contact inquiry:', error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

// Mark inquiry as read (Admin only)
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = new mongoose.Types.ObjectId(req.user?.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            'Invalid inquiry ID'
          )
        );
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      id,
      {
        isRead: true,
        readAt: new Date(),
        readBy: adminId,
        status: 'read'
      },
      { new: true }
    )
      .populate('readBy', 'username email')
      .populate('repliedBy', 'username email');

    if (!inquiry) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          'Inquiry marked as read successfully',
          inquiry
        )
      );
  } catch (error: any) {
    console.error('Error marking inquiry as read:', error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

// Reply to contact inquiry (Admin only)
export const replyToInquiry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;
    const adminId = new mongoose.Types.ObjectId(req.user?.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            'Invalid inquiry ID'
          )
        );
    }

    if (!replyMessage || replyMessage.trim().length === 0) {
      return res
        .status(RESPONSE_CODES.VALIDATION_ERROR)
        .json(
          __requestResponse(
            RESPONSE_CODES.VALIDATION_ERROR,
            'Reply message is required'
          )
        );
    }

    const inquiry = await ContactInquiry.findById(id);
    if (!inquiry) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    // Update inquiry with reply
    inquiry.replyMessage = replyMessage;
    inquiry.repliedAt = new Date();
    inquiry.repliedBy = adminId;
    inquiry.status = 'replied';
    inquiry.isRead = true;
    if (!inquiry.readAt) {
      inquiry.readAt = new Date();
      inquiry.readBy = adminId;
    }

    await inquiry.save();

    // TODO: Send email to user (will implement with nodemailer)
    // await sendReplyEmail(inquiry.email, inquiry.name, replyMessage, inquiry.subject);

    const updatedInquiry = await ContactInquiry.findById(id)
      .populate('readBy', 'username email')
      .populate('repliedBy', 'username email');

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          'Reply sent successfully',
          updatedInquiry
        )
      );
  } catch (error: any) {
    console.error('Error sending reply:', error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

// Update inquiry notes (Admin only)
export const updateInquiryNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            'Invalid inquiry ID'
          )
        );
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      id,
      { adminNotes },
      { new: true }
    )
      .populate('readBy', 'username email')
      .populate('repliedBy', 'username email');

    if (!inquiry) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.UPDATED,
          inquiry
        )
      );
  } catch (error: any) {
    console.error('Error updating notes:', error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

// Delete contact inquiry (Admin only)
export const deleteContactInquiry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            'Invalid inquiry ID'
          )
        );
    }

    const inquiry = await ContactInquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.DELETED,
          { id: inquiry._id }
        )
      );
  } catch (error: any) {
    console.error('Error deleting contact inquiry:', error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

// Get unread notifications count (Admin only)
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const unreadCount = await ContactInquiry.countDocuments({ isRead: false });
    
    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          { unreadCount }
        )
      );
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};