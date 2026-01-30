const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = ["EMAIL", "PASS"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingVars.join(", ")}`);
  console.error("Please ensure your .env file contains EMAIL and PASS variables.");
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(bodyParser.json({ limit: "200kb" }));

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
      if (!origin) {
        return callback(null, true);
      }
      // Allow if origin is in allowed list or if wildcard is set
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      // For development, allow localhost origins
      if (process.env.NODE_ENV !== "production" && origin.includes("localhost")) {
        return callback(null, true);
      }
      console.log(`CORS blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Helper function to sanitize input (basic HTML escaping)
const sanitizeInput = (str) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Contact handler function (reusable for both routes)
const handleContact = (req, res) => {
  const { name, email, message, interest } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // Sanitize inputs
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedMessage = sanitizeInput(message);
  const sanitizedInterest = interest ? sanitizeInput(interest) : "";

  // Validate sanitized inputs aren't empty
  if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
    return res.status(400).json({ error: "Invalid input. Please check your entries." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.PASS },
  });

  const recipient = process.env.CONTACT_TO || process.env.EMAIL;

  // Format email body to include all information
  const emailBody = sanitizedInterest
    ? `Interested in: ${sanitizedInterest.charAt(0).toUpperCase() + sanitizedInterest.slice(1)}\n\nFrom: ${sanitizedName} (${sanitizedEmail})\n\nMessage:\n${sanitizedMessage}`
    : `From: ${sanitizedName} (${sanitizedEmail})\n\nMessage:\n${sanitizedMessage}`;

  return transporter
    .sendMail({
      from: `HTA+ Website <${process.env.EMAIL}>`,
      replyTo: sanitizedEmail,
      to: recipient,
      subject: `HTA+ Inquiry from ${sanitizedName}`,
      text: emailBody,
    })
    .then(() => {
      console.log(`Contact form submitted successfully from: ${sanitizedEmail}`);
      res.json({ success: true });
    })
    .catch((err) => {
      console.error("Error sending email:", err);
      // Don't expose internal error details to client
      res.status(500).json({ error: "Failed to send message. Please try again later." });
    });
};

// Handle both /api/contact and /contact (in case nginx strips /api/)
app.post("/api/contact", handleContact);
app.post("/contact", handleContact);

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS blocked" });
  }
  return next(err);
});

app.listen(3002, () => console.log("Server running on port 3002"));
