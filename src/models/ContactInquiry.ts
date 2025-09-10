import mongoose, { Schema, Document } from "mongoose";

export interface ContactInquiryDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  isRead: boolean;
  readAt?: Date;
  readBy?: mongoose.Types.ObjectId;
  repliedAt?: Date;
  repliedBy?: mongoose.Types.ObjectId;
  replyMessage?: string;
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const contactInquirySchema = new Schema<ContactInquiryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
      // index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      // index: true,
    },
    readAt: {
      type: Date,
    },
    readBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    repliedAt: {
      type: Date,
    },
    repliedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    replyMessage: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
contactInquirySchema.index({ status: 1, createdAt: -1 });
contactInquirySchema.index({ isRead: 1 });
contactInquirySchema.index({ email: 1 });

// Pre-save middleware to handle read status
contactInquirySchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  if (this.isModified('status') && this.status === 'read' && !this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
  }
  
  next();
});

export default mongoose.model<ContactInquiryDocument>(
  "ContactInquiry",
  contactInquirySchema
);