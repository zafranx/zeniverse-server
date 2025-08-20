import { Response } from "express";
import Venture from "../models/Ventures";
import { AuthRequest } from "../types";
import {
  __requestResponse,
  RESPONSE_CODES,
  RESPONSE_MESSAGES,
} from "../utils/constants";
import { processUploadedFiles } from "../utils/multer";

// Safe parse helper
const safeParseJSON = <T>(input: unknown, fallback: T): T => {
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as T;
    } catch {
      return fallback;
    }
  }
  return (input as T) ?? fallback;
};

export const getAllVentures = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) filter.$text = { $search: search };

    const [ventures, total] = await Promise.all([
      Venture.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Venture.countDocuments(filter),
    ]);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
        ventures,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error("Get all ventures error:", error);
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

export const getVentureById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const venture = await Venture.findById(req.params.id).lean();
    if (!venture) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(__requestResponse(RESPONSE_CODES.NOT_FOUND, "Venture not found"));
      return;
    }

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(RESPONSE_CODES.SUCCESS, RESPONSE_MESSAGES.SUCCESS, {
          venture,
        })
      );
  } catch (error) {
    console.error("Get venture by ID error:", error);
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

export const createVenturexxxx = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const body = req.body;

    // Handle uploads (Cloudinary/local)
    const uploaded = await processUploadedFiles(req as any, req.files);
    if (uploaded.logo) body.logo = uploaded.logo;
    if (uploaded.bannerImage) body.bannerImage = uploaded.bannerImage;

    // Arrays of bullets
    body.problemStatement = safeParseJSON<string[]>(
      body.problemStatement,
      []
    ).filter(Boolean);
    body.proposedSolutions = safeParseJSON<string[]>(
      body.proposedSolutions,
      []
    ).filter(Boolean);
    body.innovationValue = safeParseJSON<string[]>(
      body.innovationValue,
      []
    ).filter(Boolean);
    body.targetGeography = safeParseJSON<string[]>(
      body.targetGeography,
      []
    ).filter(Boolean);
    body.valueProposition = safeParseJSON<string[]>(
      body.valueProposition,
      []
    ).filter(Boolean);
    body.marketFitment = safeParseJSON<string[]>(body.marketFitment, []).filter(
      Boolean
    );
    body.goToMarketStrategy = safeParseJSON<string[]>(
      body.goToMarketStrategy,
      []
    ).filter(Boolean);

    // Banner heading/text are simple strings; optional trimming
    if (typeof body.bannerHeading === "string")
      body.bannerHeading = body.bannerHeading.trim();
    if (typeof body.bannerText === "string")
      body.bannerText = body.bannerText.trim();

    // Projections
    body.financialProjections = safeParseJSON<
      { year: number; projectedRevenueUSD: number }[]
    >(body.financialProjections, []);

    // Investors (JSON array or names + uploaded investorLogos[])
    let currentInvestors = safeParseJSON<{ name: string; logo: string }[]>(
      body.currentInvestors,
      []
    );
    if (!currentInvestors.length) {
      const investorNames = safeParseJSON<string[]>(
        body.currentInvestorsNames,
        []
      );
      const investorLogoFiles = (req.files as any)?.investorLogos || [];
      currentInvestors = investorNames.map((name: string, idx: number) => ({
        name,
        logo: investorLogoFiles[idx]?.path || "",
      }));
    }
    body.currentInvestors = currentInvestors.filter((i) => i.name && i.logo);

    // Founders (JSON array or names/bios + uploaded founderPics[])
    let founders = safeParseJSON<
      { name: string; pic: string; briefBio: string }[]
    >(body.founders, []);
    if (!founders.length) {
      const founderNames = safeParseJSON<string[]>(body.founderNames, []);
      const founderBios = safeParseJSON<string[]>(body.founderBios, []);
      const founderPicFiles = (req.files as any)?.founderPics || [];
      founders = founderNames.map((name: string, idx: number) => ({
        name,
        briefBio: founderBios[idx] || "",
        pic: founderPicFiles[idx]?.path || "",
      }));
    }
    body.founders = founders.filter((f) => f.name && f.pic);

    // Product screenshots: combine JSON URLs + uploaded files
    const screenshotsFromJson = safeParseJSON<string[]>(
      body.productScreenshots,
      []
    );
    const screenshotFiles = (req.files as any)?.productScreenshots || [];
    const screenshotsFromFiles = screenshotFiles.map((f: any) => f.path);
    body.productScreenshots = [
      ...screenshotsFromJson,
      ...screenshotsFromFiles,
    ].filter(Boolean);

    // Required fields
    const required = [
      // "ventureId",
      "ventureName",
      "brandName",
      "logo",
      "shortDescription",
      "currentStatus",
    ];
    const missing = required.filter((f) => !body[f]);
    if (missing.length) {
      res
        .status(RESPONSE_CODES.VALIDATION_ERROR)
        .json(
          __requestResponse(
            RESPONSE_CODES.VALIDATION_ERROR,
            `Missing required fields: ${missing.join(", ")}`
          )
        );
      return;
    }

    const venture = new Venture(body);
    await venture.save();

    res
      .status(RESPONSE_CODES.CREATED)
      .json(
        __requestResponse(
          RESPONSE_CODES.CREATED,
          "Venture created successfully",
          { venture }
        )
      );
  } catch (error) {
    console.error("Create venture error:", error);
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

// src/controllers/ventureController.ts
export const createVenture22 = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const body = req.body;

    // Helper function to safely extract file path
    const getFilePath = (file: any): string => {
      if (!file) return '';
      // For local uploads
      if (file.filename) return `/uploads/${file.filename}`;
      // For cloudinary uploads
      if (file.path) return file.path;
      // If it's already a string
      if (typeof file === 'string') return file;
      return '';
    };

    // Process single file uploads
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Handle logo
      if (files.logo && files.logo[0]) {
        body.logo = getFilePath(files.logo);
      }
      
      // Handle banner image
      if (files.bannerImage && files.bannerImage) {
        body.bannerImage = getFilePath(files.bannerImage);
      }
      
      // Handle investor logos - map to investor names
      if (files.investorLogos) {
        const investorNames = safeParseJSON<string[]>(body.currentInvestorsNames, []);
        body.currentInvestors = investorNames.map((name: string, index: number) => ({
          name: name.trim(),
          logo: files.investorLogos[index] ? getFilePath(files.investorLogos[index]) : ''
        })).filter(investor => investor.name && investor.logo);
      }
      
      // Handle founder pics - map to founder names and bios
      if (files.founderPics) {
        const founderNames = safeParseJSON<string[]>(body.founderNames, []);
        const founderBios = safeParseJSON<string[]>(body.founderBios, []);
        body.founders = founderNames.map((name: string, index: number) => ({
          name: name.trim(),
          briefBio: founderBios[index] || '',
          pic: files.founderPics[index] ? getFilePath(files.founderPics[index]) : ''
        })).filter(founder => founder.name && founder.pic);
      }
      
      // Handle product screenshots
      if (files.productScreenshots) {
        body.productScreenshots = files.productScreenshots.map((file: Express.Multer.File) => 
          getFilePath(file)
        ).filter(Boolean);
      }
    }

    // Parse JSON string fields safely
    const safeParseArray = (field: any): string[] => {
      if (!field) return [];
      if (Array.isArray(field)) return field.filter(Boolean);
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    // Handle array fields (bullet points)
    body.problemStatement = safeParseArray(body.problemStatement);
    body.proposedSolutions = safeParseArray(body.proposedSolutions);
    body.innovationValue = safeParseArray(body.innovationValue);
    body.targetGeography = safeParseArray(body.targetGeography);
    body.valueProposition = safeParseArray(body.valueProposition);
    body.marketFitment = safeParseArray(body.marketFitment);
    body.goToMarketStrategy = safeParseArray(body.goToMarketStrategy);

    // Handle financial projections
    if (typeof body.financialProjections === 'string') {
      try {
        body.financialProjections = JSON.parse(body.financialProjections);
      } catch {
        body.financialProjections = [];
      }
    }
    if (!Array.isArray(body.financialProjections)) {
      body.financialProjections = [];
    }

    // Handle current investors (if not processed from files above)
    if (!body.currentInvestors && typeof body.currentInvestors === 'string') {
      try {
        body.currentInvestors = JSON.parse(body.currentInvestors);
      } catch {
        body.currentInvestors = [];
      }
    }
    if (!Array.isArray(body.currentInvestors)) {
      body.currentInvestors = [];
    }

    // Handle founders (if not processed from files above)
    if (!body.founders && typeof body.founders === 'string') {
      try {
        body.founders = JSON.parse(body.founders);
      } catch {
        body.founders = [];
      }
    }
    if (!Array.isArray(body.founders)) {
      body.founders = [];
    }

    // Ensure product screenshots is an array
    if (!Array.isArray(body.productScreenshots)) {
      body.productScreenshots = [];
    }

    // Trim text fields
    if (typeof body.bannerHeading === 'string') {
      body.bannerHeading = body.bannerHeading.trim();
    }
    if (typeof body.bannerText === 'string') {
      body.bannerText = body.bannerText.trim();
    }

    // Validate required fields
    const required = [
      'ventureName',
      'brandName', 
      'logo',
      'shortDescription',
      'currentStatus'
    ];
    
    const missing = required.filter(field => !body[field] || (typeof body[field] === 'string' && !body[field].trim()));
    
    if (missing.length > 0) {
      res.status(RESPONSE_CODES.VALIDATION_ERROR).json(
        __requestResponse(
          RESPONSE_CODES.VALIDATION_ERROR,
          `Missing required fields: ${missing.join(', ')}`
        )
      );
      return;
    }

    // Clean up the data object - remove temporary fields
    delete body.currentInvestorsNames;
    delete body.founderNames;
    delete body.founderBios;

    console.log('Final body before save:', JSON.stringify(body, null, 2));

    const venture = new Venture(body);
    await venture.save();

    res.status(RESPONSE_CODES.CREATED).json(
      __requestResponse(
        RESPONSE_CODES.CREATED,
        'Venture created successfully',
        { venture }
      )
    );
  } catch (error) {
    console.error('Create venture error:', error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGES.INTERNAL_ERROR
      )
    );
  }
};


