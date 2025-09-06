import { Types } from "mongoose";

export interface DetailedSection {
  title: string;
  content: string[];
}

export interface NewsArticle {
  _id?: Types.ObjectId;
  title: string;
  excerpt: string;
  image: string;
  heroImage: string;
  author: string;
  date: Date;
  category: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  detailedSections: DetailedSection[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Initiative {
  _id?: Types.ObjectId;
  title: string;
  excerpt: string;
  image: string;
  heroImage: string;
  author: string;
  date: Date;
  category: string;
  status: "Active" | "Completed" | "Planned" | "In Progress";
  impact: string;
  tags: string[];
  featured: boolean;
  detailedSections: DetailedSection[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioCompany {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  heroImage: string;
  detailedSections: DetailedSection[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Admin {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "superadmin";
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest extends Express.Request {
  params: any;
  query: any;
  body: any;
  user?: {
    id: string;
    username: string;
    role: string;
  };
}


export interface TeamMember {
  _id?: Types.ObjectId;
  name: string;
  role: string;
  description: string;
  image: string;
  sort_order?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
