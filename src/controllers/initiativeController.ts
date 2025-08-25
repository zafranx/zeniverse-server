// src/controllers/initiativeController.ts
import { Response } from "express";
import Initiative from "../models/Initiative";
import { AuthRequest } from "../types";
import {
  __requestResponse,
  RESPONSE_CODES,
  RESPONSE_MESSAGES,
} from "../utils/constants";

export const getAllInitiatives = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: any = {};

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, "i");
      filterQuery.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { impact: searchRegex },
      ];
    }

    // Status filter
    if (req.query.status && req.query.status !== "all") {
      filterQuery.status = req.query.status;
    }

    // Category filter
    if (req.query.category && req.query.category !== "all") {
      filterQuery.category = req.query.category;
    }

    // Featured filter
    if (req.query.featured && req.query.featured !== "all") {
      filterQuery.featured = req.query.featured === "true";
    }

    const [initiatives, total] = await Promise.all([
      Initiative.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Initiative.countDocuments(filterQuery),
    ]);

    // Get unique categories and authors for filters
    const [categories, authors] = await Promise.all([
      Initiative.distinct("category"),
      Initiative.distinct("author"),
    ]);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
        initiatives,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          categories: categories.filter(Boolean), // Remove empty values
          authors: authors.filter(Boolean),
        },
      })
    );
  } catch (error) {
    console.error("Get all initiatives error:", error);
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

export const getInitiativeById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const initiative = await Initiative.findById(req.params.id);

    if (!initiative) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(RESPONSE_CODES.NOT_FOUND, "Initiative not found")
        );
      return;
    }

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
        initiative,
      })
    );
  } catch (error) {
    console.error("Get initiative by ID error:", error);

    // Handle invalid ObjectId error
    if (error.name === "CastError") {
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            "Invalid initiative ID format"
          )
        );
      return;
    }

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

export const createInitiative = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const initiativeData = req.body;

    // Validate required fields
    if (!initiativeData.title || !initiativeData.author) {
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            "Title and author are required fields"
          )
        );
      return;
    }

    // Handle file uploads if present (for backward compatibility)
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.image) {
        initiativeData.image = `/uploads/${files.image[0].filename}`;
      }
      if (files.heroImage) {
        initiativeData.heroImage = `/uploads/${files.heroImage.filename}`;
      }
    }

    const initiative = new Initiative(initiativeData);
    await initiative.save();

    res.status(RESPONSE_CODES.CREATED).json(
      __requestResponse(
        RESPONSE_CODES.CREATED,
        "Initiative created successfully",
        {
          initiative,
        }
      )
    );
  } catch (error) {
    console.error("Create initiative error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            `Validation failed: ${validationErrors.join(", ")}`
          )
        );
      return;
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      res
        .status(RESPONSE_CODES.CONFLICT)
        .json(
          __requestResponse(
            RESPONSE_CODES.CONFLICT,
            "Initiative with this title already exists"
          )
        );
      return;
    }

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

export const updateInitiative = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const initiativeData = req.body;

    // Validate required fields if provided
    if (initiativeData.title && !initiativeData.title.trim()) {
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(RESPONSE_CODES.BAD_REQUEST, "Title cannot be empty")
        );
      return;
    }

    if (initiativeData.author && !initiativeData.author.trim()) {
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            "Author cannot be empty"
          )
        );
      return;
    }

    // Handle file uploads if present (for backward compatibility)
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.image) {
        initiativeData.image = `/uploads/${files.image[0].filename}`;
      }
      if (files.heroImage) {
        initiativeData.heroImage = `/uploads/${files.heroImage.filename}`;
      }
    }

    const initiative = await Initiative.findByIdAndUpdate(
      req.params.id,
      initiativeData,
      { new: true, runValidators: true }
    );

    if (!initiative) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(RESPONSE_CODES.NOT_FOUND, "Initiative not found")
        );
      return;
    }

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        "Initiative updated successfully",
        {
          initiative,
        }
      )
    );
  } catch (error) {
    console.error("Update initiative error:", error);

    // Handle invalid ObjectId error
    if (error.name === "CastError") {
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            "Invalid initiative ID format"
          )
        );
      return;
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            `Validation failed: ${validationErrors.join(", ")}`
          )
        );
      return;
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      res
        .status(RESPONSE_CODES.CONFLICT)
        .json(
          __requestResponse(
            RESPONSE_CODES.CONFLICT,
            "Initiative with this title already exists"
          )
        );
      return;
    }

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

export const deleteInitiative = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const initiative = await Initiative.findByIdAndDelete(req.params.id);

    if (!initiative) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(RESPONSE_CODES.NOT_FOUND, "Initiative not found")
        );
      return;
    }

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        "Initiative deleted successfully",
        {
          deletedInitiative: {
            id: initiative._id,
            title: initiative.title,
          },
        }
      )
    );
  } catch (error) {
    console.error("Delete initiative error:", error);

    // Handle invalid ObjectId error
    if (error.name === "CastError") {
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            "Invalid initiative ID format"
          )
        );
      return;
    }

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

// Additional utility functions for advanced features

export const getFeaturedInitiatives = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const featuredInitiatives = await Initiative.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
        initiatives: featuredInitiatives,
        count: featuredInitiatives.length,
      })
    );
  } catch (error) {
    console.error("Get featured initiatives error:", error);
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

export const getInitiativesByStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.params;
    const validStatuses = ["Active", "In Progress", "Planned", "Completed"];

    if (!validStatuses.includes(status)) {
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`
          )
        );
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [initiatives, total] = await Promise.all([
      Initiative.find({ status })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Initiative.countDocuments({ status }),
    ]);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
        initiatives,
        status,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Get initiatives by status error:", error);
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

export const getInitiativeStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalInitiatives,
      activeInitiatives,
      inProgressInitiatives,
      plannedInitiatives,
      completedInitiatives,
      featuredInitiatives,
      categoryCounts,
    ] = await Promise.all([
      Initiative.countDocuments(),
      Initiative.countDocuments({ status: "Active" }),
      Initiative.countDocuments({ status: "In Progress" }),
      Initiative.countDocuments({ status: "Planned" }),
      Initiative.countDocuments({ status: "Completed" }),
      Initiative.countDocuments({ featured: true }),
      Initiative.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const stats = {
      total: totalInitiatives,
      byStatus: {
        active: activeInitiatives,
        inProgress: inProgressInitiatives,
        planned: plannedInitiatives,
        completed: completedInitiatives,
      },
      featured: featuredInitiatives,
      categories: categoryCounts.reduce((acc, item) => {
        acc[item._id || "Uncategorized"] = item.count;
        return acc;
      }, {}),
      completionRate:
        totalInitiatives > 0
          ? Math.round((completedInitiatives / totalInitiatives) * 100)
          : 0,
    };

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
        stats,
      })
    );
  } catch (error) {
    console.error("Get initiative stats error:", error);
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
