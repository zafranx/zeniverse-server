import mongoose, { Schema, Document } from "mongoose";
import { Initiative } from "../types";

interface InitiativeDocument extends Omit<Initiative, '_id'>, Document {}

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

const initiativeSchema = new Schema<InitiativeDocument>(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      required: true,
    },
    excerpt: {
      type: String,
      trim: true,
      // maxlength: 500,
    },
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
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Planned", "In Progress"],
      default: "Active",
    },
    impact: {
      type: String,
      trim: true,
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

// Indexes
initiativeSchema.index({ title: "text", excerpt: "text" });
initiativeSchema.index({ category: 1 });
initiativeSchema.index({ status: 1 });
initiativeSchema.index({ featured: 1 });
initiativeSchema.index({ date: -1 });

export default mongoose.model<InitiativeDocument>(
  "Initiative",
  initiativeSchema
);
