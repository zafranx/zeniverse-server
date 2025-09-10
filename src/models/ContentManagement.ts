import mongoose, { Schema, Document } from "mongoose";

interface SocialMediaLink {
  platform: string;
  url: string;
  icon?: string;
  isActive: boolean;
}

interface ContactDetail {
  type: 'phone' | 'email' | 'address' | 'fax' | 'website';
  label: string;
  value: string;
  isPrimary: boolean;
  isActive: boolean;
}

interface ContentSection {
  title: string;
  content: string; // Rich text content from editor
  order: number;
  isActive: boolean;
}

interface SEOSettings {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface ContentManagementDocument extends Document {
  type: 'privacy_policy' | 'terms_of_service' | 'contact_details' | 'about_us' | 'faq';
  title: string;
  slug: string;
  content?: string; // Main rich text content
  sections?: ContentSection[]; // For structured content
  contactDetails?: ContactDetail[]; // For contact details type
  socialMediaLinks?: SocialMediaLink[]; // For social media
  seo?: SEOSettings; // SEO settings
  isPublished: boolean;
  publishedAt?: Date;
  version: string;
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
}

const socialMediaLinkSchema = new Schema<SocialMediaLink>(
  {
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
  },
  { _id: false }
);

const contactDetailSchema = new Schema<ContactDetail>(
  {
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
  },
  { _id: false }
);

const contentSectionSchema = new Schema<ContentSection>(
  {
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
  },
  { _id: false }
);

const seoSettingsSchema = new Schema<SEOSettings>(
  {
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
  },
  { _id: false }
);

const contentManagementSchema = new Schema<ContentManagementDocument>(
  {
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
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance (fixed duplicate index issue)
contentManagementSchema.index({ type: 1, isPublished: 1 });
contentManagementSchema.index({ title: "text", content: "text" });

// Pre-save middleware to handle slug generation and publishing
contentManagementSchema.pre('save', function(next) {
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

export default mongoose.model<ContentManagementDocument>(
  "ContentManagement",
  contentManagementSchema
);