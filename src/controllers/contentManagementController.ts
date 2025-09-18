// import { Request, Response } from "express";
// import ContentManagement from "../models/ContentManagement";
// import {
//   __requestResponse,
//   RESPONSE_CODES,
//   RESPONSE_MESSAGES,
//   __generateSlug,
// } from "../utils/constants";
// import Admin from "../models/Admin";
// import { AuthRequest } from "../types";

// // Helper function to generate unique slug
// const generateUniqueSlug = async (title: string, excludeId?: string) => {
//   let baseSlug = __generateSlug(title);
//   let slug = baseSlug;
//   let counter = 1;

//   while (true) {
//     const query: any = { slug };
//     if (excludeId) {
//       query._id = { $ne: excludeId };
//     }

//     const existingSlug = await ContentManagement.findOne(query);
//     if (!existingSlug) {
//       break;
//     }

//     slug = `${baseSlug}-${counter}`;
//     counter++;
//   }

//   return slug;
// };

// // Get all content with filters and pagination (Public)
// export const getAllContent = async (req: AuthRequest, res: Response) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       type,
//       isPublished,
//       search,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//     } = req.query;

//     const pageNumber = parseInt(page as string, 10);
//     const limitNumber = parseInt(limit as string, 10);
//     const skip = (pageNumber - 1) * limitNumber;

//     // Build filter object
//     const filter: any = {};

//     if (type) {
//       filter.type = type;
//     }

//     if (isPublished !== undefined) {
//       filter.isPublished = isPublished === "true";
//     }

//     if (search) {
//       filter.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { content: { $regex: search, $options: "i" } },
//         { "seo.metaDescription": { $regex: search, $options: "i" } },
//       ];
//     }

//     // Build sort object
//     const sort: any = {};
//     sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

//     const content = await ContentManagement.find(filter)
//       .populate("createdBy", "username email")
//       .populate("lastModifiedBy", "username email")
//       .sort(sort)
//       .skip(skip)
//       .limit(limitNumber)
//       .lean();

//     const totalContent = await ContentManagement.countDocuments(filter);
//     const totalPages = Math.ceil(totalContent / limitNumber);

//     const responseData = {
//       content,
//       pagination: {
//         currentPage: pageNumber,
//         totalPages,
//         totalContent,
//         hasNextPage: pageNumber < totalPages,
//         hasPrevPage: pageNumber > 1,
//       },
//     };

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.SUCCESS,
//           responseData
//         )
//       );
//   } catch (error) {
//     console.error("Error fetching content:", error);
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

// // Get content by type (Public)
// export const getContentByType = async (req: AuthRequest, res: Response) => {
//   try {
//     const { type } = req.params;
//     const { isPublished = "true" } = req.query;

//     const filter: any = { type };
//     if (isPublished === "true") {
//       filter.isPublished = true;
//     }

//     const content = await ContentManagement.findOne(filter)
//       .populate("createdBy", "username email")
//       .populate("lastModifiedBy", "username email")
//       .lean();

//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             `${type} content not found`
//           )
//         );
//     }

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.SUCCESS,
//           content
//         )
//       );
//   } catch (error) {
//     console.error("Error fetching content by type:", error);
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

// // Get content by ID (Public)
// export const getContentById = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;

//     const content = await ContentManagement.findById(id)
//       .populate("createdBy", "username email")
//       .populate("lastModifiedBy", "username email")
//       .lean();

//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             RESPONSE_MESSAGES.NOT_FOUND
//           )
//         );
//     }

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.SUCCESS,
//           content
//         )
//       );
//   } catch (error) {
//     console.error("Error fetching content by ID:", error);
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

// // Get content by slug (Public)
// export const getContentBySlug = async (req: AuthRequest, res: Response) => {
//   try {
//     const { slug } = req.params;

//     const content = await ContentManagement.findOne({
//       slug,
//       isPublished: true,
//     })
//       .populate("createdBy", "username email")
//       .populate("lastModifiedBy", "username email")
//       .lean();

//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(__requestResponse(RESPONSE_CODES.NOT_FOUND, "Content not found"));
//     }

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.SUCCESS,
//           content
//         )
//       );
//   } catch (error) {
//     console.error("Error fetching content by slug:", error);
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

// // Create new content (Admin)
// export const createContent = async (req: AuthRequest, res: Response) => {
//   try {
//     const {
//       type,
//       title,
//       content,
//       sections,
//       contactDetails,
//       socialMediaLinks,
//       seo,
//       isPublished = false,
//       publishedAt,
//       version = "1.0",
//     } = req.body;

