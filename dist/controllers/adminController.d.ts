import { Request, Response } from "express";
import { AuthRequest } from "../types";
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const getDashboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const logout: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map