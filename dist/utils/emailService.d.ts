import { ContactInquiryDocument } from '../models/ContactInquiry';
interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}
interface ContactFormEmailData {
    inquiry: ContactInquiryDocument;
    companyEmail: string;
}
declare class EmailService {
    private transporter;
    private defaultFrom;
    constructor();
    verifyConnection(): Promise<boolean>;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendContactFormNotification(data: ContactFormEmailData): Promise<boolean>;
    sendContactFormAutoReply(inquiry: ContactInquiryDocument): Promise<boolean>;
    sendInquiryReply(inquiry: ContactInquiryDocument, replyMessage: string, adminName: string): Promise<boolean>;
}
export declare const emailService: EmailService;
export default emailService;
//# sourceMappingURL=emailService.d.ts.map