// src/controllers/ventureController.ts
export const createVenture = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Received venture data:', req.body); // Debug log

    const {
      ventureName,
      brandName,
      logo, // Now a URL string
      shortDescription,
      problemStatement,
      proposedSolutions,
      innovationValue,
      targetGeography,
      valueProposition,
      marketFitment,
      goToMarketStrategy,
      currentStatus,
      financialProjections,
      currentInvestors, // Array with logo URLs
      founders, // Array with pic URLs
      productScreenshots, // Array of URL strings
      bannerImage, // URL string
      bannerHeading,
      bannerText,
    } = req.body;

    // Create venture with URL strings directly
    const newVenture = new Venture({
      ventureName,
      brandName,
      logo, // Store URL directly
      shortDescription,
      problemStatement,
      proposedSolutions,
      innovationValue,
      targetGeography,
      valueProposition,
      marketFitment,
      goToMarketStrategy,
      currentStatus,
      financialProjections,
      currentInvestors, // Store with logo URLs
      founders, // Store with pic URLs
      productScreenshots, // Store URL array
      bannerImage, // Store URL directly
      bannerHeading,
      bannerText,
    });

    await newVenture.save();

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.SUCCESS,
        { venture: newVenture }
      )
    );
  } catch (error) {
    console.error('Create venture error:', error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGES.INTERNAL_ERROR
      )
    );
  }
};


