import mongoose, { Document } from "mongoose";
import { Initiative } from "../types";
interface InitiativeDocument extends Omit<Initiative, '_id'>, Document {
}
declare const _default: mongoose.Model<InitiativeDocument, {}, {}, {}, mongoose.Document<unknown, {}, InitiativeDocument, {}, {}> & InitiativeDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Initiative.d.ts.map