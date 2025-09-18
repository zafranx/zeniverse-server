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
// Content Section Schema
const contentSectionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        trim: true,
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
// SEO Settings Schema
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
// Main Content Schema
const contentSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['privacy_policy', 'terms_of_service', 'about_us', 'faq', 'general'],
        required: true,
    },
    title: {
        type: String,
        trim: true,
        maxlength: 200,
        // required: true,
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        // required: true,
    },
    content: {
        type: String, // Rich text content from editor
        required: false,
    },
    sections: [contentSectionSchema],
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
        // required: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Admin',
        // required: true,
    },
    lastModifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Admin',
        // required: true,
    },
}, {
    timestamps: true,
});
// Indexes for better performance
contentSchema.index({ type: 1, isPublished: 1 });
contentSchema.index({ title: "text", content: "text" });
contentSchema.index({ slug: 1 });
// Pre-save middleware to handle slug generation and publishing
contentSchema.pre('save', function (next) {
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
exports.default = mongoose_1.default.model("Content", contentSchema);
//# sourceMappingURL=Content.js.map