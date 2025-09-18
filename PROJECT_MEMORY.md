# 🚀 Zenniverse Backend - Project Memory & Documentation

## 📋 Project Overview
**Project Name:** Zenniverse Backend  
**Version:** 1.0.0  
**Type:** Node.js/Express.js REST API Server  
**Database:** MongoDB with Mongoose ODM  
**Architecture:** MVC Pattern with TypeScript  

---

## 🏗️ Project Structure



---

## 🔌 API Endpoints

### 🔐 Authentication & Admin
- **Base URL:** `/api/admin`
- **POST** `/login` - Admin login
- **GET** `/profile` - Get admin profile
- **GET** `/dashboard` - Admin dashboard data
- **POST** `/logout` - Admin logout

### 📰 News Management
- **Base URL:** `/api/news`
- **GET** `/` - Get all news (with pagination)
- **GET** `/:id` - Get news by ID
- **POST** `/` - Create news article
- **PUT** `/:id` - Update news article
- **DELETE** `/:id` - Delete news article
- **PATCH** `/:id/publish` - Publish news
- **PATCH** `/:id/unpublish` - Unpublish news

### 🚀 Initiatives Management
- **Base URL:** `/api/initiatives`
- **GET** `/` - Get all initiatives
- **GET** `/:id` - Get initiative by ID
- **POST** `/` - Create initiative
- **PUT** `/:id` - Update initiative
- **DELETE** `/:id` - Delete initiative

### 💼 Ventures/Portfolio Management
- **Base URL:** `/api/ventures`
- **GET** `/` - Get all ventures
- **GET** `/:id` - Get venture by ID
- **POST** `/` - Create venture
- **PUT** `/:id` - Update venture
- **DELETE** `/:id` - Delete venture

### 👥 Team Members Management
- **Base URL:** `/api/team-members`
- **GET** `/` - Get all team members
- **GET** `/:id` - Get team member by ID
- **POST** `/` - Create team member
- **PUT** `/:id` - Update team member
- **DELETE** `/:id` - Delete team member

### 📞 Contact & Social Media
- **Base URL:** `/api/contact-social`
- **GET** `/` - Get all contact social records
- **GET** `/:id` - Get contact social by ID
- **GET** `/published` - Get published contact social data
- **POST** `/` - Create contact social record
- **PUT** `/:id` - Update contact social record
- **DELETE** `/:id` - Delete contact social record
- **PATCH** `/:id/publish` - Publish contact social
- **PATCH** `/:id/unpublish` - Unpublish contact social

### 📧 Contact Inquiries
- **Base URL:** `/api/contact-inquiries`
- **GET** `/` - Get all inquiries (admin)
- **GET** `/:id` - Get inquiry by ID
- **POST** `/` - Create new inquiry (public)
- **PUT** `/:id` - Update inquiry
- **DELETE** `/:id` - Delete inquiry
- **PATCH** `/:id/status` - Update inquiry status

### 📄 Content Management
- **Base URL:** `/api/content`
- **GET** `/` - Get all content
- **GET** `/:id` - Get content by ID
- **GET** `/public/type/:type` - Get published content by type
- **GET** `/public/slug/:slug` - Get content by slug
- **POST** `/` - Create content
- **PUT** `/:id` - Update content
- **DELETE** `/:id` - Delete content
- **PATCH** `/:id/publish` - Publish content
- **PATCH** `/:id/unpublish` - Unpublish content
- **PUT** `/:id/seo` - Update SEO settings

### 📁 Media & File Management
- **Base URL:** `/api/media`
- **POST** `/upload` - Upload files
- **GET** `/` - Get uploaded files
- **DELETE** `/:filename` - Delete file

### ☁️ Cloudinary Integration
- **Base URL:** `/api/cloudinary`
- **GET** `/resources` - Get Cloudinary resources
- **GET** `/search` - Search Cloudinary media
- **GET** `/folders/:folder` - Get resources by folder
- **DELETE** `/:publicId` - Delete Cloudinary resource

### 🏥 Health Check
- **GET** `/api/health` - Server health status
- **GET** `/api/docs` - API documentation

---

## 🗄️ Database Models

