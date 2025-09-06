import { Response } from "express";
import TeamMember from "../models/TeamMember";
import { AuthRequest } from "../types";
import { processUploadedFiles } from "../utils/multer";
import {
  __requestResponse,
  __deleteFile,
  __deleteCloudinaryFile,
  __extractCloudinaryPublicId,
  RESPONSE_CODES,
  RESPONSE_MESSAGES,
} from "../utils/constants";

// Get all team members
export const getAllTeamMembers = async (req: AuthRequest, res: Response) => {
  try {
    const teamMembers = await TeamMember.find({ isActive: true })
      .sort({ sort_order: 1, name: 1 })
      .lean();

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.SUCCESS,
        teamMembers
      )
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Get team members error:", error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGES.INTERNAL_ERROR
      )
    );
  }
};

// Get all team members (admin)
export const getAllTeamMembersAdmin = async (req: AuthRequest, res: Response) => {
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
        { name: searchRegex },
        { role: searchRegex },
        { description: searchRegex },
      ];
    }

    // Status filter
    if (req.query.status && req.query.status !== "all") {
      filterQuery.isActive = req.query.status === "true";
    }

    const [teamMembers, total] = await Promise.all([
      TeamMember.find(filterQuery)
        .sort({ sort_order: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TeamMember.countDocuments(filterQuery),
    ]);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.SUCCESS,
        {
          teamMembers,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        }
      )
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Get team members admin error:", error);
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

// Get team member by ID
export const getTeamMemberById = async (req: AuthRequest, res: Response) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id).lean();

    if (!teamMember) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json(
        __requestResponse(
          RESPONSE_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.NOT_FOUND
        )
      );
    }

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.SUCCESS,
        teamMember
      )
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Get team member by ID error:", error);
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

// Create team member
export const createTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, description, sort_order, isActive, imageUrl } = req.body;
    
    // Handle image - either from file upload or Cloudinary URL
    let imageToSave = null;
    
    // Check for Cloudinary URL first (since you always use Cloudinary)
    if (imageUrl && typeof imageUrl === 'string') {
      imageToSave = imageUrl;
    } else {
      // Fallback to file upload if no URL provided
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const processedFiles = processUploadedFiles(files);
      imageToSave = processedFiles.image;
    }
    
    if (!imageToSave) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json(
        __requestResponse(
          RESPONSE_CODES.BAD_REQUEST,
          "Image is required"
        )
      );
    }

    const newTeamMember = new TeamMember({
      name,
      role,
      description,
      image: imageToSave,
      sort_order: sort_order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await newTeamMember.save();

    res.status(RESPONSE_CODES.CREATED).json(
      __requestResponse(
        RESPONSE_CODES.CREATED,
        RESPONSE_MESSAGES.CREATED,
        newTeamMember
      )
    );
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGES.INTERNAL_ERROR
      )
    );
  }
};

// Update team member
export const updateTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, description, sort_order, isActive } = req.body;
    
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json(
        __requestResponse(
          RESPONSE_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.NOT_FOUND
        )
      );
    }

    // Process uploaded image if provided
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const processedFiles = processUploadedFiles(files);
    
    // Update fields
    teamMember.name = name || teamMember.name;
    teamMember.role = role || teamMember.role;
    teamMember.description = description || teamMember.description;
    
    if (sort_order !== undefined) {
      teamMember.sort_order = sort_order;
    }
    
    if (isActive !== undefined) {
      teamMember.isActive = isActive;
    }
    
    // Update image if provided
    if (processedFiles.image) {
      // Delete old image if it's a Cloudinary URL
      if (teamMember.image && teamMember.image.includes('cloudinary')) {
        const publicId = __extractCloudinaryPublicId(teamMember.image);
        if (publicId) {
          await __deleteCloudinaryFile(publicId);
        }
      } else if (teamMember.image) {
        // Delete local file
        await __deleteFile(teamMember.image);
      }
      
      teamMember.image = processedFiles.image;
    }

    await teamMember.save();

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.UPDATED,
        teamMember
      )
    );
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGES.INTERNAL_ERROR
      )
    );
  }
};

// Delete team member
export const deleteTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json(
        __requestResponse(
          RESPONSE_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.NOT_FOUND
        )
      );
    }

    // Delete image if it's a Cloudinary URL
    if (teamMember.image && teamMember.image.includes('cloudinary')) {
      const publicId = __extractCloudinaryPublicId(teamMember.image);
      if (publicId) {
        await __deleteCloudinaryFile(publicId);
      }
    } else if (teamMember.image) {
      // Delete local file
      await __deleteFile(teamMember.image);
    }

    await teamMember.deleteOne();

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.DELETED
      )
    );
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGES.INTERNAL_ERROR
      )
    );
  }
};

// Toggle team member active status
export const toggleTeamMemberStatus = async (req: AuthRequest, res: Response) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json(
        __requestResponse(
          RESPONSE_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.NOT_FOUND
        )
      );
    }

    teamMember.isActive = !teamMember.isActive;
    await teamMember.save();

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.UPDATED,
        { isActive: teamMember.isActive }
      )
    );
  } catch (error) {
    console.error("Toggle team member status error:", error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGES.INTERNAL_ERROR
      )
    );
  }
};