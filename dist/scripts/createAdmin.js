"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Admin_1 = __importDefault(require("../models/Admin"));
const database_1 = __importDefault(require("../config/database"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createInitialAdmin = async () => {
    try {
        await (0, database_1.default)();
        // Check if any admin exists
        const existingAdmin = await Admin_1.default.findOne({});
        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }
        // Create initial admin
        const admin = new Admin_1.default({
            username: "admin",
            email: "admin@zeniverse-ventures.com",
            password: "admin123", // This will be hashed by the pre-save hook
            name: "System Administrator",
            role: "superadmin",
        });
        await admin.save();
        console.log("Initial admin created successfully");
        console.log("Username: admin");
        console.log("Password: admin123");
        console.log("Please change the password after first login");
        process.exit(0);
    }
    catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};
createInitialAdmin();
//# sourceMappingURL=createAdmin.js.map