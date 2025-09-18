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
// Contact Detail Schema
const contactDetailSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["phone", "email", "address", "fax", "website"],
        required: true,
    },
    label: {
        type: String,
        trim: true,
    },
    value: {
        type: String,
        trim: true,
    },
    isPrimary: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
});
// Social Media Schema
const socialMediaLinkSchema = new mongoose_1.Schema({
    // id: {
    //   type: String,
    //   required: true,
    // },
    platform: {
        type: String,
        enum: [
            "facebook",
            "twitter",
            "linkedin",
            "instagram",
            "youtube",
            "tiktok",
            "pinterest",
            "whatsapp",
            "telegram",
        ],
    },
    label: {
        type: String,
        trim: true,
    },
    url: {
        type: String,
        trim: true,
    },
    icon: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
});
// Main ContactSocial Schema
const contactSocialSchema = new mongoose_1.Schema({
    title: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "Contact & Social Media Information",
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        default: "contact-social-info",
    },
    contactDetails: [contactDetailSchema],
    socialMediaLinks: [socialMediaLinkSchema],
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
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
    },
    lastModifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
    },
}, {
    timestamps: true,
});
// Indexes for better performance
contactSocialSchema.index({ slug: 1 });
contactSocialSchema.index({ isPublished: 1 });
contactSocialSchema.index({
    "contactDetails.type": 1,
    "contactDetails.isActive": 1,
});
contactSocialSchema.index({
    "socialMediaLinks.platform": 1,
    "socialMediaLinks.isActive": 1,
});
// Pre-save middleware
contactSocialSchema.pre("save", function (next) {
    if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});
exports.default = mongoose_1.default.model("ContactSocial", contactSocialSchema);
//# sourceMappingURL=ContactSocial.js.map