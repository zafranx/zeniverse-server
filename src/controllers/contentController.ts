import { Response } from "express";
import Content from "../models/Content";
// import { AuthRequest } from "../middleware/auth";
import { AuthRequest } from "../types";

import { RESPONSE_CODES, RESPONSE_MESSAGES } from "../utils/constants";
import { __requestResponse } from "../utils/constants";

// Helper function to generate unique slug
const generateUniqueSlug = async (title: string, excludeId?: string): Promise<string> => {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existing = await Content.findOne(query);
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// Get all content (Admin)
export const getAllContent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      type,
      isPublished,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { "sections.title": { $regex: search, $options: "i" } },
        { "sections.content": { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (isPublished !== undefined) {
      query.isPublished = isPublished === "true";
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const [content, totalContent] = await Promise.all([
      Content.find(query)
        .populate("createdBy", "username email")
        .populate("lastModifiedBy", "username email")
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Content.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalContent / limitNumber);

    const responseData = {
      content,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalContent,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    };

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          responseData
        )
      );
  } catch (error) {
    console.error("Error fetching content:", error);
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

// Get content by ID (Public)
export const getContentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await Content.findById(id)
      .populate("createdBy", "username email")
      .populate("lastModifiedBy", "username email")
      .lean();

    if (!content) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          content
        )
      );
  } catch (error) {
    console.error("Error fetching content by ID:", error);
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

// Get content by type and published status (Public)
export const getContentByType = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params;
    const { published = "true" } = req.query;

    const query: any = { type };
    if (published === "true") {
      query.isPublished = true;
    }

    const content = await Content.findOne(query)
      .populate("createdBy", "username email")
      .populate("lastModifiedBy", "username email")
      .lean();

    if (!content) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            `No ${published === "true" ? "published " : ""}content found for type: ${type}`
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          content
        )
      );
  } catch (error) {
    console.error("Error fetching content by type:", error);
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

// Get content by slug (Public)
export const getContentBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const { published = "true" } = req.query;

    const query: any = { slug };
    if (published === "true") {
      query.isPublished = true;
    }

    const content = await Content.findOne(query)
      .populate("createdBy", "username email")
      .populate("lastModifiedBy", "username email")
      .lean();

    if (!content) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            `No ${published === "true" ? "published " : ""}content found for slug: ${slug}`
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          content
        )
      );
  } catch (error) {
    console.error("Error fetching content by slug:", error);
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

// Create content (Admin)
export const createContent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      title,
      content,
      sections = [],
      seo,
      isPublished = false,
      publishedAt,
      version = "1.0",
    } = req.body;

    // Check if there's already a published content of the same type when trying to publish
    if (isPublished) {
      const existingActiveContent = await Content.findOne({
        type,
        isPublished: true,
      });

      if (existingActiveContent) {
        return res
          .status(RESPONSE_CODES.CONFLICT)
          .json(
            __requestResponse(
              RESPONSE_CODES.CONFLICT,
              `Active ${type} content already exists. Only one active content per type is allowed.`
            )
          );
      }
    }

    // Generate unique slug from title
    const slug = await generateUniqueSlug(title);

    const newContent = new Content({
      type,
      title,
      slug,
      content,
      sections,
      seo,
      isPublished,
      publishedAt: isPublished ? publishedAt || new Date() : null,
      version,
      createdBy: req.user?.id,
      lastModifiedBy: req.user?.id,
    });

    const savedContent = await newContent.save();
    await savedContent.populate("createdBy", "username email");
    await savedContent.populate("lastModifiedBy", "username email");

    res
      .status(RESPONSE_CODES.CREATED)
      .json(
        __requestResponse(
          RESPONSE_CODES.CREATED,
          RESPONSE_MESSAGES.CREATED,
          savedContent
        )
      );
  } catch (error: any) {
    console.error("Error creating content:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res
        .status(RESPONSE_CODES.CONFLICT)
        .json(
          __requestResponse(
            RESPONSE_CODES.CONFLICT,
            `Content with this ${field} already exists`
          )
        );
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

// Update content (Admin)
export const updateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.createdAt;

    // Set last modified info
    updateData.lastModifiedBy = req.user?.id;
    updateData.updatedAt = new Date();

    // If publishing, check for existing active content
    if (updateData.isPublished) {
      const currentContent = await Content.findById(id);
      if (!currentContent) {
        return res
          .status(RESPONSE_CODES.NOT_FOUND)
          .json(
            __requestResponse(
              RESPONSE_CODES.NOT_FOUND,
              RESPONSE_MESSAGES.NOT_FOUND
            )
          );
      }

      const existingActiveContent = await Content.findOne({
        type: currentContent.type,
        isPublished: true,
        _id: { $ne: id },
      });

      if (existingActiveContent) {
        return res
          .status(RESPONSE_CODES.CONFLICT)
          .json(
            __requestResponse(
              RESPONSE_CODES.CONFLICT,
              `Active ${currentContent.type} content already exists. Only one active content per type is allowed.`
            )
          );
      }

      updateData.publishedAt = updateData.publishedAt || new Date();
    }

    // Update slug if title is changed
    if (updateData.title) {
      updateData.slug = await generateUniqueSlug(updateData.title, id);
    }

    const updatedContent = await Content.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "username email")
      .populate("lastModifiedBy", "username email");

    if (!updatedContent) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.UPDATED,
          updatedContent
        )
      );
  } catch (error: any) {
    console.error("Error updating content:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res
        .status(RESPONSE_CODES.CONFLICT)
        .json(
          __requestResponse(
            RESPONSE_CODES.CONFLICT,
            `Content with this ${field} already exists`
          )
        );
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

// Delete content (Admin)
export const deleteContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deletedContent = await Content.findByIdAndDelete(id);

    if (!deletedContent) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Content deleted successfully",
          { id }
        )
      );
  } catch (error) {
    console.error("Error deleting content:", error);
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

// Toggle publish status (Admin)
export const toggleContentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    // If publishing, check for existing active content
    if (isPublished) {
      const currentContent = await Content.findById(id);
      if (!currentContent) {
        return res
          .status(RESPONSE_CODES.NOT_FOUND)
          .json(
            __requestResponse(
              RESPONSE_CODES.NOT_FOUND,
              RESPONSE_MESSAGES.NOT_FOUND
            )
          );
      }

      const existingActiveContent = await Content.findOne({
        type: currentContent.type,
        isPublished: true,
        _id: { $ne: id },
      });

      if (existingActiveContent) {
        return res
          .status(RESPONSE_CODES.CONFLICT)
          .json(
            __requestResponse(
              RESPONSE_CODES.CONFLICT,
              `Active ${currentContent.type} content already exists. Only one active content per type is allowed.`
            )
          );
      }
    } // <- This closing brace was missing!

    const updateData: any = {
      isPublished,
      lastModifiedBy: req.user?.id,
      updatedAt: new Date(),
    };

    if (isPublished) {
      updateData.publishedAt = new Date();
    }

    const updatedContent = await Content.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "username email")
      .populate("lastModifiedBy", "username email");

    if (!updatedContent) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          `Content ${isPublished ? "published" : "unpublished"} successfully`,
          updatedContent
        )
      );
  } catch (error) {
    console.error("Error toggling content status:", error);
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

// ===== SEO SETTINGS MANAGEMENT =====

// Get SEO settings for a content item
export const getSEOSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await Content.findById(id).select('seo');
    if (!content) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Content not found"
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          content.seo || {}
        )
      );
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
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

