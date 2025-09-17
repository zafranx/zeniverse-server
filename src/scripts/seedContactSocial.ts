import mongoose from "mongoose";
import ContactSocial from "../models/ContactSocial";
import Admin from "../models/Admin";
import connectDB from "../config/database";
import dotenv from "dotenv";

dotenv.config();

const seedContactSocial = async () => {
  try {
    await connectDB();

    // Check if published contact social data already exists
    const existingPublished = await ContactSocial.findOne({ isPublished: true });
    if (existingPublished) {
      console.log("Published contact social data already exists");
      process.exit(0);
    }

    // Get admin user for createdBy field
    const admin = await Admin.findOne({});
    if (!admin) {
      console.error("No admin user found. Please create an admin first.");
      process.exit(1);
    }

    // Create sample contact social data
    const contactSocialData = new ContactSocial({
      title: "Zeniverse Ventures Contact Information",
      slug: "zeniverse-contact-info",
      contactDetails: [
        {
          type: "email",
          label: "Primary Email",
          value: "info@zeniverse-ventures.com",
          isPrimary: true,
          isActive: true,
          order: 1
        },
        {
          type: "phone",
          label: "Main Office",
          value: "+91 5252525252",
          isPrimary: true,
          isActive: true,
          order: 2
        },
        {
          type: "address",
          label: "Head Office",
          value: "123 Business District, Tech City, India 110001",
          isPrimary: true,
          isActive: true,
          order: 3
        },
        {
          type: "website",
          label: "Official Website",
          value: "https://zeniverse-ventures.com",
          isPrimary: false,
          isActive: true,
          order: 4
        }
      ],
      socialMediaLinks: [
        {
          platform: "linkedin",
          label: "LinkedIn",
          url: "https://linkedin.com/company/zeniverse-ventures",
          icon: "linkedin",
          isActive: true,
          order: 1
        },
        {
          platform: "twitter",
          label: "Twitter",
          url: "https://twitter.com/zeniversevc",
          icon: "twitter",
          isActive: true,
          order: 2
        },
        {
          platform: "facebook",
          label: "Facebook",
          url: "https://facebook.com/zeniverseventures",
          icon: "facebook",
          isActive: true,
          order: 3
        },
        {
          platform: "instagram",
          label: "Instagram",
          url: "https://instagram.com/zeniverse_ventures",
          icon: "instagram",
          isActive: true,
          order: 4
        }
      ],
      isPublished: true,
      publishedAt: new Date(),
      version: "1.0",
      createdBy: admin._id,
      lastModifiedBy: admin._id
    });

    await contactSocialData.save();
    console.log("Contact social data seeded successfully!");
    console.log("Published contact information is now available at /api/contact-social/public");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding contact social data:", error);
    process.exit(1);
  }
};

seedContactSocial();