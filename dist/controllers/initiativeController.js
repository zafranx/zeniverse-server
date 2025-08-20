"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInitiative = exports.updateInitiative = exports.createInitiative = exports.getInitiativeById = exports.getAllInitiatives = void 0;
const Initiative_1 = __importDefault(require("../models/Initiative"));
const getAllInitiatives = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [initiatives, total] = await Promise.all([
            Initiative_1.default.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Initiative_1.default.countDocuments(),
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
    }
    catch (error) {
        console.error("Get all initiatives error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllInitiatives = getAllInitiatives;
const getInitiativeById = async (req, res) => {
    try {
        const initiative = await Initiative_1.default.findById(req.params.id);
        if (!initiative) {
            res.status(404).json({ message: "Initiative not found" });
            return;
        }
        res.json({ initiative });
    }
    catch (error) {
        console.error("Get initiative by ID error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getInitiativeById = getInitiativeById;
const createInitiative = async (req, res) => {
    try {
        const initiativeData = req.body;
        // Handle file uploads if present
        if (req.files) {
            const files = req.files;
            if (files.image)
                initiativeData.image = `/uploads/${files.image[0].filename}`;
            if (files.heroImage)
                initiativeData.heroImage = `/uploads/${files.heroImage[0].filename}`;
        }
        const initiative = new Initiative_1.default(initiativeData);
        await initiative.save();
        res.status(201).json({
            message: "Initiative created successfully",
            initiative,
        });
    }
    catch (error) {
        console.error("Create initiative error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createInitiative = createInitiative;
const updateInitiative = async (req, res) => {
    try {
        const initiativeData = req.body;
        // Handle file uploads if present
        if (req.files) {
            const files = req.files;
            if (files.image)
                initiativeData.image = `/uploads/${files.image[0].filename}`;
            if (files.heroImage)
                initiativeData.heroImage = `/uploads/${files.heroImage[0].filename}`;
        }
        const initiative = await Initiative_1.default.findByIdAndUpdate(req.params.id, initiativeData, { new: true, runValidators: true });
        if (!initiative) {
            res.status(404).json({ message: "Initiative not found" });
            return;
        }
        res.json({
            message: "Initiative updated successfully",
            initiative,
        });
    }
    catch (error) {
        console.error("Update initiative error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateInitiative = updateInitiative;
const deleteInitiative = async (req, res) => {
    try {
        const initiative = await Initiative_1.default.findByIdAndDelete(req.params.id);
        if (!initiative) {
            res.status(404).json({ message: "Initiative not found" });
            return;
        }
        res.json({ message: "Initiative deleted successfully" });
    }
    catch (error) {
        console.error("Delete initiative error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteInitiative = deleteInitiative;
//# sourceMappingURL=initiativeController.js.map