export const updateVenture = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const body = req.body;
    const id = req.params.id;

    const existing = await Venture.findById(id);
    if (!existing) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(__requestResponse(RESPONSE_CODES.NOT_FOUND, "Venture not found"));
      return;
    }

    // Uploads
    const uploaded = await processUploadedFiles(req as any, req.files);
    if (uploaded.logo) body.logo = uploaded.logo;
    if (uploaded.bannerImage) body.bannerImage = uploaded.bannerImage;

    // Normalize arrays if sent as strings
    if (typeof body.problemStatement === "string")
      body.problemStatement = safeParseJSON<string[]>(
        body.problemStatement,
        []
      );
    if (typeof body.proposedSolutions === "string")
      body.proposedSolutions = safeParseJSON<string[]>(
        body.proposedSolutions,
        []
      );
    if (typeof body.innovationValue === "string")
      body.innovationValue = safeParseJSON<string[]>(body.innovationValue, []);
    if (typeof body.targetGeography === "string")
      body.targetGeography = safeParseJSON<string[]>(body.targetGeography, []);
    if (typeof body.valueProposition === "string")
      body.valueProposition = safeParseJSON<string[]>(
        body.valueProposition,
        []
      );
    if (typeof body.marketFitment === "string")
      body.marketFitment = safeParseJSON<string[]>(body.marketFitment, []);
    if (typeof body.goToMarketStrategy === "string")
      body.goToMarketStrategy = safeParseJSON<string[]>(
        body.goToMarketStrategy,
        []
      );

    // Banner text/heading trim
    if (typeof body.bannerHeading === "string")
      body.bannerHeading = body.bannerHeading.trim();
    if (typeof body.bannerText === "string")
      body.bannerText = body.bannerText.trim();

    if (typeof body.financialProjections === "string") {
      body.financialProjections = safeParseJSON<
        { year: number; projectedRevenueUSD: number }[]
      >(body.financialProjections, []);
    }

    if (typeof body.currentInvestors === "string") {
      body.currentInvestors = safeParseJSON<{ name: string; logo: string }[]>(
        body.currentInvestors,
        []
      );
    } else if (body.currentInvestorsNames) {
      const investorNames = safeParseJSON<string[]>(
        body.currentInvestorsNames,
        []
      );
      const investorLogoFiles = (req.files as any)?.investorLogos || [];
      body.currentInvestors = investorNames.map(
        (name: string, idx: number) => ({
          name,
          logo: investorLogoFiles[idx]?.path || "",
        })
      );
    }

    if (typeof body.founders === "string") {
      body.founders = safeParseJSON<
        { name: string; pic: string; briefBio: string }[]
      >(body.founders, []);
    } else if (body.founderNames || body.founderBios) {
      const founderNames = safeParseJSON<string[]>(body.founderNames, []);
      const founderBios = safeParseJSON<string[]>(body.founderBios, []);
      const founderPicFiles = (req.files as any)?.founderPics || [];
      body.founders = founderNames.map((name: string, idx: number) => ({
        name,
        briefBio: founderBios[idx] || "",
        pic: founderPicFiles[idx]?.path || "",
      }));
    }

    // // Product screenshots: append uploads if provided
    // const screenshotsFromJson = safeParseJSON<string[]>(
    //   body.productScreenshots,
    //   []
    // );
    // const screenshotFiles = (req.files as any)?.productScreenshots || [];
    // const screenshotsFromFiles = screenshotFiles.map((f: any) => f.path);
    // if (screenshotsFromJson.length || screenshotsFromFiles.length) {
    //   body.productScreenshots = [
    //     ...(existing.productScreenshots || []),
    //     ...screenshotsFromJson,
    //     ...screenshotsFromFiles,
    //   ].filter(Boolean);
    // }

    // Product screenshots: replace with new + existing passed from frontend
    const screenshotsFromJson = safeParseJSON<string[]>(
      body.productScreenshots,
      []
    );
    const screenshotFiles = (req.files as any)?.productScreenshots || [];
    const screenshotsFromFiles = screenshotFiles.map((f: any) => f.path);

    // Final array = only what frontend sends (JSON + new files)
    body.productScreenshots = [
      ...screenshotsFromJson,
      ...screenshotsFromFiles,
    ].filter(Boolean);

    const venture = await Venture.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Venture updated successfully",
          { venture }
        )
      );
  } catch (error) {
    console.error("Update venture error:", error);
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

export const deleteVenture = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const venture = await Venture.findByIdAndDelete(req.params.id);
    if (!venture) {
      res
        .status(RESPONSE_CODES.NOT_FOUND)
        .json(__requestResponse(RESPONSE_CODES.NOT_FOUND, "Venture not found"));
      return;
    }

    // Optional: handle cleanup of old images here if desired.

    res
      .status(RESPONSE_CODES.SUCCESS)
      .json(
        __requestResponse(
          RESPONSE_CODES.SUCCESS,
          "Venture deleted successfully"
        )
      );
  } catch (error) {
    console.error("Delete venture error:", error);
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
