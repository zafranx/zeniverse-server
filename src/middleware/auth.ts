import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { AuthRequest } from "../types";
import {
  __requestResponse,
  RESPONSE_CODES,
  RESPONSE_MESSAGES,
} from "../utils/constants";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = (req as any).headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res
        .status(RESPONSE_CODES.UNAUTHORIZED)
        .json(
          __requestResponse(
            RESPONSE_CODES.UNAUTHORIZED,
            "Access token required"
          )
        );
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret-key"
    ) as any;

    const admin = await Admin.findById(decoded.user.id).select("-password");
    if (!admin || !admin.isActive) {
      res
        .status(RESPONSE_CODES.UNAUTHORIZED)
        .json(
          __requestResponse(
            RESPONSE_CODES.UNAUTHORIZED,
            "Invalid or inactive admin"
          )
        );
      return;
    }

    req.user = {
      id: (admin._id as any).toString(),
      username: admin.username,
      role: admin.role,
    };

    next();
  } catch (error) {
    if ((error as { name?: string }).name === "TokenExpiredError") {
      res
        .status(RESPONSE_CODES.UNAUTHORIZED)
        .json(
          __requestResponse(
            RESPONSE_CODES.UNAUTHORIZED,
            RESPONSE_MESSAGES.TOKEN_EXPIRED
          )
        );
    } else {
      res
        .status(RESPONSE_CODES.FORBIDDEN)
        .json(__requestResponse(RESPONSE_CODES.FORBIDDEN, "Invalid token"));
    }
  }
};

export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "superadmin") {
    res
      .status(RESPONSE_CODES.FORBIDDEN)
      .json(
        __requestResponse(
          RESPONSE_CODES.FORBIDDEN,
          "Super admin access required"
        )
      );
    return;
  }
  next();
};

export const requireAdminOrSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
    res
      .status(RESPONSE_CODES.FORBIDDEN)
      .json(
        __requestResponse(RESPONSE_CODES.FORBIDDEN, "Admin access required")
      );
    return;
  }
  next();
};
