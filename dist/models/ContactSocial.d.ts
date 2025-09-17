import mongoose, { Document } from "mongoose";
interface ContactDetail {
    id: string;
    type: 'phone' | 'email' | 'address' | 'fax' | 'website';
    label: string;
    value: string;
    isPrimary: boolean;
    isActive: boolean;
    order?: number;
}
interface SocialMediaLink {
    id: string;
    platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok' | 'pinterest' | 'whatsapp' | 'telegram';
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
declare const _default: mongoose.Model<ContactSocialDocument, {}, {}, {}, mongoose.Document<unknown, {}, ContactSocialDocument, {}, {}> & ContactSocialDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ContactSocial.d.ts.map