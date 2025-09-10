import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const createContactInquiry: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllContactInquiries: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getContactInquiryById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markAsRead: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const replyToInquiry: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateInquiryNotes: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteContactInquiry: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUnreadCount: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=contactInquiryController.d.ts.map