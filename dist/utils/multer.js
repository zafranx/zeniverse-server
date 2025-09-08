"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.processUploadedFiles = exports.__uploadVentureMedia = exports.__uploadNewsMedia = exports.__uploadMedia = exports.__uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
// Allowed file types
const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
];
// File filter
const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error("Invalid file type."));
};
// Cloudinary storage only
const cloudinaryStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        return {
            folder: "zeniverse_uploads",
            public_id: `${Date.now()}-${path_1.default.parse(file.originalname).name}`,
            resource_type: "auto",
        };
    },
});
const upload = (0, multer_1.default)({
    storage: cloudinaryStorage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5,
    },
});
// Middleware functions
const __uploadImage = upload.fields([{ name: "file", maxCount: 1 }]);
exports.__uploadImage = __uploadImage;
const __uploadMedia = upload.fields([{ name: "file", maxCount: 1 }]);
exports.__uploadMedia = __uploadMedia;
const __uploadNewsMedia = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "heroImage", maxCount: 1 },
]);
exports.__uploadNewsMedia = __uploadNewsMedia;
const __uploadVentureMedia = upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
    { name: "investorLogos", maxCount: 20 },
    { name: "founderPics", maxCount: 20 },
    { name: "productScreenshots", maxCount: 50 },
]);
exports.__uploadVentureMedia = __uploadVentureMedia;
// Extract URLs from Cloudinary uploads
// const processUploadedFiles = async (req: Request, files: any) => {
const processUploadedFiles = async (req, files) => {
    const processedFiles = {};
    if (!files)
        return processedFiles;
    for (const fieldName in files) {
        const fileArray = files[fieldName];
        if (fileArray && fileArray.length > 0) {
            processedFiles[fieldName] = fileArray[0].path; // Cloudinary URL
        }
    }
    return processedFiles;
};
exports.processUploadedFiles = processUploadedFiles;
// import multer from "multer";
// import path from "path";
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import fs from "fs";
// import { Request } from "express";
// import dotenv from "dotenv";
// dotenv.config();
// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });
// // Allowed file types
// const allowedTypes = [
//   "image/jpeg",
//   "image/png",
//   "image/webp",
//   "image/gif",
//   "application/pdf",
//   "video/mp4",
//   "video/mpeg",
//   "video/quicktime",
// ];
// // File filter function for Multer 2.x
// const fileFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error("Invalid file type. Only images, PDFs, and videos are allowed.")
//     );
//   }
// };
// // Local disk storage configuration
// const diskStorage = multer.diskStorage({
//   destination: function (
//     req: Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, destination: string) => void
//   ) {
//     // Ensure uploads directory exists
//     const uploadDir = "./uploads";
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: function (
//     req: Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, filename: string) => void
//   ) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });
// // Cloudinary storage configuration
// const cloudinaryStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req: Request, file: Express.Multer.File) => {
//     return {
//       folder: "zeniverse",
//       // format: "auto", // Auto-detect file format
//       public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
//       resource_type: "auto", // Automatically detect resource type
//     };
//   },
// });
// // Choose storage based on environment variable
// const useCloudinary = process.env.USE_CLOUDINARY === "true";
// const storage = useCloudinary ? cloudinaryStorage : diskStorage;
// // Configure multer with updated options for v2.x
// const multerConfig = {
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//     files: 5, // Max 5 files
//   },
// };
// // Create multer instance
// const upload = multer(multerConfig);
// // --- Upload middleware functions ---
// const __uploadImage = upload.fields([{ name: "file", maxCount: 1 }]);
// const __uploadMedia = upload.fields([{ name: "file", maxCount: 1 }]);
// const __uploadNewsMedia = upload.fields([
//   { name: "image", maxCount: 1 },
//   { name: "heroImage", maxCount: 1 },
// ]);
// // const __uploadPortfolioMedia = upload.fields([
// //   { name: "image", maxCount: 1 },
// //   { name: "heroImage", maxCount: 1 },
// // ]);
// // Append bannerImage to venture media fields
// const __uploadVentureMedia = upload.fields([
//   { name: "logo", maxCount: 1 },
//   { name: "bannerImage", maxCount: 1 },
//   { name: "investorLogos", maxCount: 20 },
//   { name: "founderPics", maxCount: 20 },
//   { name: "productScreenshots", maxCount: 50 },
// ]);
// // Helper function to process uploaded files
// const processUploadedFiles = async (
//   req: Request,
//   files: any
// ): Promise<{ [key: string]: string }> => {
//   const processedFiles: { [key: string]: string } = {};
//   if (!files) return processedFiles;
//   for (const fieldName in files) {
//     const fileArray = files[fieldName];
//     if (fileArray && fileArray.length > 0) {
//       const file = fileArray[0];
//       if (useCloudinary) {
//         // For Cloudinary, the file.path contains the secure URL
//         processedFiles[fieldName] = file.path;
//       } else {
//         // For local storage, construct the URL path
//         processedFiles[fieldName] = `/uploads/${file.filename}`;
//       }
//     }
//   }
//   return processedFiles;
// };
// export {
//   __uploadImage,
//   __uploadMedia,
//   __uploadNewsMedia,
//   // __uploadPortfolioMedia,
//   __uploadVentureMedia,
//   processUploadedFiles,
//   cloudinary,
// };
//# sourceMappingURL=multer.js.map