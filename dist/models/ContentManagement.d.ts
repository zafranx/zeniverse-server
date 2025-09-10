import mongoose, { Document } from "mongoose";
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
export interface ContentManagementDocument extends Document {
    type: 'privacy_policy' | 'terms_of_service' | 'contact_details' | 'about_us' | 'faq';
    title: string;
    slug: string;
    content?: string;
    sections?: ContentSection[];
    contactDetails?: ContactDetail[];
    socialMediaLinks?: SocialMediaLink[];
    seo?: SEOSettings;
    isPublished: boolean;
    publishedAt?: Date;
    version: string;
    createdBy: mongoose.Types.ObjectId;
    lastModifiedBy: mongoose.Types.ObjectId;
}
declare const _default: mongoose.Model<ContentManagementDocument, {}, {}, {}, mongoose.Document<unknown, {}, ContentManagementDocument, {}, {}> & ContentManagementDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ContentManagement.d.ts.map