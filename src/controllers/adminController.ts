import { Request, Response } from "express";
import Admin from "../models/Admin";
import News from "../models/News";
import Initiative from "../models/Initiative";
import PortfolioCompany from "../models/Ventures";
import { AuthRequest } from "../types";
import {
  __requestResponse,
  __generateAuthToken,
  __validateEmail,
  RESPONSE_CODES,
  RESPONSE_MESSAGES,
} from "../utils/constants";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      res
        .status(RESPONSE_CODES.BAD_REQUEST)
        .json(
          __requestResponse(
            RESPONSE_CODES.BAD_REQUEST,
            "Username and password are required"
          )
        );
      return;
    }

    // Find admin
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
      isActive: true,
    });

    if (!admin) {
      res
        .status(RESPONSE_CODES.UNAUTHORIZED)
        .json(
          __requestResponse(
            RESPONSE_CODES.UNAUTHORIZED,
            RESPONSE_MESSAGES.INVALID_CREDENTIALS
          )
        );
      return;
    }

    // Check password
    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      res
        .status(RESPONSE_CODES.UNAUTHORIZED)
        .json(
          __requestResponse(
            RESPONSE_CODES.UNAUTHORIZED,
            RESPONSE_MESSAGES.INVALID_CREDENTIALS
          )
        );
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = __generateAuthToken(admin);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, "Login successful", {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin,
        },
      })
    );
  } catch (error) {
    console.error("Login error:", error);
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

export const getDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get counts with Promise.all for better performance
    const [
      newsCount,
      initiativeCount,
      portfolioCount,
      adminCount,
      featuredNews,
      featuredInitiatives,
      activeInitiatives,
    ] = await Promise.all([
      News.countDocuments(),
      Initiative.countDocuments(),
      PortfolioCompany.countDocuments(),
      Admin.countDocuments({ isActive: true }),
      News.countDocuments({ featured: true }),
      Initiative.countDocuments({ featured: true }),
      Initiative.countDocuments({ status: "Active" }),
    ]);

    // Get recent activities
    const [recentNews, recentInitiatives, recentPortfolio] = await Promise.all([
      News.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt category author")
        .lean(),
      Initiative.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt category status")
        .lean(),
      PortfolioCompany.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name createdAt")
        .lean(),
    ]);

    // Get category statistics
    const [newsCategories, initiativeCategories] = await Promise.all([
      News.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Initiative.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const dashboardData = {
      counts: {
        news: newsCount,
        initiatives: initiativeCount,
        portfolio: portfolioCount,
        admins: adminCount,
        featuredNews,
        featuredInitiatives,
        activeInitiatives,
      },
      recentActivities: {
        news: recentNews,
        initiatives: recentInitiatives,
        portfolio: recentPortfolio,
      },
      statistics: {
        newsCategories,
        initiativeCategories,
      },
    };

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          RESPONSE_MESSAGES.SUCCESS,
          dashboardData
        )
      );
  } catch (error) {
    console.error("Dashboard error:", error);
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

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await Admin.findById(req.user?.id).select("-password").lean();
    if (!admin) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(__requestResponse(RESPONSE_CODES.NOT_FOUND, "Admin not found"));
      return;
    }

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
        admin,
      })
    );
  } catch (error) {
    console.error("Get profile error:", error);
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

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const adminId = req.user?.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(__requestResponse(RESPONSE_CODES.NOT_FOUND, "Admin not found"));
      return;
    }

    // Validate email if provided
    if (email && !__validateEmail(email)) {
      res
        .status(RESPONSE_CODES.VALIDATION_ERROR)
        .json(
          __requestResponse(
            RESPONSE_CODES.VALIDATION_ERROR,
            "Invalid email format"
          )
        );
      return;
    }

    // Update basic info
    if (name) admin.name = name;
    if (email) admin.email = email;

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        res
          .status(RESPONSE_CODES.BAD_REQUEST)
          .json(
            __requestResponse(
              RESPONSE_CODES.BAD_REQUEST,
              "Current password is required"
            )
          );
        return;
      }

      const isValidPassword = await admin.comparePassword(currentPassword);
      if (!isValidPassword) {
        res
          .status(RESPONSE_CODES.UNAUTHORIZED)
          .json(
            __requestResponse(
              RESPONSE_CODES.UNAUTHORIZED,
              "Current password is incorrect"
            )
          );
        return;
      }

      admin.password = newPassword;
    }

    await admin.save();

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.UPDATED, {
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      })
    );
  } catch (error) {
    console.error("Update profile error:", error);
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

export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res
    .status(RESPONSE_CODES.SUCCESS)
    .json(__requestResponse(RESPONSE_CODES.SUCCESS, "Logout successful"));
};
