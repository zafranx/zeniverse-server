import mongoose, { Document } from "mongoose";
interface IFinancialProjection {
    year: number;
    projectedRevenueUSD: number;
}
interface IInvestor {
    name: string;
    logo: string;
}
interface IFounder {
    name: string;
    pic: string;
    briefBio: string;
}
export interface IVenture {
    ventureName: string;
    brandName: string;
    logo: string;
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
    productScreenshots: string[];
    bannerImage?: string;
    bannerHeading?: string;
    bannerText?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface VentureDocument extends IVenture, Document {
}
declare const _default: mongoose.Model<VentureDocument, {}, {}, {}, mongoose.Document<unknown, {}, VentureDocument, {}, {}> & VentureDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Ventures.d.ts.map