import { Response } from "express";
import { AuthRequest } from "../types";
export declare const getAllTeamMembers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllTeamMembersAdmin: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTeamMemberById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTeamMember: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateTeamMember: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTeamMember: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const toggleTeamMemberStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=teamMemberController.d.ts.map