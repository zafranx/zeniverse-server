import { v2 as cloudinary } from "cloudinary";
import { Request } from "express";
declare const __uploadImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
declare const __uploadMedia: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
declare const __uploadNewsMedia: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
declare const __uploadVentureMedia: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
declare const processUploadedFiles: (req: Request, files: any) => Promise<{
    [key: string]: string;
}>;
export { __uploadImage, __uploadMedia, __uploadNewsMedia, __uploadVentureMedia, processUploadedFiles, cloudinary, };
//# sourceMappingURL=multer.d.ts.map