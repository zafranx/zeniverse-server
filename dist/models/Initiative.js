"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const detailedSectionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        trim: true,
    },
    content: [
        {
            type: String,
        },
    ],
}, { _id: false });
const initiativeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        trim: true,
        maxlength: 200,
        required: true,
    },
    excerpt: {
        type: String,
        trim: true,
        // maxlength: 500,
    },
    image: {
        type: String,
    },
    heroImage: {
        type: String,
    },
    author: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    category: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ["Active", "Completed", "Planned", "In Progress"],
        default: "Active",
    },
    impact: {
        type: String,
        trim: true,
    },
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    featured: {
        type: Boolean,
        default: false,
    },
    detailedSections: [detailedSectionSchema],
}, {
    timestamps: true,
});
// Indexes
initiativeSchema.index({ title: "text", excerpt: "text" });
initiativeSchema.index({ category: 1 });
initiativeSchema.index({ status: 1 });
initiativeSchema.index({ featured: 1 });
initiativeSchema.index({ date: -1 });
exports.default = mongoose_1.default.model("Initiative", initiativeSchema);
//# sourceMappingURL=Initiative.js.map