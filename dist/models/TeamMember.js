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
const teamMemberSchema = new mongoose_1.Schema({
    name: {
        type: String,
        //   required: true,
        trim: true,
        maxlength: 100,
    },
    role: {
        type: String,
        //   required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        //   required: true,
        trim: true,
        maxlength: 500,
    },
    image: {
        type: String,
        //   required: true
    },
    sort_order: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Indexes for better performance
teamMemberSchema.index({ name: "text", role: "text" });
teamMemberSchema.index({ sort_order: 1 });
teamMemberSchema.index({ isActive: 1 });
exports.default = mongoose_1.default.model("TeamMember", teamMemberSchema);
//# sourceMappingURL=TeamMember.js.map