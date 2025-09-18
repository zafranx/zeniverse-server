import mongoose, { Document } from "mongoose";
export interface ContactInquiryDocument extends Document {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    isRead: boolean;
    readAt?: Date;
    readBy?: mongoose.Types.ObjectId;
    repliedAt?: Date;
    repliedBy?: mongoose.Types.ObjectId;
    replyMessage?: string;
    adminNotes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const _default: mongoose.Model<ContactInquiryDocument, {}, {}, {}, mongoose.Document<unknown, {}, ContactInquiryDocument, {}, {}> & ContactInquiryDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ContactInquiry.d.ts.map