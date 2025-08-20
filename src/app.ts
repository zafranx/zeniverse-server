import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import fs from "fs";

import adminRoutes from "./routes/adminRoutes";
import newsRoutes from "./routes/newsRoutes";
// import initiativeRoutes from "./routes/initiativeRoutes";
import portfolioVentureRoutes from "./routes/ventureRoutes";
import uploadRoute from "./routes/uploadRoutes";

import { errorHandler } from "./middleware/errorHandler";
import { __requestResponse, RESPONSE_CODES } from "./utils/constants";

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS configuration
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [
//         "http://localhost:5173",
//       ];

//       // Allow requests with no origin (mobile apps, curl, etc.)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//     exposedHeaders: ["X-Total-Count"],
//   })
// );

app.use(cors());

// Rate limiting with different tiers
const createLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    message: __requestResponse(429, message),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json(__requestResponse(429, message));
    },
  });

// General API rate limiting
// app.use(
//   "/api",
//   // createLimiter(15 * 60 * 1000, 100, "Too many requests from this IP")
//   createLimiter(60 * 60 * 1000, 100, "Too many requests from this IP")
// );
// * limiter timings -
// Limiter A: 15 minutes
// 15 * 60 * 1000 = 900000 ms (15 minutes)
// const limiterA = createLimiter(15 * 60 * 1000, 100, "Too many requests from this IP");

// Limiter B: 1 hour
// 60 * 60 * 1000 = 3600000 ms (1 hour)
// const limiterB = createLimiter(60 * 60 * 1000, 500, "Too many requests from this IP");

// Limiter C: 1 day
// 24 * 60 * 60 * 1000 = 86400000 ms (24 hours / 1 day)
// const limiterC = createLimiter(24 * 60 * 60 * 1000, 2000, "Too many requests from this IP");
// * limiter timings |

// Stricter rate limiting for auth endpoints
// app.use(
//   "/api/admin/login",
//   createLimiter(15 * 60 * 1000, 5, "Too many login attempts")
// );

// File upload rate limiting
app.use("/api/*/upload", createLimiter(60 * 1000, 10, "Too many file uploads"));

// Body parsing middleware
app.use(
  express.json({
    limit: "20mb",
    verify: (req, res, buf, encoding) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        throw new Error("Invalid JSON");
      }
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
    parameterLimit: 50,
  })
);

// Static file serving with caching for local uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: "1y",
    etag: true,
    lastModified: true,
  })
);

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/news", newsRoutes);
// app.use("/api/initiatives", initiativeRoutes);
app.use("/api/ventures", portfolioVentureRoutes);
app.use("/api/media", uploadRoute);


// Health check with more details
app.get("/api/health", (req, res) => {
  res.json(
    __requestResponse(RESPONSE_CODES.SUCCESS, "Server is running", {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      storage: process.env.USE_CLOUDINARY === "true" ? "cloudinary" : "local",
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
    })
  );
});

// API documentation endpoint
app.get("/api/docs", (req, res) => {
  res.json(
    __requestResponse(RESPONSE_CODES.SUCCESS, "API Documentation", {
      endpoints: {
        auth: {
          login: "POST /api/admin/login",
          profile: "GET /api/admin/profile",
          dashboard: "GET /api/admin/dashboard",
          logout: "POST /api/admin/logout",
        },
        news: {
          list: "GET /api/news",
          create: "POST /api/news",
          get: "GET /api/news/:id",
          update: "PUT /api/news/:id",
          delete: "DELETE /api/news/:id",
          toggleFeatured: "PATCH /api/news/:id/featured",
        },
        initiatives: {
          list: "GET /api/initiatives",
          create: "POST /api/initiatives",
          get: "GET /api/initiatives/:id",
          update: "PUT /api/initiatives/:id",
          delete: "DELETE /api/initiatives/:id",
        },
        portfolio: {
          list: "GET /api/portfolio-ventures",
          create: "POST /api/portfolio-ventures",
          get: "GET /api/portfolio-ventures/:id",
          update: "PUT /api/portfolio-ventures/:id",
          delete: "DELETE /api/portfolio-ventures/:id",
        },
      },
    })
  );
});

// 404 handler
app.use((req, res) => {
  res
    .status(RESPONSE_CODES.NOT_FOUND)
    .json(
      __requestResponse(
        RESPONSE_CODES.NOT_FOUND,
        `Route ${req.originalUrl} not found`
      )
    );
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
// import path from "path";
// import fs from "fs";

// import adminRoutes from "./routes/adminRoutes";
// import newsRoutes from "./routes/newsRoutes";
// import initiativeRoutes from "./routes/initiativeRoutes";
// import portfolioRoutes from "./routes/portfolioRoutes";
// import { errorHandler } from "./middleware/errorHandler";
// import { __requestResponse, RESPONSE_CODES } from "./utils/constants";

// const app = express();

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Security middleware
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   })
// );

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL?.split(",") || ["http://localhost:3000"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: __requestResponse(
//     429,
//     "Too many requests from this IP, please try again later."
//   ),
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use("/api", limiter);

// // Stricter rate limiting for auth endpoints
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit each IP to 5 requests per windowMs for auth
//   message: __requestResponse(
//     429,
//     "Too many authentication attempts, please try again later."
//   ),
// });
// app.use("/api/admin/login", authLimiter);

// // Body parsing middleware
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // Static file serving for local uploads
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// // API Routes
// app.use("/api/admin", adminRoutes);
// app.use("/api/news", newsRoutes);
// app.use("/api/initiatives", initiativeRoutes);
// app.use("/api/portfolio", portfolioRoutes);

// // Health check
// app.get("/api/health", (req, res) => {
//   res.json(
//     __requestResponse(RESPONSE_CODES.SUCCESS, "Server is running", {
//       timestamp: new Date().toISOString(),
//       storage: process.env.USE_CLOUDINARY === "true" ? "cloudinary" : "local",
//       environment: process.env.NODE_ENV || "development",
//     })
//   );
// });

// // 404 handler
// app.use((req, res) => {
//   res
//     .status(RESPONSE_CODES.NOT_FOUND)
//     .json(__requestResponse(RESPONSE_CODES.NOT_FOUND, "Route not found"));
// });

// // Error handling middleware (must be last)
// app.use(errorHandler);

// export default app;
