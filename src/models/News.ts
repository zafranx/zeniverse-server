import mongoose, { Schema, Document } from "mongoose";

interface DetailedSection {
  title: string;
  content: string[];
}

export interface NewsDocument extends Document {
  title: string;
  excerpt: string;
  image: string;
  heroImage: string;
  author: string;
  date: Date;
  category: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  detailedSections: DetailedSection[];
}

const detailedSectionSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    content: [
      {
        type: String,
      },
    ],
  },
  { _id: false }
);

const newsSchema = new Schema<NewsDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    }, // a short description of the news

    image: {
      type: String,
    },
    heroImage: {
      type: String,
    },
    author: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    readTime: {
      type: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    detailedSections: [detailedSectionSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
newsSchema.index({ title: "text", excerpt: "text" });
newsSchema.index({ category: 1 });
newsSchema.index({ featured: 1 });
newsSchema.index({ date: -1 });

export default mongoose.model<NewsDocument>("News", newsSchema);
