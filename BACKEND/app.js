import express from "express";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import connectDB from "./src/config/monogo.config.js";
import short_url from "./src/routes/short_url.route.js";
import user_routes from "./src/routes/user.routes.js";
import auth_routes from "./src/routes/auth.routes.js";
import { redirectFromShortUrl } from "./src/controller/short_url.controller.js";
import { errorHandler } from "./src/utils/errorHandler.js";
import cors from "cors";
import { attachUser } from "./src/utils/attachUser.js";
import cookieParser from "cookie-parser";

// ✅ FIXED dotenv usage
dotenv.config({ path: "./.env" });

const app = express();

// --- START CORS FIX ---
// Define the allowed origins:
// 1. Local development frontend
// 2. Live Vercel frontend
// 3. Live Render backend (in case of self-requests/APPs URL)
const allowedOrigins = [
    "http://localhost:5173",
    "https://url-shortener-app-project.onrender.com",
    "https://url-shortener-app-project.vercel.app", // Your Vercel domain
    // Add your custom Vercel domain here if applicable
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            // Allow specific origins
            if (allowedOrigins.indexOf(origin) !== -1) {
                return callback(null, true);
            }
            // Block all others
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true, // allow cookies
    })
);
// --- END CORS FIX ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware to attach user if logged in
app.use(attachUser);

// Routes
app.use("/api/user", user_routes);
app.use("/api/auth", auth_routes);
app.use("/api/create", short_url);

// Redirection route
app.get("/:id", redirectFromShortUrl);

// Error handler middleware
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    connectDB();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});