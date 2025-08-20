import { Response } from "express";
import { AuthRequest } from "../types";
export declare const getAllInitiatives: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getInitiativeById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createInitiative: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateInitiative: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteInitiative: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=initiativeController.d.ts.map