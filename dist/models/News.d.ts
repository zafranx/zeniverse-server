import mongoose, { Document } from "mongoose";
interface DetailedSection {
    title: string;
    content: string[];
}
export interface NewsDocument extends Document {
    title: string;
    excerpt: string;
    image: string;
    heroImage: string;
    author: string;
    date: Date;
    category: string;
    readTime: string;
    tags: string[];
    featured: boolean;
    detailedSections: DetailedSection[];
}
declare const _default: mongoose.Model<NewsDocument, {}, {}, {}, mongoose.Document<unknown, {}, NewsDocument, {}, {}> & NewsDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=News.d.ts.map