import mongoose, { Schema, Document } from "mongoose";

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

export interface ContentDocument extends Document {
  type: 'privacy_policy' | 'terms_of_service' | 'about_us' | 'faq' | 'general';
  title: string;
  slug: string;
  content?: string; // Main rich text content
  sections?: ContentSection[]; // For structured content
  seo?: SEOSettings; // SEO settings
  isPublished: boolean;
  publishedAt?: Date;
  version: string;
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Content Section Schema
const contentSectionSchema = new Schema<ContentSection>(
  {
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
  },
  { _id: false }
);

// SEO Settings Schema
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

// Main Content Schema
const contentSchema = new Schema<ContentDocument>(
  {
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
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      // required: true,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
contentSchema.index({ type: 1, isPublished: 1 });
contentSchema.index({ title: "text", content: "text" });
contentSchema.index({ slug: 1 });

// Pre-save middleware to handle slug generation and publishing
contentSchema.pre('save', function(next) {
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

export default mongoose.model<ContentDocument>(
  "Content",
  contentSchema
);