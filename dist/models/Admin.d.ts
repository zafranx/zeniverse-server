import mongoose, { Document } from "mongoose";
interface IAdmin {
    username: string;
    email: string;
    password: string;
    name: string;
    role: "admin" | "superadmin";
    isActive: boolean;
    lastLogin?: Date;
}
interface AdminDocument extends IAdmin, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<AdminDocument, {}, {}, {}, mongoose.Document<unknown, {}, AdminDocument, {}, {}> & AdminDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Admin.d.ts.map