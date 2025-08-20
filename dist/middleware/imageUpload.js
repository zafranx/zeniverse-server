"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = void 0;
const multer_1 = require("../utils/multer");
const constants_1 = require("../utils/constants");
const path_1 = __importDefault(require("path"));
const uploadFiles = async (req, res) => {
    try {
        let files = [];
        if (!req.files) {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "No files uploaded"));
            return;
        }
        // Normalize files to array
        if (Array.isArray(req.files)) {
            files = req.files;
        }
        else if ("file" in req.files && Array.isArray(req.files.file)) {
            files = req.files.file;
        }
        else if ("file" in req.files) {
            files = [req.files.file];
        }
        else {
            // If req.files is an object with other fieldnames
            files = Object.values(req.files).flat();
        }
        if (!files || files.length === 0) {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "No files uploaded"));
            return;
        }
        const uploadedFiles = [];
        for (const file of files) {
            const filePath = path_1.default.resolve("./uploads/" + file.filename);
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const isImage = file.mimetype.startsWith("image/");
            const isVideo = file.mimetype.startsWith("video/");
            const isPDF = ext === ".pdf";
            if (isPDF) {
                // Store PDF locally and return local server URL
                uploadedFiles.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    file_type: "pdf",
                    full_URL: `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${file.filename}`,
                    base_URL: process.env.BASE_URL || "http://localhost:5000",
                    size: file.size,
                    mimetype: file.mimetype,
                });
            }
            else if (isImage || isVideo) {
                try {
                    // Upload image/video to Cloudinary with event_assets folder
                    const result = await multer_1.cloudinary.uploader.upload(filePath, {
                        folder: "zeniverse_uploads",
                        resource_type: "auto",
                        quality: "auto:good",
                    });
                    // Delete local file after successful upload
                    await (0, constants_1.__deleteFile)(filePath);
                    uploadedFiles.push({
                        filename: file.filename,
                        originalName: file.originalname,
                        file_type: isVideo ? "video" : "image",
                        public_id: result.public_id,
                        full_URL: result.secure_url, // This returns the format you want
                        base_URL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`,
                        size: file.size,
                        mimetype: file.mimetype,
                        width: result.width,
                        height: result.height,
                        version: result.version,
                        format: result.format,
                    });
                }
                catch (cloudinaryError) {
                    console.error("Cloudinary upload error:", cloudinaryError);
                    // Fallback: keep file locally if Cloudinary fails
                    uploadedFiles.push({
                        filename: file.filename,
                        originalName: file.originalname,
                        file_type: isImage ? "image" : "video",
                        full_URL: `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${file.filename}`,
                        base_URL: process.env.BASE_URL || "http://localhost:5000",
                        size: file.size,
                        mimetype: file.mimetype,
                        cloudinary_error: true,
                    });
                }
            }
            else {
                // Unsupported file type - delete and skip
                await (0, constants_1.__deleteFile)(filePath);
                console.warn(`Unsupported file type: ${file.mimetype} for file: ${file.originalname}`);
                continue;
            }
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, uploadedFiles));
    }
    catch (error) {
        console.error("Upload Error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.uploadFiles = uploadFiles;
// // src/controllers/uploadController.ts
// import { Response } from "express";
// import { AuthRequest } from "../types";
// import { processUploadedFiles, cloudinary } from "../utils/multer";
// import {
//   __requestResponse,
//   __deleteFile,
//   RESPONSE_CODES,
//   RESPONSE_MESSAGES,
// } from "../utils/constants";
// import path from "path";
// export const uploadFiles = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     let files: any[] = [];
//     if (!req.files) {
//       res
//         .status(RESPONSE_CODES.BAD_REQUEST)
//         .json(
//           __requestResponse(RESPONSE_CODES.BAD_REQUEST, "No files uploaded")
//         );
//       return;
//     }
//     if (Array.isArray(req.files)) {
//       files = req.files;
//     } else if ("file" in req.files && Array.isArray((req.files as any).file)) {
//       files = (req.files as any).file;
//     } else if ("file" in req.files) {
//       files = [(req.files as any).file];
//     } else {
//       // If req.files is an object with other fieldnames
//       files = Object.values(req.files).flat();
//     }
//     if (!files || files.length === 0) {
//       res
//         .status(RESPONSE_CODES.BAD_REQUEST)
//         .json(
//           __requestResponse(RESPONSE_CODES.BAD_REQUEST, "No files uploaded")
//         );
//       return;
//     }
//     const uploadedFiles = [];
//     for (const file of files) {
//       const filePath = path.resolve("./uploads/" + file.filename);
//       const ext = path.extname(file.originalname).toLowerCase();
//       const isImage = file.mimetype.startsWith("image/");
//       const isVideo = file.mimetype.startsWith("video/");
//       const isPDF = ext === ".pdf";
//       if (isPDF) {
//         // Store PDF locally
//         uploadedFiles.push({
//           filename: file.filename,
//           originalName: file.originalname,
//           file_type: "pdf",
//           full_URL: `${
//             process.env.BASE_URL || "http://localhost:5000"
//           }/uploads/${file.filename}`,
//           base_URL: process.env.BASE_URL || "http://localhost:5000",
//           size: file.size,
//           mimetype: file.mimetype,
//         });
//       } else if (isImage || isVideo) {
//         try {
//           // Upload image/video to Cloudinary
//           const result = await cloudinary.uploader.upload(filePath, {
//             folder: "zeniverse_uploads",
//             resource_type: "auto",
//             quality: "auto:good",
//             // format: "auto",
//           });
//           // Delete local file after successful upload
//           await __deleteFile(filePath);
//           uploadedFiles.push({
//             filename: file.filename,
//             originalName: file.originalname,
//             file_type: isVideo ? "video" : "image",
//             public_id: result.public_id,
//             full_URL: result.secure_url,
//             base_URL: process.env.BASE_URL || "http://localhost:5000",
//             size: file.size,
//             mimetype: file.mimetype,
//             width: result.width,
//             height: result.height,
//           });
//         } catch (cloudinaryError) {
//           console.error("Cloudinary upload error:", cloudinaryError);
//           // Fallback: keep file locally if Cloudinary fails
//           uploadedFiles.push({
//             filename: file.filename,
//             originalName: file.originalname,
//             file_type: isImage ? "image" : "video",
//             full_URL: `${
//               process.env.BASE_URL || "http://localhost:5000"
//             }/uploads/${file.filename}`,
//             base_URL: process.env.BASE_URL || "http://localhost:5000",
//             size: file.size,
//             mimetype: file.mimetype,
//             cloudinary_error: true,
//           });
//         }
//       } else {
//         // Unsupported file type - delete and skip
//         await __deleteFile(filePath);
//         console.warn(
//           `Unsupported file type: ${file.mimetype} for file: ${file.originalname}`
//         );
//         continue;
//       }
//     }
//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.SUCCESS,
//           uploadedFiles
//         )
//       );
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res
//       .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.INTERNAL_SERVER_ERROR,
//           RESPONSE_MESSAGES.INTERNAL_ERROR
//         )
//       );
//   }
// };
//# sourceMappingURL=imageUpload.js.map