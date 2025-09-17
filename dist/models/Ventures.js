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
const financialProjectionSchema = new mongoose_1.Schema({
    year: { type: Number },
    projectedRevenueUSD: { type: Number },
}, { _id: false });
const investorSchema = new mongoose_1.Schema({
    name: { type: String, trim: true },
    logo: { type: String },
}, { _id: false });
const founderSchema = new mongoose_1.Schema({
    name: { type: String, trim: true },
    pic: { type: String },
    briefBio: { type: String, trim: true },
    // isFromTeamMember: { type: Boolean, default: false },
    // teamMemberId: { type: String, default: null },
}, { _id: false });
const ventureSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// Text index for search
ventureSchema.index({
    ventureName: "text",
    brandName: "text",
    shortDescription: "text",
    bannerHeading: "text",
    bannerText: "text",
});
exports.default = mongoose_1.default.model("Venture", ventureSchema);
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
//# sourceMappingURL=Ventures.js.map