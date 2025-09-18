import { Response } from "express";
import ContactSocial from "../models/ContactSocial";
// import { AuthRequest } from "../middleware/auth";
import { AuthRequest } from "../types";
import { RESPONSE_CODES, RESPONSE_MESSAGES } from "../utils/constants";
import { __requestResponse } from "../utils/constants";
import { v4 as uuidv4 } from 'uuid';

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
    
    const existing = await ContactSocial.findOne(query);
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// Get all contact social records (Admin)
export const getAllContactSocial = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
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
        { "contactDetails.label": { $regex: search, $options: "i" } },
        { "socialMediaLinks.label": { $regex: search, $options: "i" } },
      ];
    }

    if (isPublished !== undefined) {
      query.isPublished = isPublished === "true";
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const [contactSocialRecords, totalRecords] = await Promise.all([
      ContactSocial.find(query)
        .populate("createdBy", "username email")
        .populate("lastModifiedBy", "username email")
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      ContactSocial.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalRecords / limitNumber);

    const responseData = {
      contactSocialRecords,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalRecords,
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
    console.error("Error fetching contact social records:", error);
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

// Get contact social by ID (Public)
export const getContactSocialById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const contactSocial = await ContactSocial.findById(id)
      .populate("createdBy", "username email")
      .populate("lastModifiedBy", "username email")
      .lean();

    if (!contactSocial) {
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
          contactSocial
        )
      );
  } catch (error) {
    console.error("Error fetching contact social by ID:", error);
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

// Get published contact social (Public)
export const getPublishedContactSocial = async (req: AuthRequest, res: Response) => {
  try {
    const contactSocial = await ContactSocial.findOne({ isPublished: true })
      .populate("createdBy", "username email")
      .populate("lastModifiedBy", "username email")
      .lean();

    if (!contactSocial) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "No published contact social information found"
          )
        );
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          contactSocial
        )
      );
  } catch (error) {
    console.error("Error fetching published contact social:", error);
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

// Create contact social (Admin)
export const createContactSocial = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title = "Contact & Social Media Information",
      contactDetails = [],
      socialMediaLinks = [],
      isPublished = false,
      publishedAt,
      version = "1.0",
    } = req.body;

    // Check if there's already a published record when trying to publish
    if (isPublished) {
      const existingPublished = await ContactSocial.findOne({ isPublished: true });
      if (existingPublished) {
        return res
          .status(RESPONSE_CODES.CONFLICT)
          .json(
            __requestResponse(
              RESPONSE_CODES.CONFLICT,
              "A published contact social record already exists. Only one can be published at a time."
            )
          );
      }
    }

    // Generate unique slug from title
    const slug = await generateUniqueSlug(title);

    // Add IDs to contact details and social media links if not present
    const processedContactDetails = contactDetails.map((detail: any) => ({
      ...detail,
      id: detail.id || uuidv4(),
    }));

    const processedSocialMediaLinks = socialMediaLinks.map((link: any) => ({
      ...link,
      id: link.id || uuidv4(),
    }));

    const newContactSocial = new ContactSocial({
      title,
      slug,
      contactDetails: processedContactDetails,
      socialMediaLinks: processedSocialMediaLinks,
      isPublished,
      publishedAt: isPublished ? publishedAt || new Date() : null,
      version,
      createdBy: req.user?.id,
      lastModifiedBy: req.user?.id,
    });

    const savedContactSocial = await newContactSocial.save();
    await savedContactSocial.populate("createdBy", "username email");
    await savedContactSocial.populate("lastModifiedBy", "username email");

    res
      .status(RESPONSE_CODES.CREATED)
      .json(
        __requestResponse(
          RESPONSE_CODES.CREATED,
          RESPONSE_MESSAGES.CREATED,
          savedContactSocial
        )
      );
  } catch (error: any) {
    console.error("Error creating contact social:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res
        .status(RESPONSE_CODES.CONFLICT)
        .json(
          __requestResponse(
            RESPONSE_CODES.CONFLICT,
            `Contact social with this ${field} already exists`
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

// Update contact social (Admin)
export const updateContactSocial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.createdAt;

    // Set last modified info
    updateData.lastModifiedBy = req.user?.id;
    updateData.updatedAt = new Date();

    // If publishing, check for existing published record
    if (updateData.isPublished) {
      const existingPublished = await ContactSocial.findOne({
        isPublished: true,
        _id: { $ne: id },
      });

      if (existingPublished) {
        return res
          .status(RESPONSE_CODES.CONFLICT)
          .json(
            __requestResponse(
              RESPONSE_CODES.CONFLICT,
              "A published contact social record already exists. Only one can be published at a time."
            )
          );
      }

      updateData.publishedAt = updateData.publishedAt || new Date();
    }

    // Update slug if title is changed
    if (updateData.title) {
      updateData.slug = await generateUniqueSlug(updateData.title, id);
    }

    // Process contact details and social media links to ensure they have IDs
    if (updateData.contactDetails) {
      updateData.contactDetails = updateData.contactDetails.map((detail: any) => ({
        ...detail,
        id: detail.id || uuidv4(),
      }));
    }

    if (updateData.socialMediaLinks) {
      updateData.socialMediaLinks = updateData.socialMediaLinks.map((link: any) => ({
        ...link,
        id: link.id || uuidv4(),
      }));
    }

    const updatedContactSocial = await ContactSocial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "username email")
      .populate("lastModifiedBy", "username email");

    if (!updatedContactSocial) {
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
          updatedContactSocial
        )
      );
  } catch (error: any) {
    console.error("Error updating contact social:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res
        .status(RESPONSE_CODES.CONFLICT)
        .json(
          __requestResponse(
            RESPONSE_CODES.CONFLICT,
            `Contact social with this ${field} already exists`
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

// Delete contact social (Admin)
export const deleteContactSocial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deletedContactSocial = await ContactSocial.findByIdAndDelete(id);

    if (!deletedContactSocial) {
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
          "Contact social deleted successfully",
          { id }
        )
      );
  } catch (error) {
    console.error("Error deleting contact social:", error);
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
export const toggleContactSocialStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    // If publishing, check for existing published record
    if (isPublished) {
      const existingPublished = await ContactSocial.findOne({
        isPublished: true,
        _id: { $ne: id },
      });

      if (existingPublished) {
        return res
          .status(RESPONSE_CODES.CONFLICT)
          .json(
            __requestResponse(
              RESPONSE_CODES.CONFLICT,
              "A published contact social record already exists. Only one can be published at a time."
            )
          );
      }
    }

    const updateData: any = {
      isPublished,
      lastModifiedBy: req.user?.id,
      updatedAt: new Date(),
    };

    if (isPublished) {
      updateData.publishedAt = new Date();
    }

    const updatedContactSocial = await ContactSocial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "username email")
      .populate("lastModifiedBy", "username email");

    if (!updatedContactSocial) {
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
          `Contact social ${isPublished ? "published" : "unpublished"} successfully`,
          updatedContactSocial
        )
      );
  } catch (error) {
    console.error("Error toggling contact social status:", error);
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

// ===== CONTACT DETAILS MANAGEMENT =====

// Add contact detail
export const addContactDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contactDetail = {
      ...req.body,
      id: req.body.id || uuidv4(),
    };

    const contactSocial = await ContactSocial.findById(id);
    if (!contactSocial) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact social record not found"
          )
        );
    }

    contactSocial.contactDetails.push(contactDetail);
    contactSocial.lastModifiedBy = req.user?.id as any;
    contactSocial.updatedAt = new Date();

    await contactSocial.save();

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Contact detail added successfully",
          contactDetail
        )
      );
  } catch (error) {
    console.error("Error adding contact detail:", error);
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

// Update contact detail
export const updateContactDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id, detailId } = req.params;
    const updateData = req.body;

    const contactSocial = await ContactSocial.findById(id);
    if (!contactSocial) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact social record not found"
          )
        );
    }

    const detailIndex = contactSocial.contactDetails.findIndex(
      (detail: any) => detail.id === detailId
    );

    if (detailIndex === -1) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact detail not found"
          )
        );
    }

    contactSocial.contactDetails[detailIndex] = {
      ...contactSocial.contactDetails[detailIndex],
      ...updateData,
      id: detailId, // Preserve the ID
    };

    contactSocial.lastModifiedBy = req.user?.id as any;
    contactSocial.updatedAt = new Date();

    await contactSocial.save();

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Contact detail updated successfully",
          contactSocial.contactDetails[detailIndex]
        )
      );
  } catch (error) {
    console.error("Error updating contact detail:", error);
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

// Remove contact detail
export const removeContactDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id, detailId } = req.params;

    const contactSocial = await ContactSocial.findById(id);
    if (!contactSocial) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact social record not found"
          )
        );
    }

    const initialLength = contactSocial.contactDetails.length;
    contactSocial.contactDetails = contactSocial.contactDetails.filter(
      (detail: any) => detail.id !== detailId
    );

    if (contactSocial.contactDetails.length === initialLength) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact detail not found"
          )
        );
    }

    contactSocial.lastModifiedBy = req.user?.id as any;
    contactSocial.updatedAt = new Date();

    await contactSocial.save();

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Contact detail removed successfully",
          { id: detailId }
        )
      );
  } catch (error) {
    console.error("Error removing contact detail:", error);
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

// ===== SOCIAL MEDIA MANAGEMENT =====

// Add social media link
export const addSocialMediaLink = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const socialMediaLink = {
      ...req.body,
      id: req.body.id || uuidv4(),
    };

    const contactSocial = await ContactSocial.findById(id);
    if (!contactSocial) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact social record not found"
          )
        );
    }

    contactSocial.socialMediaLinks.push(socialMediaLink);
    contactSocial.lastModifiedBy = req.user?.id as any;
    contactSocial.updatedAt = new Date();

    await contactSocial.save();

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Social media link added successfully",
          socialMediaLink
        )
      );
  } catch (error) {
    console.error("Error adding social media link:", error);
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

// Update social media link
export const updateSocialMediaLink = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id, linkId } = req.params;
    const updateData = req.body;

    const contactSocial = await ContactSocial.findById(id);
    if (!contactSocial) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact social record not found"
          )
        );
    }

    const linkIndex = contactSocial.socialMediaLinks.findIndex(
      (link: any) => link.id === linkId
    );

    if (linkIndex === -1) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Social media link not found"
          )
        );
    }

    contactSocial.socialMediaLinks[linkIndex] = {
      ...contactSocial.socialMediaLinks[linkIndex],
      ...updateData,
      id: linkId, // Preserve the ID
    };

    contactSocial.lastModifiedBy = req.user?.id as any;
    contactSocial.updatedAt = new Date();

    await contactSocial.save();

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Social media link updated successfully",
          contactSocial.socialMediaLinks[linkIndex]
        )
      );
  } catch (error) {
    console.error("Error updating social media link:", error);
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

// Remove social media link
export const removeSocialMediaLink = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id, linkId } = req.params;

    const contactSocial = await ContactSocial.findById(id);
    if (!contactSocial) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact social record not found"
          )
        );
    }

    const initialLength = contactSocial.socialMediaLinks.length;
    contactSocial.socialMediaLinks = contactSocial.socialMediaLinks.filter(
      // (link: any) => link.id !== linkId
      (link: any) => link._id !== linkId
    );

    if (contactSocial.socialMediaLinks.length === initialLength) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Social media link not found"
          )
        );
    }

    contactSocial.lastModifiedBy = req.user?.id as any;
    contactSocial.updatedAt = new Date();

    await contactSocial.save();

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Social media link removed successfully",
          { id: linkId }
        )
      );
  } catch (error) {
    console.error("Error removing social media link:", error);
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

// Publish contact social record
export const publishContactSocial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const contactSocial = await ContactSocial.findById(id);
    if (!contactSocial) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact social record not found",
            null
          )
        );
    }

    contactSocial.isPublished = true;
    contactSocial.publishedAt = new Date();
    contactSocial.lastModifiedBy = req.user?.id as any; // Type assertion to handle potential undefined
    contactSocial.updatedAt = new Date();
    await contactSocial.save();

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Contact social record published successfully",
          contactSocial
        )
      );
  } catch (error) {
    console.error("Error publishing contact social record:", error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR,
          null
        )
      );
  }
};

// Unpublish contact social record
export const unpublishContactSocial = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const contactSocial = await ContactSocial.findById(id);
    if (!contactSocial) {
      return res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(
          __requestResponse(
            RESPONSE_CODES.NOT_FOUND,
            "Contact social record not found",
            null
          )
        );
    }

    contactSocial.isPublished = false;
    contactSocial.lastModifiedBy = req.user?.id as any; // Type assertion to handle potential undefined
    contactSocial.updatedAt = new Date();
    await contactSocial.save();

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Contact social record unpublished successfully",
          contactSocial
        )
      );
  } catch (error) {
    console.error("Error unpublishing contact social record:", error);
    res
      .status(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
      .json(
        __requestResponse(
          RESPONSE_CODES.INTERNAL_SERVER_ERROR,
          RESPONSE_MESSAGES.INTERNAL_ERROR,
          null
        )
      );
  }
};