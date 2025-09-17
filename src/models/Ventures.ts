import mongoose, { Schema, Document } from "mongoose";

interface IFinancialProjection {
  year: number;
  projectedRevenueUSD: number;
}

interface IInvestor {
  name: string;
  logo: string; // URL
}

interface IFounder {
  name: string;
  pic: string; // URL
  briefBio: string;
  // isFromTeamMember?: boolean; // New field to track source
  // teamMemberId?: string; // New field to store team member ID
}

export interface IVenture {
  ventureName: string;
  brandName: string;
  logo: string; // URL

  shortDescription: string;

  problemStatement: string[];
  proposedSolutions: string[];
  innovationValue: string[];
  targetGeography: string[];
  valueProposition: string[];
  marketFitment: string[];
  goToMarketStrategy: string[];

  currentStatus: string;

  financialProjections: IFinancialProjection[];
  currentInvestors: IInvestor[];
  founders: IFounder[];

  productScreenshots: string[]; // URLs

  // New Banner fields
  bannerImage?: string; // URL
  bannerHeading?: string; // Text
  bannerText?: string; // Text

  createdAt?: Date;
  updatedAt?: Date;
}

export interface VentureDocument extends IVenture, Document {}

const financialProjectionSchema = new Schema<IFinancialProjection>(
  {
    year: { type: Number },
    projectedRevenueUSD: { type: Number },
  },
  { _id: false }
);

const investorSchema = new Schema<IInvestor>(
  {
    name: { type: String, trim: true },
    logo: { type: String },
  },
  { _id: false }
);

const founderSchema = new Schema<IFounder>(
  {
    name: { type: String, trim: true },
    pic: { type: String },
    briefBio: { type: String, trim: true },
    // isFromTeamMember: { type: Boolean, default: false },
    // teamMemberId: { type: String, default: null },
  },
  { _id: false }
);

const ventureSchema = new Schema<VentureDocument>(
  {
    ventureName: { type: String, required: true, trim: true, maxlength: 200 },
    brandName: { type: String, required: true, trim: true, maxlength: 200 },
    logo: { type: String },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 600,
    },

    problemStatement: [{ type: String, trim: true }],
    proposedSolutions: [{ type: String, trim: true }],
    innovationValue: [{ type: String, trim: true }],
    targetGeography: [{ type: String, trim: true }],
    valueProposition: [{ type: String, trim: true }],
    marketFitment: [{ type: String, trim: true }],
    goToMarketStrategy: [{ type: String, trim: true }],

    currentStatus: { type: String, required: true, trim: true, maxlength: 200 },

    financialProjections: [financialProjectionSchema],
    currentInvestors: [investorSchema],
    founders: [founderSchema],

    productScreenshots: [{ type: String }],

    // New Banner fields
    bannerImage: { type: String, default: "" },
    bannerHeading: { type: String, trim: true, maxlength: 200, default: "" },
    bannerText: { type: String, trim: true, maxlength: 1500, default: "" },
  },
  { timestamps: true }
);

// Text index for search
ventureSchema.index({
  ventureName: "text",
  brandName: "text",
  shortDescription: "text",
  bannerHeading: "text",
  bannerText: "text",
});

export default mongoose.model<VentureDocument>("Venture", ventureSchema);

// import mongoose, { Schema, Document } from "mongoose";
// import { PortfolioCompany } from "../types";

// interface PortfolioDocument extends PortfolioCompany, Document {}

// const detailedSectionSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     content: [
//       {
//         type: String,
//         required: true,
//       },
//     ],
//   },
//   { _id: false }
// );

// const portfolioSchema = new Schema<PortfolioDocument>(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 200,
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 500,
//     },
//     image: {
//       type: String,
//       required: true,
//     },
//     heroImage: {
//       type: String,
//       required: true,
//     },
//     detailedSections: [detailedSectionSchema],
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes
// portfolioSchema.index({ name: "text", description: "text" });

// export default mongoose.model<PortfolioDocument>(
//   "PortfolioCompany",
//   portfolioSchema
// );
