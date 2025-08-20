import { Request, Response, NextFunction } from "express";
import {
  __requestResponse,
  RESPONSE_CODES,
  RESPONSE_MESSAGES,
} from "../utils/constants";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error);

  // Handle specific error types
  if (error.code === "LIMIT_FILE_SIZE") {
    res
      .status(RESPONSE_CODES.BAD_REQUEST)
      .json(
        __requestResponse(
          RESPONSE_CODES.BAD_REQUEST,
          "File size too large (max 5MB)"
        )
      );
    return;
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    res
      .status(RESPONSE_CODES.BAD_REQUEST)
      .json(
        __requestResponse(RESPONSE_CODES.BAD_REQUEST, "Too many files uploaded")
      );
    return;
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    res
      .status(RESPONSE_CODES.CONFLICT)
      .json(
        __requestResponse(RESPONSE_CODES.CONFLICT, `${field} already exists`)
      );
    return;
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    res
      .status(RESPONSE_CODES.VALIDATION_ERROR)
      .json(
        __requestResponse(RESPONSE_CODES.VALIDATION_ERROR, messages.join(", "))
      );
    return;
  }

  if (error.name === "CastError") {
    res
      .status(RESPONSE_CODES.BAD_REQUEST)
      .json(__requestResponse(RESPONSE_CODES.BAD_REQUEST, "Invalid ID format"));
    return;
  }

  if (error.message && error.message.includes("Invalid file type")) {
    res
      .status(RESPONSE_CODES.BAD_REQUEST)
      .json(__requestResponse(RESPONSE_CODES.BAD_REQUEST, error.message));
    return;
  }

  // Default error response
  res
    .status(error.status || RESPONSE_CODES.INTERNAL_SERVER_ERROR)
    .json(
      __requestResponse(
        error.status || RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        error.message || RESPONSE_MESSAGES.INTERNAL_ERROR,
        process.env.NODE_ENV === "development" ? { stack: error.stack } : null
      )
    );
};
