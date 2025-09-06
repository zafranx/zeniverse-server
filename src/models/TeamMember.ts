import mongoose, { Schema, Document } from "mongoose";
import { TeamMember } from "../types";

interface TeamMemberDocument extends Omit<TeamMember, '_id'>, Document {}

const teamMemberSchema = new Schema<TeamMemberDocument>(
  {
    name: {
      type: String,
    //   required: true,
      trim: true,
      maxlength: 100
    },
    role: {
      type: String,
    //   required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
    //   required: true,
      trim: true,
      maxlength: 500
    },
    image: {
      type: String,
    //   required: true
    },
    sort_order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
teamMemberSchema.index({ name: "text", role: "text" });
teamMemberSchema.index({ sort_order: 1 });
teamMemberSchema.index({ isActive: 1 });

export default mongoose.model<TeamMemberDocument>("TeamMember", teamMemberSchema);