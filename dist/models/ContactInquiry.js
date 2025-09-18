"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const contactInquirySchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Admin',
    },
    repliedAt: {
        type: Date,
    },
    repliedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Indexes for better performance
contactInquirySchema.index({ status: 1, createdAt: -1 });
contactInquirySchema.index({ isRead: 1 });
contactInquirySchema.index({ email: 1 });
// Pre-save middleware to handle read status
contactInquirySchema.pre('save', function (next) {
    if (this.isModified('isRead') && this.isRead && !this.readAt) {
        this.readAt = new Date();
    }
    if (this.isModified('status') && this.status === 'read' && !this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
    }
    next();
});
exports.default = mongoose_1.default.model("ContactInquiry", contactInquirySchema);
//# sourceMappingURL=ContactInquiry.js.map