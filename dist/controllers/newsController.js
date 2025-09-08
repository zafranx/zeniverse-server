"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFeatured = exports.deleteNews = exports.updateNews = exports.createNews = exports.getNewsById = exports.getAllNews = void 0;
const News_1 = __importDefault(require("../models/News"));
const multer_1 = require("../utils/multer");
const constants_1 = require("../utils/constants");
const getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const category = req.query.category;
        const featured = req.query.featured;
        const author = req.query.author;
        const skip = (page - 1) * limit;
        // Build filter query
        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { excerpt: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } },
                { tags: { $in: [new RegExp(search, "i")] } },
            ];
        }
        if (category && category !== "all") {
            filter.category = category;
        }
        if (author && author !== "all") {
            filter.author = author;
        }
        if (featured === "true") {
            filter.featured = true;
        }
        else if (featured === "false") {
            filter.featured = false;
        }
        const [news, total, categories, authors] = await Promise.all([
            News_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            News_1.default.countDocuments(filter),
            News_1.default.distinct("category"),
            News_1.default.distinct("author"),
        ]);
        res.status(constants_1.RESPONSE_CODES.SUCCESS).json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            news,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            filters: {
                categories,
                authors,
            },
        }));
    }
    catch (error) {
        console.error("Get all news error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getAllNews = getAllNews;
const getNewsById = async (req, res) => {
    try {
        const news = await News_1.default.findById(req.params.id).lean();
        if (!news) {
            res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "News article not found"));
            return;
        }
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.SUCCESS, {
            news,
        }));
    }
    catch (error) {
        console.error("Get news by ID error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.getNewsById = getNewsById;
const createNews = async (req, res) => {
    try {
        const newsData = req.body;
        // Process uploaded files
        const uploadedFiles = await (0, multer_1.processUploadedFiles)(req, req.files);
        // Update newsData with file URLs
        if (uploadedFiles.image)
            newsData.image = uploadedFiles.image;
        if (uploadedFiles.heroImage)
            newsData.heroImage = uploadedFiles.heroImage;
        // Parse JSON fields if they exist
        if (typeof newsData.tags === "string") {
            try {
                newsData.tags = JSON.parse(newsData.tags);
            }
            catch (e) {
                newsData.tags = newsData.tags
                    .split(",")
                    .map((tag) => tag.trim());
            }
        }
        if (typeof newsData.detailedSections === "string") {
            try {
                newsData.detailedSections = JSON.parse(newsData.detailedSections);
            }
            catch (e) {
                res
                    .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                    .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, "Invalid detailed sections format"));
                return;
            }
        }
        // Validation
        const requiredFields = [
            "title",
            "excerpt",
            "author",
            "category",
            "readTime",
        ];
        const missingFields = requiredFields.filter((field) => !newsData[field]);
        if (missingFields.length > 0) {
            res
                .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, `Missing required fields: ${missingFields.join(", ")}`));
            return;
        }
        const news = new News_1.default(newsData);
        await news.save();
        res
            .status(constants_1.RESPONSE_CODES.CREATED)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.CREATED, constants_1.RESPONSE_MESSAGES.CREATED, {
            news,
        }));
    }
    catch (error) {
        console.error("Create news error:", error);
        if (error.name === "ValidationError") {
            res
                .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, error.message));
        }
        else {
            res
                .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
        }
    }
};
exports.createNews = createNews;
const updateNews = async (req, res) => {
    try {
        const newsData = req.body;
        const newsId = req.params.id;
        // Find existing news
        const existingNews = await News_1.default.findById(newsId);
        if (!existingNews) {
            res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "News article not found"));
            return;
        }
        // Process uploaded files
        const uploadedFiles = await (0, multer_1.processUploadedFiles)(req, req.files);
        // Handle file replacements
        if (uploadedFiles.image) {
            // Delete old image if it exists
            if (existingNews.image) {
                try {
                    if (process.env.USE_CLOUDINARY === "true") {
                        const publicId = (0, constants_1.__extractCloudinaryPublicId)(existingNews.image);
                        if (publicId)
                            await (0, constants_1.__deleteCloudinaryFile)(publicId);
                    }
                    else {
                        await (0, constants_1.__deleteFile)(`./uploads/${existingNews.image.split("/").pop()}`);
                    }
                }
                catch (error) {
                    console.error("Error deleting old image:", error);
                }
            }
            newsData.image = uploadedFiles.image;
        }
        if (uploadedFiles.heroImage) {
            // Delete old hero image if it exists
            if (existingNews.heroImage) {
                try {
                    if (process.env.USE_CLOUDINARY === "true") {
                        const publicId = (0, constants_1.__extractCloudinaryPublicId)(existingNews.heroImage);
                        if (publicId)
                            await (0, constants_1.__deleteCloudinaryFile)(publicId);
                    }
                    else {
                        await (0, constants_1.__deleteFile)(`./uploads/${existingNews.heroImage.split("/").pop()}`);
                    }
                }
                catch (error) {
                    console.error("Error deleting old hero image:", error);
                }
            }
            newsData.heroImage = uploadedFiles.heroImage;
        }
        // Parse JSON fields if they exist
        if (typeof newsData.tags === "string") {
            try {
                newsData.tags = JSON.parse(newsData.tags);
            }
            catch (e) {
                newsData.tags = newsData.tags
                    .split(",")
                    .map((tag) => tag.trim());
            }
        }
        if (typeof newsData.detailedSections === "string") {
            try {
                newsData.detailedSections = JSON.parse(newsData.detailedSections);
            }
            catch (e) {
                res
                    .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                    .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, "Invalid detailed sections format"));
                return;
            }
        }
        const news = await News_1.default.findByIdAndUpdate(newsId, newsData, {
            new: true,
            runValidators: true,
        });
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.UPDATED, {
            news,
        }));
    }
    catch (error) {
        console.error("Update news error:", error);
        if (error.name === "ValidationError") {
            res
                .status(constants_1.RESPONSE_CODES.VALIDATION_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.VALIDATION_ERROR, error.message));
        }
        else {
            res
                .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
        }
    }
};
exports.updateNews = updateNews;
const deleteNews = async (req, res) => {
    try {
        const news = await News_1.default.findById(req.params.id);
        if (!news) {
            res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "News article not found"));
            return;
        }
        // Delete associated files
        const filesToDelete = [news.image, news.heroImage].filter(Boolean);
        for (const fileUrl of filesToDelete) {
            try {
                if (process.env.USE_CLOUDINARY === "true") {
                    const publicId = (0, constants_1.__extractCloudinaryPublicId)(fileUrl);
                    if (publicId)
                        await (0, constants_1.__deleteCloudinaryFile)(publicId);
                }
                else {
                    await (0, constants_1.__deleteFile)(`./uploads/${fileUrl.split("/").pop()}`);
                }
            }
            catch (error) {
                console.error("Error deleting file:", fileUrl, error);
            }
        }
        await News_1.default.findByIdAndDelete(req.params.id);
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, constants_1.RESPONSE_MESSAGES.DELETED));
    }
    catch (error) {
        console.error("Delete news error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.deleteNews = deleteNews;
const toggleFeatured = async (req, res) => {
    try {
        const news = await News_1.default.findById(req.params.id);
        if (!news) {
            res
                .status(constants_1.RESPONSE_CODES.NOT_FOUND)
                .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.NOT_FOUND, "News article not found"));
            return;
        }
        news.featured = !news.featured;
        await news.save();
        res
            .status(constants_1.RESPONSE_CODES.SUCCESS)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.SUCCESS, `News ${news.featured ? "featured" : "unfeatured"} successfully`, { news }));
    }
    catch (error) {
        console.error("Toggle featured error:", error);
        res
            .status(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .json((0, constants_1.__requestResponse)(constants_1.RESPONSE_CODES.INTERNAL_SERVER_ERROR, constants_1.RESPONSE_MESSAGES.INTERNAL_ERROR));
    }
};
exports.toggleFeatured = toggleFeatured;
// import { Response } from "express";
// import News from "../models/News";
// import { AuthRequest } from "../types";
// export const getAllNews = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;
//     const [news, total] = await Promise.all([
//       News.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
//       News.countDocuments(),
//     ]);
//     res.json({
//       news,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Get all news error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// export const getNewsById = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const news = await News.findById(req.params.id);
//     if (!news) {
//       res.status(404).json({ message: "News not found" });
//       return;
//     }
//     res.json({ news });
//   } catch (error) {
//     console.error("Get news by ID error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// export const createNews = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const newsData = req.body;
//     // Handle file uploads if present
//     if (req.files) {
//       const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//       if (files.image) newsData.image = `/uploads/${files.image[0].filename}`;
//       if (files.heroImage)
//         newsData.heroImage = `/uploads/${files.heroImage.filename}`;
//     }
//     const news = new News(newsData);
//     await news.save();
//     res.status(201).json({
//       message: "News created successfully",
//       news,
//     });
//   } catch (error) {
//     console.error("Create news error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// export const updateNews = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const newsData = req.body;
//     // Handle file uploads if present
//     if (req.files) {
//       const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//       if (files.image) newsData.image = `/uploads/${files.image[0].filename}`;
//       if (files.heroImage)
//         newsData.heroImage = `/uploads/${files.heroImage.filename}`;
//     }
//     const news = await News.findByIdAndUpdate(req.params.id, newsData, {
//       new: true,
//       runValidators: true,
//     });
//     if (!news) {
//       res.status(404).json({ message: "News not found" });
//       return;
//     }
//     res.json({
//       message: "News updated successfully",
//       news,
//     });
//   } catch (error) {
//     console.error("Update news error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// export const deleteNews = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const news = await News.findByIdAndDelete(req.params.id);
//     if (!news) {
//       res.status(404).json({ message: "News not found" });
//       return;
//     }
//     res.json({ message: "News deleted successfully" });
//   } catch (error) {
//     console.error("Delete news error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
//# sourceMappingURL=newsController.js.map