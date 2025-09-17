import mongoose, { Schema, Document } from "mongoose";

// Contact Detail Interface
interface ContactDetail {
  // id: string;
  type: "phone" | "email" | "address" | "fax" | "website";
  label: string;
  value: string;
  isPrimary: boolean;
  isActive: boolean;
  order?: number;
}

// Social Media Interface
interface SocialMediaLink {
  // id: string;
  platform:
    | "facebook"
    | "twitter"
    | "linkedin"
    | "instagram"
    | "youtube"
    | "tiktok"
    | "pinterest"
    | "whatsapp"
    | "telegram";
  label: string;
  url: string;
  icon?: string;
  isActive: boolean;
  order?: number;
}

export interface ContactSocialDocument extends Document {
  title: string;
  slug: string;
  contactDetails: ContactDetail[];
  socialMediaLinks: SocialMediaLink[];
  isPublished: boolean;
  publishedAt?: Date;
  version: string;
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Contact Detail Schema
const contactDetailSchema = new Schema<ContactDetail>(
  {
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
  },
  // { _id: false }
);

// Social Media Schema
const socialMediaLinkSchema = new Schema<SocialMediaLink>(
  {
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
  },
  // { _id: false }
);

// Main ContactSocial Schema
const contactSocialSchema = new Schema<ContactSocialDocument>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

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

export default mongoose.model<ContactSocialDocument>(
  "ContactSocial",
  contactSocialSchema
);
