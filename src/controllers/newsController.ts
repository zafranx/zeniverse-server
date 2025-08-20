import { Response } from "express";
import News from "../models/News";
import { AuthRequest } from "../types";
import { processUploadedFiles } from "../utils/multer";
import {
  __requestResponse,
  __deleteFile,
  __deleteCloudinaryFile,
  __extractCloudinaryPublicId,
  __generateSlug,
  RESPONSE_CODES,
  RESPONSE_MESSAGES,
} from "../utils/constants";

export const getAllNews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const featured = req.query.featured as string;
    const author = req.query.author as string;

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

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
    } else if (featured === "false") {
      filter.featured = false;
    }

    const [news, total, categories, authors] = await Promise.all([
      News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      News.countDocuments(filter),
      News.distinct("category"),
      News.distinct("author"),
    ]);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
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
      })
    );
  } catch (error) {
    console.error("Get all news error:", error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

export const getNewsById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const news = await News.findById(req.params.id).lean();
    if (!news) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(RESPONSE_CODES.NOT_FOUND, "News article not found")
        );
      return;
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
          news,
        })
      );
  } catch (error) {
    console.error("Get news by ID error:", error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

export const createNews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const newsData = req.body;

    // Process uploaded files
    const uploadedFiles = await processUploadedFiles(req as any, req.files);

    // Update newsData with file URLs
    if (uploadedFiles.image) newsData.image = uploadedFiles.image;
    if (uploadedFiles.heroImage) newsData.heroImage = uploadedFiles.heroImage;

    // Parse JSON fields if they exist
    if (typeof newsData.tags === "string") {
      try {
        newsData.tags = JSON.parse(newsData.tags);
      } catch (e) {
        newsData.tags = newsData.tags
          .split(",")
          .map((tag: string) => tag.trim());
      }
    }

    if (typeof newsData.detailedSections === "string") {
      try {
        newsData.detailedSections = JSON.parse(newsData.detailedSections);
      } catch (e) {
        res
          .status(RESPONSE_CODES.VALIDATION_ERROR)
          .json(
            __requestResponse(
              RESPONSE_CODES.VALIDATION_ERROR,
              "Invalid detailed sections format"
            )
          );
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
        .status(RESPONSE_CODES.VALIDATION_ERROR)
        .json(
          __requestResponse(
            RESPONSE_CODES.VALIDATION_ERROR,
            `Missing required fields: ${missingFields.join(", ")}`
          )
        );
      return;
    }

    const news = new News(newsData);
    await news.save();

    res
      .status(RESPONSE_CODES.CREATED)
      .json(
        __requestResponse(RESPONSE_CODES.CREATED, RESPONSE_MESSAGES.CREATED, {
          news,
        })
      );
  } catch (error) {
    console.error("Create news error:", error);

    if ((error as any).name === "ValidationError") {
      res
        .status(RESPONSE_CODES.VALIDATION_ERROR)
        .json(
          __requestResponse(RESPONSE_CODES.VALIDATION_ERROR, (error as Error).message)
        );
    } else {
      res
        .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
        .json(
          __requestResponse(
            RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            RESPONSE_MESSAGES.INTERNAL_ERROR
          )
        );
    }
  }
};

export const updateNews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const newsData = req.body;
    const newsId = req.params.id;

    // Find existing news
    const existingNews = await News.findById(newsId);
    if (!existingNews) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(RESPONSE_CODES.NOT_FOUND, "News article not found")
        );
      return;
    }

    // Process uploaded files
    const uploadedFiles = await processUploadedFiles(req as any, req.files);

    // Handle file replacements
    if (uploadedFiles.image) {
      // Delete old image if it exists
      if (existingNews.image) {
        try {
          if (process.env.USE_CLOUDINARY === "true") {
            const publicId = __extractCloudinaryPublicId(existingNews.image);
            if (publicId) await __deleteCloudinaryFile(publicId);
          } else {
            await __deleteFile(
              `./uploads/${existingNews.image.split("/").pop()}`
            );
          }
        } catch (error) {
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
            const publicId = __extractCloudinaryPublicId(
              existingNews.heroImage
            );
            if (publicId) await __deleteCloudinaryFile(publicId);
          } else {
            await __deleteFile(
              `./uploads/${existingNews.heroImage.split("/").pop()}`
            );
          }
        } catch (error) {
          console.error("Error deleting old hero image:", error);
        }
      }
      newsData.heroImage = uploadedFiles.heroImage;
    }

    // Parse JSON fields if they exist
    if (typeof newsData.tags === "string") {
      try {
        newsData.tags = JSON.parse(newsData.tags);
      } catch (e) {
        newsData.tags = newsData.tags
          .split(",")
          .map((tag: string) => tag.trim());
      }
    }

    if (typeof newsData.detailedSections === "string") {
      try {
        newsData.detailedSections = JSON.parse(newsData.detailedSections);
      } catch (e) {
        res
          .status(RESPONSE_CODES.VALIDATION_ERROR)
          .json(
            __requestResponse(
              RESPONSE_CODES.VALIDATION_ERROR,
              "Invalid detailed sections format"
            )
          );
        return;
      }
    }

    const news = await News.findByIdAndUpdate(newsId, newsData, {
      new: true,
      runValidators: true,
    });

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.UPDATED, {
          news,
        })
      );
  } catch (error) {
    console.error("Update news error:", error);

    if ((error as Error).name === "ValidationError") {
      res
        .status(RESPONSE_CODES.VALIDATION_ERROR)
        .json(
          __requestResponse(
            RESPONSE_CODES.VALIDATION_ERROR,
            (error as Error).message
          )
        );
    } else {
      res
        .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
        .json(
          __requestResponse(
            RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            RESPONSE_MESSAGES.INTERNAL_ERROR
          )
        );
    }
  }
};

export const deleteNews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(RESPONSE_CODES.NOT_FOUND, "News article not found")
        );
      return;
    }

    // Delete associated files
    const filesToDelete = [news.image, news.heroImage].filter(Boolean);

    for (const fileUrl of filesToDelete) {
      try {
        if (process.env.USE_CLOUDINARY === "true") {
          const publicId = __extractCloudinaryPublicId(fileUrl);
          if (publicId) await __deleteCloudinaryFile(publicId);
        } else {
          await __deleteFile(`./uploads/${fileUrl.split("/").pop()}`);
        }
      } catch (error) {
        console.error("Error deleting file:", fileUrl, error);
      }
    }

    await News.findByIdAndDelete(req.params.id);

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.DELETED)
      );
  } catch (error) {
    console.error("Delete news error:", error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

export const toggleFeatured = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(RESPONSE_CODES.NOT_FOUND, "News article not found")
        );
      return;
    }

    news.featured = !news.featured;
    await news.save();

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          `News ${news.featured ? "featured" : "unfeatured"} successfully`,
          { news }
        )
      );
  } catch (error) {
    console.error("Toggle featured error:", error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR
        )
      );
  }
};

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