// Update SEO settings for a content item
export const updateSEOSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { seo } = req.body;

    const updatedContent = await Content.findByIdAndUpdate(
      id,
      {
        seo,
        lastModifiedBy: req.user?.id,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('seo');

    if (!updatedContent) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            RESPONSE_MESSAGES.NOT_FOUND
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "SEO settings updated successfully",
          updatedContent.seo
        )
      );
  } catch (error) {
    console.error("Error updating SEO settings:", error);
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

// Publish content
export const publishContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findById(id);
    if (!content) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json(
        __requestResponse(RESPONSE_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND, null)
      );
    }

    content.isPublished = true;
    content.publishedAt = new Date();
    content.lastModifiedBy = req.user?.id;
    content.lastModifiedAt = new Date();
    
    await content.save();

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, "Content published successfully", content)
    );
  } catch (error: any) {
    console.error("Error publishing content:", error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(RESPONSE_CODES.INTERNAL_SERVER_ERROR, error.message, null)
    );
  }
};

// Unpublish content
export const unpublishContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findById(id);
    if (!content) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json(
        __requestResponse(RESPONSE_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND, null)
      );
    }

    content.isPublished = false;
    content.publishedAt = undefined;
    content.lastModifiedBy = req.user?.id;
    content.lastModifiedAt = new Date();
    
    await content.save();

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, "Content unpublished successfully", content)
    );
  } catch (error: any) {
    console.error("Error unpublishing content:", error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(RESPONSE_CODES.INTERNAL_SERVER_ERROR, error.message, null)
    );
  }
};

// Get published content by type (Public)
export const getPublishedContentByType = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params;
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "publishedAt",
      sortOrder = "desc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build query for published content only
    const query: any = {
      type,
      isPublished: true,
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { "sections.title": { $regex: search, $options: "i" } },
        { "sections.content": { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const [content, totalContent] = await Promise.all([
      Content.find(query)
        .select("-createdBy -lastModifiedBy -lastModifiedAt") // Hide admin fields for public
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Content.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalContent / limitNumber);

    const responseData = {
      content,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalContent,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    };

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, responseData)
    );
  } catch (error: any) {
    console.error("Error fetching published content by type:", error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(RESPONSE_CODES.INTERNAL_SERVER_ERROR, error.message, null)
    );
  }
};