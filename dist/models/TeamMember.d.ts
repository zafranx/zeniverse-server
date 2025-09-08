import mongoose, { Document } from "mongoose";
import { TeamMember } from "../types";
interface TeamMemberDocument extends Omit<TeamMember, '_id'>, Document {
}
declare const _default: mongoose.Model<TeamMemberDocument, {}, {}, {}, mongoose.Document<unknown, {}, TeamMemberDocument, {}, {}> & TeamMemberDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TeamMember.d.ts.map