import mongoose, { Document } from "mongoose";
interface ContentSection {
    title: string;
    content: string;
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
    content?: string;
    sections?: ContentSection[];
    seo?: SEOSettings;
    isPublished: boolean;
    publishedAt?: Date;
    version: string;
    createdBy: mongoose.Types.ObjectId;
    lastModifiedBy: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const _default: mongoose.Model<ContentDocument, {}, {}, {}, mongoose.Document<unknown, {}, ContentDocument, {}, {}> & ContentDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Content.d.ts.map