### 👤 Admin Model
```typescript
interface AdminDocument {
  username: string;
  email: string;
  password: string; // bcrypt hashed
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 📞 ContactSocial Model
```typescript
interface ContactSocialDocument {
  title: string;
  slug: string;
  contactDetails: ContactDetail[];
  socialMediaLinks: SocialMediaLink[];
  isPublished: boolean;
  publishedAt?: Date;
  version: string;
  createdBy: ObjectId;
  lastModifiedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactDetail {
  type: 'phone' | 'email' | 'address' | 'fax' | 'website';
  label: string;
  value: string;
  isPrimary: boolean;
  isActive: boolean;
  order?: number;
}

interface SocialMediaLink {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok' | 'pinterest' | 'whatsapp' | 'telegram';
  label: string;
  url: string;
  icon?: string;
  isActive: boolean;
  order?: number;
}
```

### 📧 ContactInquiry Model
```typescript
interface ContactInquiryDocument {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  isRead: boolean;
  adminNotes?: string;
  assignedTo?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 📄 Content Model
```typescript
interface ContentDocument {
  title: string;
  slug: string;
  type: 'privacy_policy' | 'terms_conditions' | 'about_us' | 'contact_us' | 'faq';
  content: string;
  excerpt?: string;
  isPublished: boolean;
  publishedAt?: Date;
  seo?: SEOSettings;
  version: string;
  createdBy: ObjectId;
  lastModifiedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔧 Key Technologies & Dependencies

### Core Dependencies
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **typescript** - Type safety
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **compression** - Response compression
- **morgan** - HTTP request logger
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation
- **joi** - Schema validation
- **multer** - File upload handling
- **cloudinary** - Cloud media management
- **nodemailer** - Email service
- **dotenv** - Environment variables

### Development Dependencies
- **ts-node-dev** - TypeScript development server
- **eslint** - Code linting
- **jest** - Testing framework
- **@types/** - TypeScript type definitions

---

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (admin, super_admin)
- Protected routes with middleware

### Security Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Data sanitization
- **Error Handling** - Secure error responses

### File Upload Security
- File type validation
- File size limits
- Secure file storage (local + Cloudinary)
- Image processing and optimization

---

## 📧 Email Service Integration

### Features
- SMTP configuration with Nodemailer
- Contact form notifications
- Auto-reply functionality
- Admin email notifications
- Email template system

### Configuration
```typescript
// Environment variables needed:
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
COMPANY_EMAIL=admin@zeniverse-ventures.com
```

---

## 🌐 Environment Configuration

### Required Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/zenniverse

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
COMPANY_EMAIL=admin@zeniverse-ventures.com

# Cloudinary (Optional)
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend
FRONTEND_URL=http://localhost:5173,https://yourdomain.com
```

---

## 🚀 Scripts & Commands

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm run create-admin # Create admin user
npm run seed         # Run seeding scripts
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Utilities
```bash
npm run clean        # Clean dist folder
npm run prebuild     # Pre-build cleanup
```

---

## 📊 API Response Format

### Standard Response Structure
```typescript
interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}
```

### Response Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **422** - Validation Error
- **429** - Too Many Requests
- **500** - Internal Server Error

---

## 🔄 Recent Updates & Changes

### ✅ Completed Features
1. **Dynamic Social Links** - Footer integration with caching
2. **Contact Social API** - Full CRUD operations
3. **Content Management** - New content system
4. **Email Service** - Contact form notifications
5. **Cloudinary Integration** - Media management
6. **Rate Limiting** - API protection
7. **Error Handling** - Comprehensive error system

### 🚧 Deprecated Features
- **Old Content Management Routes** - Replaced with new content system
- **Legacy API endpoints** - Migrated to new structure

---

## 🐛 Known Issues & Solutions

### Common Issues
1. **CORS Errors** - Check FRONTEND_URL configuration
2. **Email Not Sending** - Verify SMTP credentials
3. **File Upload Fails** - Check upload directory permissions
4. **Database Connection** - Verify MONGODB_URI

### Performance Optimizations
- Response compression enabled
- Static file caching (1 year)
- Database query optimization
- Image optimization with Cloudinary

---

## 📝 Development Notes

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent error handling patterns
- RESTful API design principles

### Database Patterns
- Mongoose schemas with validation
- Soft delete implementation
- Audit trail (createdBy, lastModifiedBy)
- Pagination support
- Search functionality

### File Organization
- Feature-based folder structure
- Separation of concerns (MVC)
- Reusable utility functions
- Type definitions in separate files

---

## 🔮 Future Enhancements

### Planned Features
1. **Real-time Notifications** - WebSocket integration
2. **Advanced Analytics** - Usage tracking
3. **Multi-language Support** - i18n implementation
4. **Advanced Caching** - Redis integration
5. **API Versioning** - Version management
6. **Automated Testing** - Comprehensive test suite

### Technical Debt
- Add comprehensive unit tests
- Implement API documentation (Swagger)
- Add database migrations
- Improve error logging
- Add monitoring and alerting

---

## 📞 Support & Maintenance

### Monitoring
- Health check endpoint available
- Error logging to console
- Performance metrics tracking
- Uptime monitoring recommended

### Backup Strategy
- Regular database backups
- File upload backups
- Environment configuration backup
- Code repository maintenance

---

**Last Updated:** January 2025  
**Maintainer:** Development Team  
**Version:** 1.0.0  

---

*This document serves as a comprehensive memory for the Zenniverse backend project. Keep it updated as the project evolves.*