//     // Validate required fields
//     const requiredFields = ["type", "title"];
//     const missing = requiredFields.filter((field) => !req.body[field]);

//     if (missing.length > 0) {
//       return res
//         .status(RESPONSE_CODES.VALIDATION_ERROR)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.VALIDATION_ERROR,
//             `Missing required fields: ${missing.join(", ")}`
//           )
//         );
//     }

//     // Validate content type
//     const validTypes = [
//       "privacy_policy",
//       "terms_of_service",
//       "contact_details",
//       "about_us",
//       "faq",
//     ];
//     if (!validTypes.includes(type)) {
//       return res
//         .status(RESPONSE_CODES.VALIDATION_ERROR)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.VALIDATION_ERROR,
//             `Invalid content type. Must be one of: ${validTypes.join(", ")}`
//           )
//         );
//     }

//     // Check if active content of this type already exists
//     if (isPublished) {
//       const existingActiveContent = await ContentManagement.findOne({
//         type,
//         isPublished: true,
//       });

//       if (existingActiveContent) {
//         return res
//           .status(RESPONSE_CODES.CONFLICT)
//           .json(
//             __requestResponse(
//               RESPONSE_CODES.CONFLICT,
//               `Active ${type} content already exists. Only one active content per type is allowed.`
//             )
//           );
//       }
//     }

//     // Generate unique slug from title
//     const slug = await generateUniqueSlug(title);

//     // Remove the duplicate slug check since generateUniqueSlug handles it
//     // const existingSlug = await ContentManagement.findOne({ slug });
//     // if (existingSlug) {
//     //   return res
//     //     .status(RESPONSE_CODES.CONFLICT)
//     //     .json(
//     //       __requestResponse(
//     //         RESPONSE_CODES.CONFLICT,
//     //         "Content with this title already exists"
//     //       )
//     //     );
//     // }

//     const newContent = new ContentManagement({
//       type,
//       title,
//       slug,
//       content,
//       sections,
//       contactDetails,
//       socialMediaLinks,
//       seo,
//       isPublished,
//       publishedAt: isPublished ? publishedAt || new Date() : null,
//       version,
//       createdBy: req.user?.id,
//       lastModifiedBy: req.user?.id,
//     });

//     const savedContent = await newContent.save();
//     await savedContent.populate("createdBy", "username email");
//     await savedContent.populate("lastModifiedBy", "username email");

//     res
//       .status(RESPONSE_CODES.CREATED)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.CREATED,
//           RESPONSE_MESSAGES.CREATED,
//           savedContent
//         )
//       );
//   } catch (error: any) {
//     console.error("Error creating content:", error);

//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res
//         .status(RESPONSE_CODES.CONFLICT)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.CONFLICT,
//             `Content with this ${field} already exists`
//           )
//         );
//     }

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

// // Update content (Admin)
// export const updateContent = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };

//     // Remove fields that shouldn't be updated directly
//     delete updateData.createdBy;
//     delete updateData.createdAt;

//     // Set last modified info
//     updateData.lastModifiedBy = req.user?.id;
//     updateData.updatedAt = new Date();

//     // If publishing, check for existing active content
//     if (updateData.isPublished) {
//       const currentContent = await ContentManagement.findById(id);
//       if (!currentContent) {
//         return res
//           .status(RESPONSE_CODES.NOT_FOUND)
//           .json(
//             __requestResponse(
//               RESPONSE_CODES.NOT_FOUND,
//               RESPONSE_MESSAGES.NOT_FOUND
//             )
//           );
//       }

//       const existingActiveContent = await ContentManagement.findOne({
//         type: currentContent.type,
//         isPublished: true,
//         _id: { $ne: id },
//       });

//       if (existingActiveContent) {
//         return res
//           .status(RESPONSE_CODES.CONFLICT)
//           .json(
//             __requestResponse(
//               RESPONSE_CODES.CONFLICT,
//               `Active ${currentContent.type} content already exists. Only one active content per type is allowed.`
//             )
//           );
//       }

//       updateData.publishedAt = updateData.publishedAt || new Date();
//     }

//     // Update slug if title is changed
//     if (updateData.title) {
//       updateData.slug = await generateUniqueSlug(updateData.title, id);

