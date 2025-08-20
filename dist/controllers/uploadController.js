"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = void 0;
const multer_1 = require("../utils/multer");
const constants_1 = require("../utils/constants");
const uploadFiles = async (req, res) => {
    try {
        if (!req.files) {
            res
                .status(constants_1.RESPONSE_CODES.BAD_REQUEST)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.BAD_REQUEST, "No files uploaded"));
            return;
        }
        // Extract Cloudinary URLs directly
        const uploadedFiles = await (0, multer_1.processUploadedFiles)(req, req.files);
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
//     if (!req.files || !req.files.file || req.files.file.length === 0) {
//       res
//         .status(RESPONSE_CODES.BAD_REQUEST)
//         .json(
//           __requestResponse(RESPONSE_CODES.BAD_REQUEST, "No files uploaded")
//         );
//       return;
//     }
//     const uploadedFiles = [];
//     const files = Array.isArray(req.files.file)
//       ? req.files.file
//       : [req.files.file];
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
//           // full_URL: `${
//           //   process.env.BASE_URL || "http://localhost:5000"
//           // }/uploads/${file.filename}`,
//           // base_URL: process.env.BASE_URL || "http://localhost:5000",
//           full_URL: `${req.protocol}://${req.get("host")}/uploads/${
//             file.filename
//           }`,
//           base_URL: `${req.protocol}://${req.get("host")}`,
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
//             // base_URL: process.env.BASE_URL || "http://localhost:5000",
//             base_URL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`,
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
//# sourceMappingURL=uploadController.js.map