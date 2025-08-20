import { Response } from "express";
import Initiative from "../models/Initiative";
import { AuthRequest } from "../types";

export const getAllInitiatives = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [initiatives, total] = await Promise.all([
      Initiative.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Initiative.countDocuments(),
    ]);

    res.json({
      initiatives,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all initiatives error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInitiativeById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const initiative = await Initiative.findById(req.params.id);
    if (!initiative) {
      res.status(404).json({ message: "Initiative not found" });
      return;
    }

    res.json({ initiative });
  } catch (error) {
    console.error("Get initiative by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createInitiative = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const initiativeData = req.body;

    // Handle file uploads if present
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.image)
        initiativeData.image = `/uploads/${files.image[0].filename}`;
      if (files.heroImage)
        initiativeData.heroImage = `/uploads/${files.heroImage[0].filename}`;
    }

    const initiative = new Initiative(initiativeData);
    await initiative.save();

    res.status(201).json({
      message: "Initiative created successfully",
      initiative,
    });
  } catch (error) {
    console.error("Create initiative error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateInitiative = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const initiativeData = req.body;

    // Handle file uploads if present
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.image)
        initiativeData.image = `/uploads/${files.image[0].filename}`;
      if (files.heroImage)
        initiativeData.heroImage = `/uploads/${files.heroImage[0].filename}`;
    }

    const initiative = await Initiative.findByIdAndUpdate(
      req.params.id,
      initiativeData,
      { new: true, runValidators: true }
    );

    if (!initiative) {
      res.status(404).json({ message: "Initiative not found" });
      return;
    }

    res.json({
      message: "Initiative updated successfully",
      initiative,
    });
  } catch (error) {
    console.error("Update initiative error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteInitiative = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const initiative = await Initiative.findByIdAndDelete(req.params.id);
    if (!initiative) {
      res.status(404).json({ message: "Initiative not found" });
      return;
    }

    res.json({ message: "Initiative deleted successfully" });
  } catch (error) {
    console.error("Delete initiative error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
