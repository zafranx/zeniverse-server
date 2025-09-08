import { Response } from "express";
import { AuthRequest } from "../types";
export declare const getAllNews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getNewsById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createNews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateNews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteNews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleFeatured: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=newsController.d.ts.map