//       // Remove the duplicate slug check
//       // const existingSlug = await ContentManagement.findOne({
//       //   slug: updateData.slug,
//       //   _id: { $ne: id },
//       // });
//       // if (existingSlug) {
//       //   return res
//       //     .status(RESPONSE_CODES.CONFLICT)
//       //     .json(
//       //       __requestResponse(
//       //         RESPONSE_CODES.CONFLICT,
//       //         "Content with this title already exists"
//       //       )
//       //     );
//       // }
//     }

//     const updatedContent = await ContentManagement.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     )
//       .populate("createdBy", "username email")
//       .populate("lastModifiedBy", "username email");

//     if (!updatedContent) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             RESPONSE_MESSAGES.NOT_FOUND
//           )
//         );
//     }

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.UPDATED,
//           updatedContent
//         )
//       );
//   } catch (error: any) {
//     console.error("Error updating content:", error);

//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res
//         .status(RESPONSE_CODES.CONFLICT)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.CONFLICT,
//             `Content with this ${field} already exists`
//           )
//         );
//     }

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

// // Delete content (Admin)
// export const deleteContent = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;

//     const deletedContent = await ContentManagement.findByIdAndDelete(id);

//     if (!deletedContent) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             RESPONSE_MESSAGES.NOT_FOUND
//           )
//         );
//     }

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.DELETED, {
//           id: deletedContent._id,
//         })
//       );
//   } catch (error) {
//     console.error("Error deleting content:", error);
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

// // Toggle content status (Admin)
// export const toggleContentStatus = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;

//     const content = await ContentManagement.findById(id);
//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             RESPONSE_MESSAGES.NOT_FOUND
//           )
//         );
//     }

//     const newStatus = !content.isPublished;

//     // If publishing, check for existing active content
//     if (newStatus) {
//       const existingActiveContent = await ContentManagement.findOne({
//         type: content.type,
//         isPublished: true,
//         _id: { $ne: id },
//       });

//       if (existingActiveContent) {
//         return res
//           .status(RESPONSE_CODES.CONFLICT)
//           .json(
//             __requestResponse(
//               RESPONSE_CODES.CONFLICT,
//               `Active ${content.type} content already exists. Only one active content per type is allowed.`
//             )
//           );
//       }
//     }

//     const updatedContent = await ContentManagement.findByIdAndUpdate(
//       id,
//       {
//         isPublished: newStatus,
//         publishedAt: newStatus ? new Date() : null,
//         lastModifiedBy: req.user?.id,
//         updatedAt: new Date(),
//       },
//       { new: true }
//     )
//       .populate("createdBy", "username email")
//       .populate("lastModifiedBy", "username email");

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           `Content ${newStatus ? "published" : "unpublished"} successfully`,
//           updatedContent
//         )
//       );
//   } catch (error) {
//     console.error("Error toggling content status:", error);
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

// // ===== UNIFIED CONTACT INFO MANAGEMENT =====

// // Get all contact info (both contact details and social media)
// export const getContactInfo = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { type } = req.query; // Optional filter by type

//     const content = await ContentManagement.findById(id).select('contactInfo');
//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             "Content not found"
//           )
//         );
//     }

//     let contactInfo = content.contactInfo || [];

//     // Filter by type if specified
//     if (type) {
//       contactInfo = contactInfo.filter(info => info.type === type);
//     }

//     // Separate contact details and social media for backward compatibility
//     const contactDetails = contactInfo.filter(info => info.type !== 'social');
//     const socialMedia = contactInfo.filter(info => info.type === 'social');

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.SUCCESS,
//           {
//             contactInfo,
//             contactDetails, // For backward compatibility
//             socialMedia, // For backward compatibility
//           }
//         )
//       );
//   } catch (error) {
//     console.error("Error fetching contact info:", error);
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

// // Update contact info (unified endpoint)
// export const updateContactInfo = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { contactInfo } = req.body;

//     const updatedContent = await ContentManagement.findByIdAndUpdate(
//       id,
//       {
//         contactInfo,
//         lastModifiedBy: req.user?.id,
//         updatedAt: new Date(),
//       },
//       { new: true, runValidators: true }
//     ).select('contactInfo');

//     if (!updatedContent) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             RESPONSE_MESSAGES.NOT_FOUND
//           )
//         );
//     }

//     const contactInfo_result = updatedContent.contactInfo || [];
//     const contactDetails = contactInfo_result.filter(info => info.type !== 'social');
//     const socialMedia = contactInfo_result.filter(info => info.type === 'social');

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           "Contact information updated successfully",
//           {
//             contactInfo: contactInfo_result,
//             contactDetails,
//             socialMedia,
//           }
//         )
//       );
//   } catch (error) {
//     console.error("Error updating contact info:", error);
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

// // Legacy endpoints for backward compatibility
// export const getContactDetails = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;

//     const content = await ContentManagement.findById(id).select('contactInfo');
//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             "Content not found"
//           )
//         );
//     }

//     const contactDetails = (content.contactInfo || []).filter(info => info.type !== 'social');

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.SUCCESS,
//           contactDetails
//         )
//       );
//   } catch (error) {
//     console.error("Error fetching contact details:", error);
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

// export const updateContactDetails = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { contactDetails } = req.body;

//     // Get existing contact info
//     const content = await ContentManagement.findById(id);
//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             RESPONSE_MESSAGES.NOT_FOUND
//           )
//         );
//     }

//     // Keep social media, replace contact details
//     const socialMedia = (content.contactInfo || []).filter(info => info.type === 'social');
//     const newContactInfo = [...contactDetails, ...socialMedia];

//     const updatedContent = await ContentManagement.findByIdAndUpdate(
//       id,
//       {
//         contactInfo: newContactInfo,
//         lastModifiedBy: req.user?.id,
//         updatedAt: new Date(),
//       },
//       { new: true, runValidators: true }
//     ).select('contactInfo');

//     const updatedContactDetails = (updatedContent?.contactInfo || []).filter(info => info.type !== 'social');

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           "Contact details updated successfully",
//           updatedContactDetails
//         )
//       );
//   } catch (error) {
//     console.error("Error updating contact details:", error);
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

// export const getSocialMediaLinks = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;

//     const content = await ContentManagement.findById(id).select('contactInfo');
//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             "Content not found"
//           )
//         );
//     }

//     const socialMediaLinks = (content.contactInfo || []).filter(info => info.type === 'social');

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.SUCCESS,
//           socialMediaLinks
//         )
//       );
//   } catch (error) {
//     console.error("Error fetching social media links:", error);
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

// export const updateSocialMediaLinks = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { socialMediaLinks } = req.body;

//     // Get existing contact info
//     const content = await ContentManagement.findById(id);
//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             RESPONSE_MESSAGES.NOT_FOUND
//           )
//         );
//     }

//     // Keep contact details, replace social media
//     const contactDetails = (content.contactInfo || []).filter(info => info.type !== 'social');
//     const newContactInfo = [...contactDetails, ...socialMediaLinks];

//     const updatedContent = await ContentManagement.findByIdAndUpdate(
//       id,
//       {
//         contactInfo: newContactInfo,
//         lastModifiedBy: req.user?.id,
//         updatedAt: new Date(),
//       },
//       { new: true, runValidators: true }
//     ).select('contactInfo');

//     const updatedSocialMedia = (updatedContent?.contactInfo || []).filter(info => info.type === 'social');

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           "Social media links updated successfully",
//           updatedSocialMedia
//         )
//       );
//   } catch (error) {
//     console.error("Error updating social media links:", error);
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

// // ===== SEO SETTINGS MANAGEMENT =====

// // Get SEO settings for a content item
// export const getSEOSettings = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;

//     const content = await ContentManagement.findById(id).select('seo');
//     if (!content) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             "Content not found"
//           )
//         );
//     }

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           RESPONSE_MESSAGES.SUCCESS,
//           content.seo || {}
//         )
//       );
//   } catch (error) {
//     console.error("Error fetching SEO settings:", error);
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

// // Update SEO settings for a content item
// export const updateSEOSettings = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { seo } = req.body;

//     const updatedContent = await ContentManagement.findByIdAndUpdate(
//       id,
//       {
//         seo,
//         lastModifiedBy: req.user?.id,
//         updatedAt: new Date(),
//       },
//       { new: true, runValidators: true }
//     ).select('seo');

//     if (!updatedContent) {
//       return res
//         .status(RESPONSE_CODES.NOT_FOUND)
//         .json(
//           __requestResponse(
//             RESPONSE_CODES.NOT_FOUND,
//             RESPONSE_MESSAGES.NOT_FOUND
//           )
//         );
//     }

//     res
//       .status(RESPONSE_CODES.SUCCESS)
//       .json(
//         __requestResponse(
//           RESPONSE_CODES.SUCCESS,
//           "SEO settings updated successfully",
//           updatedContent.seo
//         )
//       );
//   } catch (error) {
//     console.error("Error updating SEO settings:", error);
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
