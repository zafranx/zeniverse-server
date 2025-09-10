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
const socialMediaLinkSchema = new mongoose_1.Schema({
    platform: {
        type: String,
        enum: ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok', 'pinterest', 'whatsapp', 'telegram'],
        required: false,
    },
    url: {
        type: String,
        trim: true,
        required: false,
    },
    icon: {
        type: String,
        trim: true,
        required: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { _id: false });
const contactDetailSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['phone', 'email', 'address', 'fax', 'website'],
        required: false,
    },
    label: {
        type: String,
        trim: true,
        required: false,
    },
    value: {
        type: String,
        trim: true,
        required: false,
    },
    isPrimary: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { _id: false });
const contentSectionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        trim: true,
        required: false,
    },
    content: {
        type: String,
        required: false,
    },
    order: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { _id: false });
const seoSettingsSchema = new mongoose_1.Schema({
    metaTitle: {
        type: String,
        trim: true,
        maxlength: 60,
        required: false,
    },
    metaDescription: {
        type: String,
        trim: true,
        maxlength: 160,
        required: false,
    },
    keywords: [{
            type: String,
            trim: true,
            required: false,
        }],
    canonicalUrl: {
        type: String,
        trim: true,
        required: false,
    },
    ogTitle: {
        type: String,
        trim: true,
        maxlength: 60,
        required: false,
    },
    ogDescription: {
        type: String,
        trim: true,
        maxlength: 160,
        required: false,
    },
    ogImage: {
        type: String,
        trim: true,
        required: false,
    },
}, { _id: false });
const contentManagementSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['privacy_policy', 'terms_of_service', 'contact_details', 'about_us', 'faq'],
        required: false,
    },
    title: {
        type: String,
        trim: true,
        maxlength: 200,
        required: false,
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: false,
    },
    content: {
        type: String, // Rich text content from editor
        required: false,
    },
    sections: [contentSectionSchema],
    contactDetails: [contactDetailSchema],
    socialMediaLinks: [socialMediaLinkSchema],
    seo: seoSettingsSchema,
    isPublished: {
        type: Boolean,
        default: false,
    },
    publishedAt: {
        type: Date,
    },
    version: {
        type: String,
        default: "1.0",
        required: false,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false,
    },
    lastModifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false,
    },
}, {
    timestamps: true,
});
// Indexes for better performance (fixed duplicate index issue)
contentManagementSchema.index({ type: 1, isPublished: 1 });
contentManagementSchema.index({ title: "text", content: "text" });
// Pre-save middleware to handle slug generation and publishing
contentManagementSchema.pre('save', function (next) {
    if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});
exports.default = mongoose_1.default.model("ContentManagement", contentManagementSchema);
//# sourceMappingURL=ContentManagement.js.map