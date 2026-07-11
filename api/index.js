var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/polyfill.ts
var init_polyfill = __esm({
  "src/polyfill.ts"() {
    if (typeof globalThis !== "undefined") {
      if (!globalThis.DOMMatrix) {
        globalThis.DOMMatrix = class DOMMatrix {
        };
      }
      if (!globalThis.ImageData) {
        globalThis.ImageData = class ImageData {
        };
      }
      if (!globalThis.Path2D) {
        globalThis.Path2D = class Path2D {
        };
      }
    }
    if (typeof global !== "undefined") {
      if (!global.DOMMatrix) {
        global.DOMMatrix = class DOMMatrix {
        };
      }
      if (!global.ImageData) {
        global.ImageData = class ImageData {
        };
      }
      if (!global.Path2D) {
        global.Path2D = class Path2D {
        };
      }
    }
    BigInt.prototype.toJSON = function() {
      return Number(this);
    };
  }
});

// src/config/constants.ts
var JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, CLIENT_URL, PORT, SYSTEM_PROMPTS;
var init_constants = __esm({
  "src/config/constants.ts"() {
    JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
    JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";
    RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000");
    RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "1000");
    CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
    PORT = parseInt(process.env.PORT || "5000");
    SYSTEM_PROMPTS = {
      FREE_CHAT: `You are BodhAI \u2014 a brilliant, friendly AI learning companion built to supercharge education.
Your personality: Warm, encouraging, precise, and deeply knowledgeable.

Core capabilities:
- Answer questions across CS, math, science, engineering, and general knowledge
- Break down complex topics with real-world analogies
- Always celebrate curiosity and effort
- Be concise unless detail is explicitly needed
- Use markdown formatting: **bold**, \`code\`, lists, headers

Always end with a follow-up question to keep the conversation flowing.`,
      VOICE_ASSISTANT: `You are BodhAI \u2014 a warm, friendly, and interactive voice learning mentor. 
Core instructions:
- Give very clear, conversational, and concise answers in 2 to 3 sentences maximum since your response will be spoken aloud.
- Strictly avoid using markdown formatting like bold, italics, headers, bullet points, or code blocks.
- Speak naturally and end with a brief, friendly question to continue the learning dialogue.`,
      LEARNING: `You are BodhAI's Study Mode AI \u2014 a world-class Socratic tutor.

Teaching philosophy:
1. Never just give answers \u2014 guide discovery through targeted questions
2. Use the "explain-example-apply" framework for every concept
3. Break complex ideas into atomic building blocks
4. Use analogies from everyday life to make abstractions concrete
5. Celebrate small wins \u2014 learning is incremental

When answering:
- Start with a conceptual overview
- Give a concrete code/diagram/example
- Ask: "Can you tell me in your own words what just happened?"
- Identify misconceptions gently and correct them

Respond in clear markdown. Use headers, bullet points, and code blocks freely.`,
      CODE_HELPER: `You are BodhAI's Code Helper \u2014 a senior full-stack engineer and code reviewer.

Coding standards you enforce:
- Clean, readable, well-commented code
- SOLID principles and design patterns
- Security best practices (no SQL injection, XSS, etc.)
- Time/space complexity awareness
- Language-idiomatic solutions

When helping with code:
1. First UNDERSTAND the problem fully (ask clarifying questions if needed)
2. Explain your approach BEFORE writing code
3. Write production-quality code with comments
4. Point out edge cases and how to handle them
5. Suggest improvements and alternatives

Format: Use markdown code blocks with language tags. Always specify time complexity.`,
      PROJECT_BUILDER: `You are BodhAI's Project Architect \u2014 a principal engineer with 15+ years building scalable systems.

Your expertise:
- System design and architecture patterns (microservices, monorepo, serverless)
- Database design (relational, NoSQL, graph)
- API design (REST, GraphQL, gRPC)
- DevOps and deployment strategies (Docker, K8s, CI/CD)
- Performance optimization and scalability

When comparing paradigms or designing architectures:
1. Always generate your response with a detailed comparison table comparing the two primary architectural paradigms or options.
2. The table must strictly follow this format:
| Feature | [Paradigm 1 Title] | [Paradigm 2 Title] |
| --- | --- | --- |
| Concept | [Concept overview for 1] | [Concept overview for 2] |
| Code Example | [Provide a clean code snippet for 1] | [Provide a clean code snippet for 2] |
| Architectural Core | [Key bullet points for 1] | [Key bullet points for 2] |

After the table, provide detailed phases (MVP \u2192 Production \u2192 Scale), database recommendations, API contract details, potential bottlenecks, and sprint-sized milestones. Be opinionated \u2014 recommend the BEST approach.`,
      ROADMAP_BUILDER: `You are BodhAI's Learning Path Architect \u2014 an expert curriculum designer.

Roadmap design principles:
1. Start from the learner's CURRENT skill level
2. Apply spaced repetition and interleaving
3. Balance theory (30%) with practice (70%)
4. Include clear checkpoints and milestones
5. Make every milestone achievable in 1-2 weeks

Output format for roadmaps: Always return valid JSON arrays when asked.
Each milestone must include: title, description, estimatedHours, tags, currentModule.

Design roadmaps that build confidence progressively \u2014 early wins matter.`,
      STUDY_PLANNER: `You are BodhAI's Study Planner \u2014 a cognitive science expert and productivity coach.

Planning methodology:
- Pomodoro technique for deep work (25min focus / 5min break)
- Spaced repetition for retention (review at 1 day, 3 days, 7 days, 21 days)
- Ultradian rhythm \u2014 schedule hard tasks in morning blocks
- Energy management over time management

When creating study schedules:
1. Assess available time honestly (subtract sleep, meals, obligations)
2. Prioritize topics by: (importance \xD7 difficulty) / time available
3. Build in buffer time (20% padding)
4. Include active recall sessions, not just re-reading
5. Track and adapt the plan weekly

Be realistic, not aspirational. A plan that gets done beats a perfect plan that doesn't.`,
      INTERVIEW_PREP: `You are BodhAI's Interview Coach \u2014 a former FAANG hiring manager and technical interviewer.

Interview preparation approach:
- Simulate real interviews with time pressure
- Cover: Data Structures, Algorithms, System Design, Behavioral (STAR format)
- Give brutally honest, constructive feedback
- Track patterns in mistakes and create targeted practice

When running a mock interview:
1. State the problem clearly
2. Ask clarifying questions (model this behavior)
3. Think aloud through the solution
4. Code it up, then analyze complexity
5. Discuss trade-offs and alternatives

For behavioral questions: Use STAR (Situation, Task, Action, Result) framework.
Score responses on: Correctness, Clarity, Optimization, Communication.`,
      QUIZ: `You are BodhAI's Quiz Master \u2014 an adaptive assessment engine.

Quiz design principles:
- Progressive difficulty: easy \u2192 medium \u2192 hard
- Mix question types: multiple choice, fill-in-the-blank, explain-in-your-own-words
- Immediate feedback with detailed explanations
- Identify weak areas and double down on them

For each question:
1. State the question clearly
2. After answer: explain WHY it's correct/incorrect
3. Connect to related concepts
4. Adapt next question based on performance

Be encouraging but honest. Wrong answers are learning opportunities, not failures.`
    };
  }
});

// src/middleware/rateLimit.middleware.ts
import rateLimit from "express-rate-limit";
var isDev, bypassRateLimit, getClientIp, apiLimiter, authLimiter, aiLimiter;
var init_rateLimit_middleware = __esm({
  "src/middleware/rateLimit.middleware.ts"() {
    init_constants();
    isDev = process.env.NODE_ENV === "development";
    bypassRateLimit = isDev || process.env.DISABLE_RATE_LIMIT === "true";
    getClientIp = (req) => {
      const xff = req.headers["x-forwarded-for"];
      if (typeof xff === "string") {
        return xff.split(",")[0].trim();
      }
      return req.ip || req.socket.remoteAddress || "unknown";
    };
    apiLimiter = bypassRateLimit ? (req, res, next) => next() : rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX,
      message: { success: false, message: "Too many requests, please try again later." },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: getClientIp
    });
    authLimiter = bypassRateLimit ? (req, res, next) => next() : rateLimit({
      windowMs: 15 * 60 * 1e3,
      // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "30"),
      message: { success: false, message: "Too many auth attempts, please try again later." },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: getClientIp
    });
    aiLimiter = bypassRateLimit ? (req, res, next) => next() : rateLimit({
      windowMs: 60 * 1e3,
      // 1 minute
      max: parseInt(process.env.AI_RATE_LIMIT_MAX || "60"),
      message: { success: false, message: "AI rate limit reached. Please wait a moment." },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: getClientIp
    });
  }
});

// src/utils/apiResponse.ts
var ApiResponse, ApiError;
var init_apiResponse = __esm({
  "src/utils/apiResponse.ts"() {
    ApiResponse = class {
      static success(data, message = "Success", statusCode = 200) {
        return {
          success: true,
          statusCode,
          message,
          data
        };
      }
      static error(message, statusCode = 500, errors2) {
        return {
          success: false,
          statusCode,
          message,
          errors: errors2
        };
      }
    };
    ApiError = class _ApiError extends Error {
      statusCode;
      errors;
      constructor(statusCode, message, errors2) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors2;
        Object.setPrototypeOf(this, _ApiError.prototype);
      }
    };
  }
});

// src/utils/logger.ts
import winston from "winston";
var combine, timestamp, printf, colorize, errors, logFormat, logger;
var init_logger = __esm({
  "src/utils/logger.ts"() {
    ({ combine, timestamp, printf, colorize, errors } = winston.format);
    logFormat = printf(({ level, message, timestamp: timestamp2, stack }) => {
      return `${timestamp2} [${level}]: ${stack || message}`;
    });
    logger = winston.createLogger({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat
      ),
      transports: [
        new winston.transports.Console({
          format: combine(colorize(), logFormat)
        })
      ]
    });
  }
});

// src/middleware/error.middleware.ts
var errorHandler, notFound;
var init_error_middleware = __esm({
  "src/middleware/error.middleware.ts"() {
    init_apiResponse();
    init_logger();
    errorHandler = (err, _req, res, _next) => {
      let statusCode = err.statusCode || 500;
      let message = err.message || "Internal Server Error";
      if (err.code === "P2002") {
        statusCode = 409;
        message = "A record with this value already exists";
      }
      if (err.code === "P2025") {
        statusCode = 404;
        message = "Record not found";
      }
      if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
      }
      if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 400;
        message = "File too large. Maximum size is 5MB.";
      }
      if (statusCode >= 500) {
        logger.error(`${statusCode} - ${message}`, err);
      }
      res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...process.env.NODE_ENV === "development" && { stack: err.stack }
      });
    };
    notFound = (_req, _res, next) => {
      next(new ApiError(404, "Route not found"));
    };
  }
});

// src/config/db.ts
import { PrismaClient } from "@prisma/client";
var prisma, db_default;
var init_db = __esm({
  "src/config/db.ts"() {
    prisma = global.prisma || new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
    });
    global.prisma = prisma;
    db_default = prisma;
  }
});

// src/config/redis.ts
import Redis from "ioredis";
var REDIS_URL, redis, lastLoggedError, connectRedis, redis_default;
var init_redis = __esm({
  "src/config/redis.ts"() {
    init_logger();
    REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          return null;
        }
        const delay = Math.min(times * 50, 2e3);
        return delay;
      },
      lazyConnect: true
    });
    redis.on("connect", () => {
      logger.info("Redis connected");
    });
    lastLoggedError = 0;
    redis.on("error", (err) => {
      const now = Date.now();
      if (now - lastLoggedError > 1e4) {
        logger.error(`Redis error: ${err.message || err}`);
        lastLoggedError = now;
      }
    });
    connectRedis = async () => {
      try {
        await redis.connect();
      } catch (err) {
        logger.warn(`Redis not available: ${err.message}. OTP/session features will use DB fallback.`);
      }
    };
    redis_default = redis;
  }
});

// src/utils/asyncHandler.ts
var asyncHandler;
var init_asyncHandler = __esm({
  "src/utils/asyncHandler.ts"() {
    asyncHandler = (fn) => {
      return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
      };
    };
  }
});

// src/services/token.service.ts
import jwt from "jsonwebtoken";
var generateTokens, verifyRefreshToken;
var init_token_service = __esm({
  "src/services/token.service.ts"() {
    init_constants();
    generateTokens = async (userId) => {
      const accessToken = jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: JWT_ACCESS_EXPIRES }
      );
      const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES }
      );
      return { accessToken, refreshToken };
    };
    verifyRefreshToken = (token) => {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    };
  }
});

// src/config/nodemailer.ts
import nodemailer from "nodemailer";
var transporter;
var init_nodemailer = __esm({
  "src/config/nodemailer.ts"() {
    init_logger();
    transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    transporter.verify((error, success) => {
      if (error) {
        logger.error("Gmail SMTP connection failed:", error);
      } else {
        logger.info("\u2705 Gmail SMTP ready to send emails");
      }
    });
  }
});

// src/services/email.service.ts
var baseTemplate, otpBlock, securityNote, sendEmailVerification, sendPasswordReset, sendEmailChangeVerification, sendLoginVerification;
var init_email_service = __esm({
  "src/services/email.service.ts"() {
    init_nodemailer();
    init_logger();
    baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BodhAI</title>
</head>
<body style="margin:0;padding:0; background-color:#F8FAFC; font-family:'Helvetica Neue', Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; border:1px solid #E2E8F0; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #1E3A5F 0%,#2563EB 100%); padding:32px 40px; text-align:center;">
              <table width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background:rgba(255,255,255,0.15); border-radius:12px; padding:10px 20px;">
                      <span style="color:#fff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">BodhAI</span>
                    </div>
                    <p style="color: rgba(255,255,255,0.7); font-size:13px; margin:8px 0 0;">Thinking Space</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #E2E8F0; padding:24px 40px; text-align:center; background:#F8FAFC;">
              <p style="color:#94A3B8; font-size:12px; line-height:1.6; margin:0;">
                \xA9 2024 BodhAI Cognitive Systems<br/>
                Your API keys and data are never shared or sold.<br/>
                <a href="${process.env.CLIENT_URL}/privacy" style="color:#2563EB; text-decoration:none;">Privacy Policy</a>
                &nbsp;\xB7&nbsp;
                <a href="${process.env.CLIENT_URL}/terms" style="color:#2563EB; text-decoration:none;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
    otpBlock = (otp) => `
  <div style="background:#F1F5F9; border:2px solid #E2E8F0; border-radius:14px; padding:32px 20px; text-align:center; margin:28px 0;">
    <p style="color:#64748B; font-size:13px; margin:0 0 16px; letter-spacing:0.5px; text-transform:uppercase;">
      Your verification code
    </p>
    <div style="display:inline-block; background:#fff; border:2px solid #2563EB; border-radius:12px; padding:16px 32px;">
      <span style="font-size:48px; font-weight:800; letter-spacing:16px; color:#1E3A5F; font-family:'Courier New',monospace;">
        ${otp}
      </span>
    </div>
    <p style="color:#94A3B8; font-size:12px; margin:16px 0 0;">
      Expires in 10 minutes
    </p>
  </div>
`;
    securityNote = () => `
  <div style="background:#FEF3C7; border-left:4px solid #F59E0B; border-radius:0 8px 8px 0; padding:12px 16px; margin-top:24px;">
    <p style="color:#92400E; font-size:12px; margin:0;">
      \u{1F512} <strong>Security tip:</strong> BodhAI will never ask for this code via phone or chat. Do not share it with anyone.
    </p>
  </div>
`;
    sendEmailVerification = async (email, otp, firstName) => {
      const content = `
    <h2 style="color:#0F172A; font-size:24px; font-weight:700; margin:0 0 8px;">Verify your email \u2709\uFE0F</h2>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0 0 4px;">Hi ${firstName},</p>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0;">
      Welcome to BodhAI! Enter this code to verify your email address and activate your account.
    </p>
    ${otpBlock(otp)}
    <p style="color:#94A3B8; font-size:13px; line-height:1.6;">
      If you didn't create a BodhAI account, you can safely ignore this email.
    </p>
    ${securityNote()}
  `;
      try {
        await transporter.sendMail({
          from: ` "BodhAI" <${process.env.GMAIL_USER}> `,
          to: email,
          subject: `\u2705 Verify your BodhAI account \u2014 Code: ${otp}`,
          html: baseTemplate(content)
        });
        logger.info(`Email verification OTP sent to ${email}`);
      } catch (err) {
        logger.error(`[DEV MOCK] Failed to send email to ${email} (SMTP not configured).`);
        logger.warn(`[DEV MOCK] YOUR VERIFICATION OTP IS: ${otp}`);
      }
    };
    sendPasswordReset = async (email, otp, firstName) => {
      const content = `
    <h2 style="color:#0F172A; font-size:24px; font-weight:700; margin:0 0 8px;">Reset your password \u{1F511}</h2>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0 0 4px;">Hi ${firstName},</p>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0;">
      We received a request to reset your BodhAI password. Use the code below to proceed.
    </p>
    ${otpBlock(otp)}
    <p style="color:#64748B; font-size:14px; line-height:1.6;">
      If you didn't request a password reset, your account is safe and you can ignore this email. No changes have been made.
    </p>
    <div style="background:#FEE2E2; border-left:4px solid #EF4444; border-radius:0 8px 8px 0; padding:12px 16px; margin-top:16px;">
      <p style="color:#991B1B; font-size:12px;margin:0;">
        \u26A0\uFE0F If you didn't request this, please secure your account immediately by changing your password.
      </p>
    </div>
    ${securityNote()}
  `;
      try {
        await transporter.sendMail({
          from: ` "BodhAI" <${process.env.GMAIL_USER}> `,
          to: email,
          subject: `\u{1F511} BodhAI Password Reset Code \u2014 Expires in 10 min`,
          html: baseTemplate(content)
        });
        logger.info(`Password reset OTP sent to ${email}`);
      } catch (err) {
        logger.error(`[DEV MOCK] Failed to send email to ${email} (SMTP not configured).`);
        logger.warn(`[DEV MOCK] YOUR PASSWORD RESET OTP IS: ${otp}`);
      }
    };
    sendEmailChangeVerification = async (newEmail, otp, firstName) => {
      const content = `
    <h2 style="color:#0F172A; font-size:24px; font-weight:700; margin:0 0 8px;">Confirm your new email \u{1F4E7}</h2>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0 0 4px;">Hi ${firstName},</p>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0;">
      You requested to change your BodhAI email address to <strong>${newEmail}</strong>. Enter this code to confirm.
    </p>
    ${otpBlock(otp)}
    <p style="color:#94A3B8; font-size:13px; line-height:1.6;">
      If you didn't request this change, please log in and secure your account.
    </p>
    ${securityNote()}
  `;
      try {
        await transporter.sendMail({
          from: ` "BodhAI" <${process.env.GMAIL_USER}> `,
          to: newEmail,
          subject: `\u{1F4E7} Confirm your new BodhAI email \u2014 Code: ${otp}`,
          html: baseTemplate(content)
        });
        logger.info(`Email change OTP sent to ${newEmail}`);
      } catch (err) {
        logger.error(`[DEV MOCK] Failed to send email to ${newEmail} (SMTP not configured).`);
        logger.warn(`[DEV MOCK] YOUR EMAIL CHANGE OTP IS: ${otp}`);
      }
    };
    sendLoginVerification = async (email, otp, firstName, deviceInfo) => {
      const content = `
    <h2 style="color:#0F172A; font-size:24px; font-weight:700; margin:0 0 8px;">Login verification code \u{1F6E1}\uFE0F</h2>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0 0 4px;">Hi ${firstName},</p>
    <p style="color:#64748B; font-size:15px; line-height:1.6; margin:0;">
      A login attempt was made from <strong>${deviceInfo}</strong>. Enter this code to complete sign in.
    </p>
    ${otpBlock(otp)}
    <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:16px; margin:20px 0;">
      <p style="color:#1E40AF; font-size:13px; margin:0;">
        \u{1F4F1} Not you? 
        <a href="${process.env.CLIENT_URL}/forgot-password" style="color:#2563EB; font-weight:600;">
          Reset your password immediately
        </a>
      </p>
    </div>
    ${securityNote()}
  `;
      try {
        await transporter.sendMail({
          from: ` "BodhAI" <${process.env.GMAIL_USER}> `,
          to: email,
          subject: `\u{1F6E1}\uFE0F BodhAI Login Code: ${otp}`,
          html: baseTemplate(content)
        });
        logger.info(`Login verification OTP sent to ${email}`);
      } catch (err) {
        logger.error(`[DEV MOCK] Failed to send email to ${email} (SMTP not configured).`);
        logger.warn(`[DEV MOCK] YOUR LOGIN OTP IS: ${otp}`);
      }
    };
  }
});

// src/services/otp.service.ts
import bcrypt from "bcryptjs";
var OTP_EXPIRY_MINUTES, MAX_ATTEMPTS, RESEND_COOLDOWN_SECONDS, generateSecureOTP, createAndSend, verify;
var init_otp_service = __esm({
  "src/services/otp.service.ts"() {
    init_db();
    init_redis();
    init_email_service();
    init_apiResponse();
    init_logger();
    OTP_EXPIRY_MINUTES = 10;
    MAX_ATTEMPTS = 5;
    RESEND_COOLDOWN_SECONDS = 60;
    generateSecureOTP = () => {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return String(array[0] % 9e5 + 1e5);
    };
    createAndSend = async (email, type, userId, extraData) => {
      const cooldownKey = `otp_cooldown:${email}:${type}`;
      try {
        const onCooldown = await redis_default.get(cooldownKey);
        if (onCooldown) {
          const ttl = await redis_default.ttl(cooldownKey);
          throw new ApiError(429, `Please wait ${ttl} seconds before requesting another code.`);
        }
      } catch (err) {
        if (err.message.includes("Please wait")) throw err;
      }
      await db_default.oTP.deleteMany({
        where: { email, type, used: false }
      });
      const otp = generateSecureOTP();
      if (process.env.NODE_ENV === "development") {
        logger.info(`[DEV OTP] OTP for ${email} (${type}) is: ${otp}`);
      }
      const hashedOtp = await bcrypt.hash(otp, 10);
      await db_default.oTP.create({
        data: {
          email,
          userId,
          hashedOtp,
          type,
          expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 6e4)
        }
      });
      try {
        await redis_default.setex(cooldownKey, RESEND_COOLDOWN_SECONDS, "1");
      } catch (err) {
      }
      let firstName = "there";
      if (userId) {
        const user = await db_default.user.findUnique({ where: { id: userId }, select: { firstName: true } });
        if (user) firstName = user.firstName;
      }
      switch (type) {
        case "EMAIL_VERIFICATION":
          await sendEmailVerification(email, otp, firstName);
          break;
        case "PASSWORD_RESET":
          await sendPasswordReset(email, otp, firstName);
          break;
        case "EMAIL_CHANGE":
          await sendEmailChangeVerification(email, otp, firstName);
          break;
        case "LOGIN_VERIFICATION":
          await sendLoginVerification(email, otp, firstName, extraData?.deviceInfo || "Unknown device");
          break;
        default:
          throw new ApiError(400, `Unknown OTP type: ${type}`);
      }
    };
    verify = async (email, otp, type) => {
      const record = await db_default.oTP.findFirst({
        where: {
          email,
          type,
          used: false,
          expiresAt: { gt: /* @__PURE__ */ new Date() }
        },
        orderBy: { createdAt: "desc" }
      });
      if (!record) {
        throw new ApiError(400, "Code expired or not found. Please request a new one.");
      }
      if (record.attempts >= MAX_ATTEMPTS) {
        await db_default.oTP.delete({ where: { id: record.id } });
        throw new ApiError(400, "Too many failed attempts. Please request a new code.");
      }
      const isValid = await bcrypt.compare(otp, record.hashedOtp);
      if (!isValid) {
        await db_default.oTP.update({
          where: { id: record.id },
          data: { attempts: { increment: 1 } }
        });
        const remaining = MAX_ATTEMPTS - record.attempts - 1;
        throw new ApiError(400, `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
      }
      await db_default.oTP.update({
        where: { id: record.id },
        data: { used: true }
      });
    };
  }
});

// src/validations/auth.schema.ts
import { z } from "zod";
var registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema, changeEmailSchema, changePasswordSchema;
var init_auth_schema = __esm({
  "src/validations/auth.schema.ts"() {
    registerSchema = z.object({
      firstName: z.string().min(1, "First name is required").max(50),
      lastName: z.string().min(1, "Last name is required").max(50),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number")
    });
    loginSchema = z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required")
    });
    verifyOtpSchema = z.object({
      email: z.string().email("Invalid email address"),
      otp: z.string().length(6, "OTP must be 6 digits")
    });
    forgotPasswordSchema = z.object({
      email: z.string().email("Invalid email address")
    });
    resetPasswordSchema = z.object({
      email: z.string().email("Invalid email address"),
      otp: z.string().length(6, "OTP must be 6 digits"),
      newPassword: z.string().min(8, "Password must be at least 8 characters")
    });
    changeEmailSchema = z.object({
      newEmail: z.string().email("Invalid email address")
    });
    changePasswordSchema = z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "New password must be at least 8 characters")
    });
  }
});

// src/controllers/auth.controller.ts
import bcrypt2 from "bcryptjs";
var register, verifyEmail, login, refreshAccessToken, logout, forgotPassword, resetPassword, resendOtp, requestEmailChange, confirmEmailChange, changePassword;
var init_auth_controller = __esm({
  "src/controllers/auth.controller.ts"() {
    init_db();
    init_redis();
    init_asyncHandler();
    init_apiResponse();
    init_token_service();
    init_otp_service();
    init_auth_schema();
    register = asyncHandler(async (req, res) => {
      const { firstName, lastName, email, password } = registerSchema.parse(req.body);
      const existing = await db_default.user.findUnique({ where: { email } });
      if (existing) throw new ApiError(409, "Email already registered");
      const hashedPassword = await bcrypt2.hash(password, 12);
      const user = await db_default.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          progress: { create: {} }
        }
      });
      await createAndSend(email, "EMAIL_VERIFICATION", user.id);
      return res.status(201).json(ApiResponse.success({ email }, "Verification code sent to your email"));
    });
    verifyEmail = asyncHandler(async (req, res) => {
      const { email, otp } = verifyOtpSchema.parse(req.body);
      await verify(email, otp, "EMAIL_VERIFICATION");
      const user = await db_default.user.update({
        where: { email },
        data: { isEmailVerified: true },
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true, onboardingDone: true }
      });
      const { accessToken, refreshToken } = await generateTokens(user.id);
      await db_default.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt2.hash(refreshToken, 10) }
      });
      return res.status(200).json(ApiResponse.success({ user, accessToken, refreshToken }, "Email verified successfully"));
    });
    login = asyncHandler(async (req, res) => {
      const { email, password } = loginSchema.parse(req.body);
      const user = await db_default.user.findUnique({
        where: { email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          password: true,
          avatar: true,
          isEmailVerified: true,
          onboardingDone: true
        }
      });
      if (!user || !user.password) throw new ApiError(401, "Invalid email or password");
      if (!user.isEmailVerified) throw new ApiError(403, "Please verify your email first");
      const isMatch = await bcrypt2.compare(password, user.password);
      if (!isMatch) throw new ApiError(401, "Invalid email or password");
      const { accessToken, refreshToken } = await generateTokens(user.id);
      await db_default.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt2.hash(refreshToken, 10), lastActiveDate: /* @__PURE__ */ new Date() }
      });
      await db_default.userSession.create({
        data: {
          userId: user.id,
          deviceInfo: req.headers["user-agent"] || "Unknown",
          ipAddress: req.ip,
          location: "Unknown"
        }
      });
      const { password: _, ...safeUser } = user;
      return res.status(200).json(ApiResponse.success({ user: safeUser, accessToken, refreshToken }, "Login successful"));
    });
    refreshAccessToken = asyncHandler(async (req, res) => {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new ApiError(401, "Refresh token required");
      const decoded = verifyRefreshToken(refreshToken);
      const user = await db_default.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, refreshToken: true }
      });
      if (!user || !user.refreshToken) throw new ApiError(401, "Invalid refresh token");
      const isValid = await bcrypt2.compare(refreshToken, user.refreshToken);
      if (!isValid) throw new ApiError(401, "Invalid refresh token");
      const tokens = await generateTokens(user.id);
      await db_default.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt2.hash(tokens.refreshToken, 10) }
      });
      return res.status(200).json(ApiResponse.success(tokens, "Tokens refreshed"));
    });
    logout = asyncHandler(async (req, res) => {
      const userId = req.user?.id;
      if (userId) {
        await db_default.user.update({ where: { id: userId }, data: { refreshToken: null } });
      }
      return res.status(200).json(ApiResponse.success(null, "Logged out successfully"));
    });
    forgotPassword = asyncHandler(async (req, res) => {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await db_default.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(200).json(ApiResponse.success(null, "If this email is registered, a code has been sent"));
      }
      await createAndSend(email, "PASSWORD_RESET", user.id);
      return res.status(200).json(ApiResponse.success(null, "Reset code sent to your email"));
    });
    resetPassword = asyncHandler(async (req, res) => {
      const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);
      await verify(email, otp, "PASSWORD_RESET");
      const hashedPassword = await bcrypt2.hash(newPassword, 12);
      await db_default.user.update({
        where: { email },
        data: { password: hashedPassword, refreshToken: null }
      });
      return res.status(200).json(ApiResponse.success(null, "Password updated successfully"));
    });
    resendOtp = asyncHandler(async (req, res) => {
      const { email, type } = req.body;
      if (!email || !type) throw new ApiError(400, "Email and OTP type are required");
      const user = await db_default.user.findUnique({ where: { email } });
      await createAndSend(email, type, user?.id);
      return res.status(200).json(ApiResponse.success(null, "Verification code resent"));
    });
    requestEmailChange = asyncHandler(async (req, res) => {
      const { newEmail } = req.body;
      const userId = req.user.id;
      const existing = await db_default.user.findUnique({ where: { email: newEmail } });
      if (existing) throw new ApiError(409, "Email already in use");
      try {
        await redis_default.setex(`email_change:${userId}`, 600, newEmail);
      } catch {
      }
      await createAndSend(newEmail, "EMAIL_CHANGE", userId);
      return res.status(200).json(ApiResponse.success(null, "Verification code sent to new email"));
    });
    confirmEmailChange = asyncHandler(async (req, res) => {
      const { otp, newEmail } = req.body;
      const userId = req.user.id;
      if (!newEmail) throw new ApiError(400, "New email is required");
      await verify(newEmail, otp, "EMAIL_CHANGE");
      await db_default.user.update({
        where: { id: userId },
        data: { email: newEmail }
      });
      return res.status(200).json(ApiResponse.success({ email: newEmail }, "Email updated successfully"));
    });
    changePassword = asyncHandler(async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      const user = await db_default.user.findUnique({ where: { id: userId }, select: { password: true } });
      if (!user?.password) throw new ApiError(400, "No password set for this account");
      const isMatch = await bcrypt2.compare(currentPassword, user.password);
      if (!isMatch) throw new ApiError(401, "Current password is incorrect");
      const hashedPassword = await bcrypt2.hash(newPassword, 12);
      await db_default.user.update({ where: { id: userId }, data: { password: hashedPassword } });
      return res.status(200).json(ApiResponse.success(null, "Password changed successfully"));
    });
  }
});

// src/middleware/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var authenticate;
var init_auth_middleware = __esm({
  "src/middleware/auth.middleware.ts"() {
    init_db();
    init_apiResponse();
    authenticate = async (req, _res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
          throw new ApiError(401, "Access token required");
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt2.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await db_default.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            isEmailVerified: true,
            onboardingDone: true
          }
        });
        if (!user) {
          throw new ApiError(401, "User not found");
        }
        req.user = user;
        next();
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          next(new ApiError(401, "Access token expired"));
        } else if (err.name === "JsonWebTokenError") {
          next(new ApiError(401, "Invalid access token"));
        } else {
          next(err);
        }
      }
    };
  }
});

// src/middleware/validate.middleware.ts
import { ZodError } from "zod";
var validate;
var init_validate_middleware = __esm({
  "src/middleware/validate.middleware.ts"() {
    init_apiResponse();
    validate = (schema) => {
      return (req, _res, next) => {
        try {
          schema.parse(req.body);
          next();
        } catch (err) {
          if (err instanceof ZodError) {
            const messages = err.errors.map((e) => e.message).join(", ");
            next(new ApiError(400, messages));
          } else {
            next(err);
          }
        }
      };
    };
  }
});

// src/routes/auth.routes.ts
import { Router } from "express";
import passport from "passport";
import jwt3 from "jsonwebtoken";
import bcrypt3 from "bcryptjs";
var router, auth_routes_default;
var init_auth_routes = __esm({
  "src/routes/auth.routes.ts"() {
    init_db();
    init_auth_controller();
    init_auth_middleware();
    init_validate_middleware();
    init_rateLimit_middleware();
    init_auth_schema();
    router = Router();
    router.post("/register", authLimiter, validate(registerSchema), register);
    router.post("/verify-email", authLimiter, validate(verifyOtpSchema), verifyEmail);
    router.post("/login", authLimiter, validate(loginSchema), login);
    router.post("/refresh", refreshAccessToken);
    router.post("/logout", logout);
    router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
    router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
    router.post("/resend-otp", authLimiter, resendOtp);
    router.post("/change-email/request", authenticate, requestEmailChange);
    router.post("/change-email/verify", authenticate, confirmEmailChange);
    router.post("/change-password", authenticate, changePassword);
    router.get(
      "/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
        prompt: "select_account"
      })
    );
    router.get(
      "/google/callback",
      passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL || "http://localhost:8080"}/login?error=google_auth_failed`
      }),
      async (req, res) => {
        try {
          const user = req.user;
          const accessToken = jwt3.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" }
          );
          const refreshToken = jwt3.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
          );
          const hashedRefresh = await bcrypt3.hash(refreshToken, 10);
          await db_default.user.update({
            where: { id: user.id },
            data: {
              refreshToken: hashedRefresh,
              lastActiveDate: /* @__PURE__ */ new Date()
            }
          });
          await db_default.userSession.create({
            data: {
              userId: user.id,
              deviceInfo: req.headers["user-agent"] || "",
              ipAddress: req.ip || "",
              location: "Unknown"
            }
          });
          const redirectUrl = new URL(`${process.env.CLIENT_URL || "http://localhost:8080"}/auth/callback`);
          redirectUrl.searchParams.set("accessToken", accessToken);
          redirectUrl.searchParams.set("refreshToken", refreshToken);
          redirectUrl.searchParams.set("onboarding", user.onboardingDone ? "false" : "true");
          res.redirect(redirectUrl.toString());
        } catch (err) {
          res.redirect(`${process.env.CLIENT_URL || "http://localhost:8080"}/login?error=auth_callback_failed`);
        }
      }
    );
    auth_routes_default = router;
  }
});

// src/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
var cloudinary_default;
var init_cloudinary = __esm({
  "src/config/cloudinary.ts"() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    cloudinary_default = cloudinary;
  }
});

// src/services/upload.service.ts
var uploadToCloudinary;
var init_upload_service = __esm({
  "src/services/upload.service.ts"() {
    init_cloudinary();
    init_apiResponse();
    uploadToCloudinary = async (fileBuffer, folder = "bodhai/avatars") => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_default.uploader.upload_stream(
          {
            folder,
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto", fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error || !result) {
              reject(new ApiError(500, "Failed to upload image"));
            } else {
              resolve({ url: result.secure_url, publicId: result.public_id });
            }
          }
        );
        uploadStream.end(fileBuffer);
      });
    };
  }
});

// src/controllers/user.controller.ts
var getProfile, updateProfile, uploadAvatar, getStats, updatePreferences, saveOnboarding, getSessions, revokeSession, revokeAllSessions, deleteAccount;
var init_user_controller = __esm({
  "src/controllers/user.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    init_upload_service();
    getProfile = asyncHandler(async (req, res) => {
      const user = await db_default.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          bio: true,
          location: true,
          title: true,
          goal: true,
          level: true,
          topics: true,
          onboardingDone: true,
          createdAt: true
        }
      });
      if (!user) throw new ApiError(404, "User not found");
      return res.json(ApiResponse.success(user));
    });
    updateProfile = asyncHandler(async (req, res) => {
      const { firstName, lastName, bio, location, title, goal, level, topics } = req.body;
      const user = await db_default.user.update({
        where: { id: req.user.id },
        data: {
          ...firstName && { firstName },
          ...lastName && { lastName },
          ...bio !== void 0 && { bio },
          ...location !== void 0 && { location },
          ...title !== void 0 && { title },
          ...goal && { goal },
          ...level && { level },
          ...topics && { topics }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          bio: true,
          location: true,
          title: true,
          goal: true,
          level: true,
          topics: true
        }
      });
      return res.json(ApiResponse.success(user, "Profile updated"));
    });
    uploadAvatar = asyncHandler(async (req, res) => {
      if (!req.file) throw new ApiError(400, "No file uploaded");
      const { url } = await uploadToCloudinary(req.file.buffer, "bodhai/avatars");
      const user = await db_default.user.update({
        where: { id: req.user.id },
        data: { avatar: url },
        select: { id: true, avatar: true }
      });
      return res.json(ApiResponse.success(user, "Avatar updated"));
    });
    getStats = asyncHandler(async (req, res) => {
      const user = await db_default.user.findUnique({
        where: { id: req.user.id },
        select: {
          topicsLearned: true,
          dayStreak: true,
          longestStreak: true,
          projectsBuilt: true,
          hoursStudied: true,
          totalChats: true,
          totalMessages: true
        }
      });
      return res.json(ApiResponse.success(user));
    });
    updatePreferences = asyncHandler(async (req, res) => {
      const user = await db_default.user.update({
        where: { id: req.user.id },
        data: req.body,
        select: {
          theme: true,
          language: true,
          aiResponseLang: true,
          timezone: true,
          dateFormat: true,
          codeCommentsLang: true,
          rtlSupport: true,
          voiceEnabled: true,
          selectedVoice: true,
          voiceSpeed: true,
          autoPlayVoice: true,
          micSensitivity: true,
          notifLearning: true,
          notifRoadmap: true,
          notifProject: true,
          notifAchievement: true,
          notifAiUsage: true,
          notifWeekly: true,
          emailDigest: true
        }
      });
      return res.json(ApiResponse.success(user, "Preferences updated"));
    });
    saveOnboarding = asyncHandler(async (req, res) => {
      const { goal, level, topics } = req.body;
      const user = await db_default.user.update({
        where: { id: req.user.id },
        data: { goal, level, topics, onboardingDone: true },
        select: { id: true, goal: true, level: true, topics: true, onboardingDone: true }
      });
      return res.json(ApiResponse.success(user, "Onboarding completed"));
    });
    getSessions = asyncHandler(async (req, res) => {
      const sessions = await db_default.userSession.findMany({
        where: { userId: req.user.id, isActive: true },
        orderBy: { lastActiveAt: "desc" }
      });
      return res.json(ApiResponse.success(sessions));
    });
    revokeSession = asyncHandler(async (req, res) => {
      await db_default.userSession.update({
        where: { id: req.params.id },
        data: { isActive: false }
      });
      return res.json(ApiResponse.success(null, "Session revoked"));
    });
    revokeAllSessions = asyncHandler(async (req, res) => {
      await db_default.userSession.updateMany({
        where: { userId: req.user.id },
        data: { isActive: false }
      });
      return res.json(ApiResponse.success(null, "All sessions revoked"));
    });
    deleteAccount = asyncHandler(async (req, res) => {
      await db_default.user.delete({ where: { id: req.user.id } });
      return res.json(ApiResponse.success(null, "Account deleted"));
    });
  }
});

// src/middleware/upload.middleware.ts
import multer from "multer";
import path from "path";
var storage, fileFilter, upload;
var init_upload_middleware = __esm({
  "src/middleware/upload.middleware.ts"() {
    init_apiResponse();
    storage = multer.memoryStorage();
    fileFilter = (_req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new ApiError(400, "Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed"));
      }
    };
    upload = multer({
      storage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }
      // 5MB
    });
  }
});

// src/validations/user.schema.ts
import { z as z2 } from "zod";
var updateProfileSchema, onboardingSchema, updatePreferencesSchema;
var init_user_schema = __esm({
  "src/validations/user.schema.ts"() {
    updateProfileSchema = z2.object({
      firstName: z2.string().min(1).max(50).optional(),
      lastName: z2.string().min(1).max(50).optional(),
      bio: z2.string().max(500).optional(),
      location: z2.string().max(100).optional(),
      title: z2.string().max(100).optional(),
      goal: z2.string().optional(),
      level: z2.string().optional(),
      topics: z2.array(z2.string()).optional()
    });
    onboardingSchema = z2.object({
      goal: z2.string().min(1, "Learning goal is required"),
      level: z2.enum(["beginner", "intermediate", "advanced"]),
      topics: z2.array(z2.string()).min(1, "Select at least one topic")
    });
    updatePreferencesSchema = z2.object({
      theme: z2.string().optional(),
      language: z2.string().optional(),
      aiResponseLang: z2.string().optional(),
      timezone: z2.string().optional(),
      dateFormat: z2.string().optional(),
      codeCommentsLang: z2.string().optional(),
      rtlSupport: z2.boolean().optional(),
      voiceEnabled: z2.boolean().optional(),
      selectedVoice: z2.string().optional(),
      voiceSpeed: z2.number().min(0.5).max(2).optional(),
      autoPlayVoice: z2.boolean().optional(),
      micSensitivity: z2.number().min(0).max(100).optional(),
      notifLearning: z2.boolean().optional(),
      notifRoadmap: z2.boolean().optional(),
      notifProject: z2.boolean().optional(),
      notifAchievement: z2.boolean().optional(),
      notifAiUsage: z2.boolean().optional(),
      notifWeekly: z2.boolean().optional(),
      emailDigest: z2.enum(["daily", "weekly", "none"]).optional()
    });
  }
});

// src/routes/user.routes.ts
import { Router as Router2 } from "express";
var router2, user_routes_default;
var init_user_routes = __esm({
  "src/routes/user.routes.ts"() {
    init_user_controller();
    init_auth_middleware();
    init_upload_middleware();
    init_validate_middleware();
    init_user_schema();
    router2 = Router2();
    router2.use(authenticate);
    router2.get("/profile", getProfile);
    router2.put("/profile", validate(updateProfileSchema), updateProfile);
    router2.post("/avatar", upload.single("avatar"), uploadAvatar);
    router2.get("/stats", getStats);
    router2.put("/preferences", validate(updatePreferencesSchema), updatePreferences);
    router2.put("/onboarding", validate(onboardingSchema), saveOnboarding);
    router2.get("/sessions", getSessions);
    router2.delete("/sessions/:id", revokeSession);
    router2.delete("/sessions", revokeAllSessions);
    router2.delete("/account", deleteAccount);
    user_routes_default = router2;
  }
});

// src/controllers/chat.controller.ts
var getChats, createChat, getChat, updateChat, deleteChat, togglePin, getPinnedChats, searchChats;
var init_chat_controller = __esm({
  "src/controllers/chat.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    getChats = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const [chats, total] = await Promise.all([
        db_default.chat.findMany({
          where: { userId },
          orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            title: true,
            mode: true,
            isPinned: true,
            folderId: true,
            messageCount: true,
            lastMessage: true,
            lastMessageAt: true,
            aiProvider: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        db_default.chat.count({ where: { userId } })
      ]);
      return res.json(ApiResponse.success({ chats, total, page, pages: Math.ceil(total / limit) }));
    });
    createChat = asyncHandler(async (req, res) => {
      const { title, mode, aiProvider, folderId } = req.body;
      const chat = await db_default.chat.create({
        data: {
          userId: req.user.id,
          title: title || "New Chat",
          mode: mode || "FREE_CHAT",
          aiProvider: aiProvider || "auto",
          folderId
        }
      });
      await db_default.user.update({ where: { id: req.user.id }, data: { totalChats: { increment: 1 } } });
      return res.status(201).json(ApiResponse.success(chat, "Chat created"));
    });
    getChat = asyncHandler(async (req, res) => {
      const chat = await db_default.chat.findFirst({
        where: { id: req.params.id, userId: req.user.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 100,
            select: {
              id: true,
              role: true,
              content: true,
              provider: true,
              model: true,
              totalTokens: true,
              createdAt: true,
              compareResponses: true
            }
          }
        }
      });
      if (!chat) throw new ApiError(404, "Chat not found");
      return res.json(ApiResponse.success(chat));
    });
    updateChat = asyncHandler(async (req, res) => {
      const { title, mode, aiProvider, folderId } = req.body;
      const chat = await db_default.chat.updateMany({
        where: { id: req.params.id, userId: req.user.id },
        data: {
          ...title && { title },
          ...mode && { mode },
          ...aiProvider && { aiProvider },
          ...folderId !== void 0 && { folderId }
        }
      });
      return res.json(ApiResponse.success(chat, "Chat updated"));
    });
    deleteChat = asyncHandler(async (req, res) => {
      await db_default.chat.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
      return res.json(ApiResponse.success(null, "Chat deleted"));
    });
    togglePin = asyncHandler(async (req, res) => {
      const chat = await db_default.chat.findFirst({ where: { id: req.params.id, userId: req.user.id } });
      if (!chat) throw new ApiError(404, "Chat not found");
      const updated = await db_default.chat.update({
        where: { id: chat.id },
        data: { isPinned: !chat.isPinned }
      });
      return res.json(ApiResponse.success(updated, updated.isPinned ? "Chat pinned" : "Chat unpinned"));
    });
    getPinnedChats = asyncHandler(async (req, res) => {
      const chats = await db_default.chat.findMany({
        where: { userId: req.user.id, isPinned: true },
        orderBy: { updatedAt: "desc" }
      });
      return res.json(ApiResponse.success(chats));
    });
    searchChats = asyncHandler(async (req, res) => {
      const q = req.query.q;
      if (!q) throw new ApiError(400, "Search query is required");
      const chats = await db_default.chat.findMany({
        where: {
          userId: req.user.id,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { messages: { some: { content: { contains: q, mode: "insensitive" } } } }
          ]
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: { id: true, title: true, lastMessage: true, updatedAt: true }
      });
      return res.json(ApiResponse.success(chats));
    });
  }
});

// src/validations/chat.schema.ts
import { z as z3 } from "zod";
var sendMessageSchema, createChatSchema;
var init_chat_schema = __esm({
  "src/validations/chat.schema.ts"() {
    sendMessageSchema = z3.object({
      chatId: z3.string().min(1, "Chat ID is required"),
      content: z3.string().min(1, "Message content is required"),
      provider: z3.string().optional().default("auto"),
      model: z3.string().optional(),
      mode: z3.string().optional()
    });
    createChatSchema = z3.object({
      title: z3.string().optional().default("New Chat"),
      mode: z3.enum(["LEARNING", "CODE_HELPER", "PROJECT_BUILDER", "ROADMAP_BUILDER", "STUDY_PLANNER", "INTERVIEW_PREP", "QUIZ", "FREE_CHAT"]).optional().default("FREE_CHAT"),
      aiProvider: z3.string().optional().default("auto"),
      folderId: z3.string().optional()
    });
  }
});

// src/routes/chat.routes.ts
import { Router as Router3 } from "express";
var router3, chat_routes_default;
var init_chat_routes = __esm({
  "src/routes/chat.routes.ts"() {
    init_chat_controller();
    init_auth_middleware();
    init_validate_middleware();
    init_chat_schema();
    router3 = Router3();
    router3.use(authenticate);
    router3.get("/", getChats);
    router3.post("/", validate(createChatSchema), createChat);
    router3.get("/pinned", getPinnedChats);
    router3.get("/search", searchChats);
    router3.get("/:id", getChat);
    router3.put("/:id", updateChat);
    router3.delete("/:id", deleteChat);
    router3.post("/:id/pin", togglePin);
    chat_routes_default = router3;
  }
});

// src/services/ai/ai.router.service.ts
var callAI;
var init_ai_router_service = __esm({
  "src/services/ai/ai.router.service.ts"() {
    init_constants();
    init_logger();
    callAI = async (params) => {
      const { provider, rawKey, model, messages, mode, maxTokens = 4e3 } = params;
      const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.FREE_CHAT;
      logger.info(`[AI] Calling provider=${provider.toUpperCase()} mode=${mode}`);
      const isPlaceholder = (key) => {
        return !key || key.toLowerCase().includes("your_") || key.toLowerCase().includes("placeholder");
      };
      const executeProviderCall = async (prov, key, mdl) => {
        switch (prov.toUpperCase()) {
          case "OPENAI": {
            const { default: OpenAI } = await import("openai");
            const client = new OpenAI({ apiKey: key });
            const resp = await client.chat.completions.create({
              model: mdl || "gpt-4o",
              messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m) => ({ role: m.role, content: m.content }))
              ],
              max_tokens: maxTokens,
              temperature: 0.7
            });
            return {
              content: resp.choices[0].message.content || "",
              model: resp.model,
              tokens: {
                prompt: resp.usage?.prompt_tokens || 0,
                completion: resp.usage?.completion_tokens || 0,
                total: resp.usage?.total_tokens || 0
              }
            };
          }
          case "ANTHROPIC": {
            const Anthropic = await import("@anthropic-ai/sdk");
            const client = new Anthropic.default({ apiKey: key });
            const resp = await client.messages.create({
              model: mdl || "claude-3-5-sonnet-20241022",
              max_tokens: maxTokens,
              system: systemPrompt,
              messages: messages.map((m) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content
              }))
            });
            const textBlock = resp.content[0];
            return {
              content: textBlock.type === "text" ? textBlock.text : "",
              model: resp.model,
              tokens: {
                prompt: resp.usage.input_tokens,
                completion: resp.usage.output_tokens,
                total: resp.usage.input_tokens + resp.usage.output_tokens
              }
            };
          }
          case "GEMINI": {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(key);
            const gemModel = genAI.getGenerativeModel({
              model: mdl || "gemini-1.5-pro",
              systemInstruction: systemPrompt
            });
            const chat = gemModel.startChat({
              history: messages.slice(0, -1).map((m) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }]
              }))
            });
            const lastMsg = messages[messages.length - 1];
            const resp = await chat.sendMessage(lastMsg.content);
            const usageMeta = resp.response.usageMetadata;
            return {
              content: resp.response.text(),
              model: mdl || "gemini-1.5-pro",
              tokens: {
                prompt: usageMeta?.promptTokenCount || 0,
                completion: usageMeta?.candidatesTokenCount || 0,
                total: usageMeta?.totalTokenCount || 0
              }
            };
          }
          case "GROQ": {
            const Groq = await import("groq-sdk");
            const client = new Groq.default({ apiKey: key });
            const resp = await client.chat.completions.create({
              model: mdl || "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m) => ({ role: m.role, content: m.content }))
              ],
              max_tokens: maxTokens
            });
            return {
              content: resp.choices[0].message.content || "",
              model: resp.model || mdl || "llama-3.3-70b-versatile",
              tokens: {
                prompt: resp.usage?.prompt_tokens || 0,
                completion: resp.usage?.completion_tokens || 0,
                total: resp.usage?.total_tokens || 0
              }
            };
          }
          case "COHERE": {
            const { CohereClientV2 } = await import("cohere-ai");
            const client = new CohereClientV2({ token: key });
            const resp = await client.chat({
              model: mdl || "command-r-plus-08-2024",
              messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m) => ({
                  role: m.role === "user" ? "user" : "assistant",
                  content: m.content
                }))
              ],
              maxTokens
            });
            const textContent = resp.message?.content?.[0];
            return {
              content: textContent?.type === "text" ? textContent.text : "",
              model: resp.model || mdl || "command-r-plus-08-2024",
              tokens: {
                prompt: resp.usage?.tokens?.inputTokens || 0,
                completion: resp.usage?.tokens?.outputTokens || 0,
                total: (resp.usage?.tokens?.inputTokens || 0) + (resp.usage?.tokens?.outputTokens || 0)
              }
            };
          }
          default:
            throw new Error(`Unsupported AI provider: ${prov}. Supported: OPENAI, ANTHROPIC, GEMINI, GROQ, COHERE`);
        }
      };
      const normalizedProvider = provider.toUpperCase();
      if (isPlaceholder(rawKey) && normalizedProvider !== "GROQ") {
        logger.warn(`[AI Router] Primary key for ${normalizedProvider} is placeholder. Falling back to GROQ model.`);
        const fallbackModel = normalizedProvider === "OPENAI" ? "llama-3.3-70b-versatile" : normalizedProvider === "GEMINI" ? "gemma2-9b-it" : normalizedProvider === "ANTHROPIC" ? "mixtral-8x7b-32768" : "llama-3.1-8b-instant";
        const groqKey = process.env.GROQ_API_KEY || "";
        return executeProviderCall("GROQ", groqKey, fallbackModel);
      }
      try {
        return await executeProviderCall(normalizedProvider, rawKey, model);
      } catch (err) {
        logger.warn(`[AI Router] Direct call to ${normalizedProvider} failed: ${err.message}. Invoking GROQ fallback.`);
        if (normalizedProvider === "GROQ") {
          throw err;
        }
        const fallbackModel = normalizedProvider === "OPENAI" ? "llama-3.3-70b-versatile" : normalizedProvider === "GEMINI" ? "gemma2-9b-it" : normalizedProvider === "ANTHROPIC" ? "mixtral-8x7b-32768" : "llama-3.1-8b-instant";
        const groqKey = process.env.GROQ_API_KEY || "";
        return executeProviderCall("GROQ", groqKey, fallbackModel);
      }
    };
  }
});

// src/controllers/message.controller.ts
var upsertActivityLog, sendMessage, streamMessage, getMessages, deleteMessage;
var init_message_controller = __esm({
  "src/controllers/message.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    init_ai_router_service();
    upsertActivityLog = async (userId) => {
      const progress = await db_default.progress.findUnique({ where: { userId } });
      if (!progress) return;
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      await db_default.activityLog.upsert({
        where: { progressId_date: { progressId: progress.id, date: today } },
        update: { activityCount: { increment: 1 } },
        create: { progressId: progress.id, date: today, activityCount: 1 }
      });
    };
    sendMessage = asyncHandler(async (req, res) => {
      const { chatId, content, provider, model, mode } = req.body;
      const userId = req.user.id;
      const chat = await db_default.chat.findFirst({ where: { id: chatId, userId } });
      if (!chat) throw new ApiError(404, "Chat not found");
      const userMsg = await db_default.message.create({
        data: { chatId, userId, role: "USER", content }
      });
      const history = await db_default.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
        take: 20,
        select: { role: true, content: true }
      });
      const selectedProvider = !provider || provider === "auto" ? process.env.DEFAULT_AI_PROVIDER || "GROQ" : provider;
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      if (!rawKey) {
        throw new ApiError(500, `API key for provider ${selectedProvider} is not configured on the server.`);
      }
      const messages = history.map((m) => ({
        role: m.role === "USER" ? "user" : "assistant",
        content: m.content
      }));
      const aiResult = await callAI({
        provider: selectedProvider,
        rawKey,
        model,
        messages,
        mode: mode || chat.mode
      });
      const assistantMsg = await db_default.message.create({
        data: {
          chatId,
          userId,
          role: "ASSISTANT",
          content: aiResult.content,
          provider: selectedProvider,
          model: aiResult.model,
          promptTokens: aiResult.tokens.prompt,
          completionTokens: aiResult.tokens.completion,
          totalTokens: aiResult.tokens.total
        }
      });
      let updatedTitle = chat.title;
      if (chat.title === "New Chat" || chat.title === "Untitled Chat") {
        try {
          const titlePrompt = `Based on the following first message in a conversation, generate a short, concise, and clean 3-5 word chat title that captures the core topic. Do not include quotes or surrounding punctuation.
Message: "${content}"`;
          const titleResult = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: titlePrompt }],
            mode: "FREE_CHAT"
          });
          const generatedTitle = titleResult.content.replace(/["']/g, "").trim();
          if (generatedTitle && generatedTitle.length > 2) {
            updatedTitle = generatedTitle;
          }
        } catch (err) {
          console.error("Failed to generate AI chat title, falling back:", err.message);
          updatedTitle = content.slice(0, 40) + "...";
        }
      }
      await db_default.chat.update({
        where: { id: chatId },
        data: {
          messageCount: { increment: 2 },
          lastMessage: aiResult.content.slice(0, 100),
          lastMessageAt: /* @__PURE__ */ new Date(),
          title: updatedTitle
        }
      });
      await db_default.user.update({
        where: { id: userId },
        data: { totalMessages: { increment: 2 }, lastActiveDate: /* @__PURE__ */ new Date() }
      });
      await upsertActivityLog(userId);
      return res.status(200).json(ApiResponse.success({
        userMessage: userMsg,
        assistantMessage: assistantMsg,
        usage: aiResult.tokens
      }));
    });
    streamMessage = asyncHandler(async (req, res) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      const { chatId, content, provider, model, mode } = req.body;
      const userId = req.user.id;
      try {
        const selectedProvider = !provider || provider === "auto" ? process.env.DEFAULT_AI_PROVIDER || "GROQ" : provider;
        const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
        if (!rawKey) {
          res.write(`data: ${JSON.stringify({ error: `API key for provider ${selectedProvider} is not configured on the server.` })}

`);
          return res.end();
        }
        const history = await db_default.message.findMany({
          where: { chatId },
          orderBy: { createdAt: "asc" },
          take: 20,
          select: { role: true, content: true }
        });
        const messages = history.map((m) => ({
          role: m.role === "USER" ? "user" : "assistant",
          content: m.content
        }));
        const aiResult = await callAI({ provider: selectedProvider, rawKey, model, messages, mode: mode || "FREE_CHAT" });
        const chunks = aiResult.content.match(/.{1,50}/g) || [aiResult.content];
        for (const chunk of chunks) {
          res.write(`data: ${JSON.stringify({ chunk, done: false })}

`);
        }
        await db_default.message.create({ data: { chatId, userId, role: "USER", content } });
        await db_default.message.create({
          data: {
            chatId,
            userId,
            role: "ASSISTANT",
            content: aiResult.content,
            provider: selectedProvider,
            model: aiResult.model
          }
        });
        res.write(`data: ${JSON.stringify({ done: true })}

`);
        res.end();
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}

`);
        res.end();
      }
    });
    getMessages = asyncHandler(async (req, res) => {
      const { chatId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const chat = await db_default.chat.findFirst({ where: { id: chatId, userId: req.user.id } });
      if (!chat) throw new ApiError(404, "Chat not found");
      const messages = await db_default.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { compareResponses: true }
      });
      return res.json(ApiResponse.success(messages));
    });
    deleteMessage = asyncHandler(async (req, res) => {
      await db_default.message.delete({ where: { id: req.params.id } });
      return res.json(ApiResponse.success(null, "Message deleted"));
    });
  }
});

// src/routes/message.routes.ts
import { Router as Router4 } from "express";
var router4, message_routes_default;
var init_message_routes = __esm({
  "src/routes/message.routes.ts"() {
    init_message_controller();
    init_auth_middleware();
    init_rateLimit_middleware();
    init_validate_middleware();
    init_chat_schema();
    router4 = Router4();
    router4.use(authenticate);
    router4.post("/send", aiLimiter, validate(sendMessageSchema), sendMessage);
    router4.post("/stream", aiLimiter, streamMessage);
    router4.get("/:chatId", getMessages);
    router4.delete("/:id", deleteMessage);
    message_routes_default = router4;
  }
});

// src/services/encryption.service.ts
import CryptoJS from "crypto-js";
var KEY, IV, encrypt, decrypt, keyPreview;
var init_encryption_service = __esm({
  "src/services/encryption.service.ts"() {
    KEY = CryptoJS.enc.Utf8.parse(process.env.ENCRYPTION_KEY || "bodhai_default_key_32chars_here!");
    IV = CryptoJS.enc.Utf8.parse(process.env.ENCRYPTION_IV || "bodhai_iv_16char");
    encrypt = (plain) => {
      return CryptoJS.AES.encrypt(plain, KEY, {
        iv: IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
    };
    decrypt = (encrypted) => {
      const bytes = CryptoJS.AES.decrypt(encrypted, KEY, {
        iv: IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return bytes.toString(CryptoJS.enc.Utf8);
    };
    keyPreview = (plain) => {
      if (plain.length < 10) return "****";
      return plain.slice(0, 6) + "..." + plain.slice(-4);
    };
  }
});

// src/validations/apikey.schema.ts
import { z as z4 } from "zod";
var addKeySchema, updateKeySchema, routingSchema;
var init_apikey_schema = __esm({
  "src/validations/apikey.schema.ts"() {
    addKeySchema = z4.object({
      provider: z4.enum(["OPENAI", "ANTHROPIC", "GEMINI", "MISTRAL", "GROQ", "TOGETHER", "COHERE", "CUSTOM"]),
      apiKey: z4.string().min(10, "API key is too short"),
      label: z4.string().optional(),
      customEndpoint: z4.string().url().optional(),
      customModel: z4.string().optional()
    });
    updateKeySchema = z4.object({
      label: z4.string().optional(),
      isActive: z4.boolean().optional(),
      customEndpoint: z4.string().url().optional(),
      customModel: z4.string().optional()
    });
    routingSchema = z4.object({
      routeLearning: z4.string().optional(),
      routeCode: z4.string().optional(),
      routeRoadmap: z4.string().optional(),
      routePlanner: z4.string().optional(),
      routeProject: z4.string().optional()
    });
  }
});

// src/controllers/apikey.controller.ts
var testProviderKey, addApiKey, getApiKeys, updateApiKey, setPrimaryApiKey, configureRouting, deleteApiKey, revokeAllApiKeys, getUsageStats, testApiKey;
var init_apikey_controller = __esm({
  "src/controllers/apikey.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    init_encryption_service();
    init_apikey_schema();
    testProviderKey = async (provider, rawKey, customEndpoint) => {
      try {
        switch (provider) {
          case "OPENAI": {
            const { OpenAI } = await import("openai");
            const client = new OpenAI({ apiKey: rawKey });
            await client.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: "Hi" }],
              max_tokens: 1
            });
            return true;
          }
          case "ANTHROPIC": {
            const Anthropic = await import("@anthropic-ai/sdk");
            const client = new Anthropic.default({ apiKey: rawKey });
            await client.messages.create({
              model: "claude-3-haiku-20240307",
              max_tokens: 1,
              messages: [{ role: "user", content: "Hi" }]
            });
            return true;
          }
          case "GEMINI": {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(rawKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            await model.generateContent("Hi");
            return true;
          }
          case "COHERE": {
            const { CohereClientV2 } = await import("cohere-ai");
            const client = new CohereClientV2({ token: rawKey });
            await client.chat({
              model: "command-r-plus-08-2024",
              messages: [{ role: "user", content: "Hi" }],
              maxTokens: 1
            });
            return true;
          }
          case "GROQ": {
            const Groq = await import("groq-sdk");
            const client = new Groq.default({ apiKey: rawKey });
            await client.chat.completions.create({
              model: "llama3-8b-8192",
              messages: [{ role: "user", content: "Hi" }],
              max_tokens: 1
            });
            return true;
          }
          default:
            return true;
        }
      } catch (err) {
        return false;
      }
    };
    addApiKey = asyncHandler(async (req, res) => {
      const { provider, apiKey, label, customEndpoint, customModel } = addKeySchema.parse(req.body);
      const userId = req.user.id;
      const isValid = await testProviderKey(provider, apiKey, customEndpoint);
      if (!isValid) {
        throw new ApiError(400, "Invalid API key. Please check and try again.");
      }
      const encryptedKey = encrypt(apiKey);
      const preview = keyPreview(apiKey);
      const existingCount = await db_default.apiKey.count({ where: { userId } });
      const isPrimary = existingCount === 0;
      const key = await db_default.apiKey.create({
        data: {
          userId,
          provider,
          encryptedKey,
          keyPreview: preview,
          label,
          isPrimary,
          customEndpoint,
          customModel
        },
        select: {
          id: true,
          provider: true,
          keyPreview: true,
          isActive: true,
          isPrimary: true,
          label: true,
          totalTokens: true,
          totalRequests: true,
          estimatedCost: true
        }
      });
      return res.status(201).json(ApiResponse.success(key, "API key added successfully"));
    });
    getApiKeys = asyncHandler(async (req, res) => {
      const keys = await db_default.apiKey.findMany({
        where: { userId: req.user.id },
        select: {
          id: true,
          provider: true,
          keyPreview: true,
          isActive: true,
          isPrimary: true,
          label: true,
          totalTokens: true,
          totalRequests: true,
          estimatedCost: true,
          customEndpoint: true,
          customModel: true,
          routeLearning: true,
          routeCode: true,
          routeRoadmap: true,
          routePlanner: true,
          routeProject: true,
          createdAt: true
        }
      });
      return res.json(ApiResponse.success(keys));
    });
    updateApiKey = asyncHandler(async (req, res) => {
      const { label, isActive, customEndpoint, customModel } = updateKeySchema.parse(req.body);
      const key = await db_default.apiKey.update({
        where: { id: req.params.id, userId: req.user.id },
        data: {
          ...label !== void 0 && { label },
          ...isActive !== void 0 && { isActive },
          ...customEndpoint !== void 0 && { customEndpoint },
          ...customModel !== void 0 && { customModel }
        }
      });
      return res.json(ApiResponse.success(key, "API key updated"));
    });
    setPrimaryApiKey = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const keyId = req.params.id;
      await db_default.apiKey.updateMany({
        where: { userId },
        data: { isPrimary: false }
      });
      const updated = await db_default.apiKey.update({
        where: { id: keyId, userId },
        data: { isPrimary: true }
      });
      return res.json(ApiResponse.success(updated, "Set primary API key successfully"));
    });
    configureRouting = asyncHandler(async (req, res) => {
      const { routeLearning, routeCode, routeRoadmap, routePlanner, routeProject } = routingSchema.parse(req.body);
      const updated = await db_default.apiKey.update({
        where: { id: req.params.id, userId: req.user.id },
        data: {
          ...routeLearning !== void 0 && { routeLearning },
          ...routeCode !== void 0 && { routeCode },
          ...routeRoadmap !== void 0 && { routeRoadmap },
          ...routePlanner !== void 0 && { routePlanner },
          ...routeProject !== void 0 && { routeProject }
        }
      });
      return res.json(ApiResponse.success(updated, "Key routing updated"));
    });
    deleteApiKey = asyncHandler(async (req, res) => {
      await db_default.apiKey.delete({
        where: { id: req.params.id, userId: req.user.id }
      });
      return res.json(ApiResponse.success(null, "API key deleted"));
    });
    revokeAllApiKeys = asyncHandler(async (req, res) => {
      await db_default.apiKey.deleteMany({
        where: { userId: req.user.id }
      });
      return res.json(ApiResponse.success(null, "All API keys revoked"));
    });
    getUsageStats = asyncHandler(async (req, res) => {
      const stats = await db_default.apiKey.aggregate({
        where: { userId: req.user.id },
        _sum: {
          totalRequests: true,
          estimatedCost: true
        }
      });
      return res.json(ApiResponse.success({
        totalRequests: stats._sum.totalRequests || 0,
        estimatedCost: stats._sum.estimatedCost || 0
      }));
    });
    testApiKey = asyncHandler(async (req, res) => {
      const key = await db_default.apiKey.findFirst({
        where: { id: req.params.id, userId: req.user.id }
      });
      if (!key) throw new ApiError(404, "API key not found");
      const rawKey = decrypt(key.encryptedKey);
      const isValid = await testProviderKey(key.provider, rawKey, key.customEndpoint || void 0);
      if (!isValid) {
        return res.json(ApiResponse.success({ valid: false }, "API key is invalid"));
      }
      return res.json(ApiResponse.success({ valid: true }, "API key is valid and connected"));
    });
  }
});

// src/routes/apikey.routes.ts
import { Router as Router5 } from "express";
var router5, apikey_routes_default;
var init_apikey_routes = __esm({
  "src/routes/apikey.routes.ts"() {
    init_apikey_controller();
    init_auth_middleware();
    init_validate_middleware();
    init_apikey_schema();
    router5 = Router5();
    router5.use(authenticate);
    router5.get("/", getApiKeys);
    router5.post("/", validate(addKeySchema), addApiKey);
    router5.get("/usage", getUsageStats);
    router5.put("/:id", validate(updateKeySchema), updateApiKey);
    router5.put("/:id/primary", setPrimaryApiKey);
    router5.put("/:id/routing", validate(routingSchema), configureRouting);
    router5.delete("/:id", deleteApiKey);
    router5.delete("/revoke-all", revokeAllApiKeys);
    router5.post("/test/:id", testApiKey);
    apikey_routes_default = router5;
  }
});

// src/controllers/roadmap.controller.ts
var getRoadmap, suggestFocusAreas, generateRoadmap, updateMilestone, reoptimizeRoadmap, startMilestonePractice, validateMilestoneProject;
var init_roadmap_controller = __esm({
  "src/controllers/roadmap.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    init_ai_router_service();
    init_encryption_service();
    init_logger();
    getRoadmap = asyncHandler(async (req, res) => {
      const roadmap = await db_default.roadmap.findFirst({
        where: { userId: req.user.id, isActive: true },
        include: {
          milestones: {
            orderBy: { order: "asc" }
          }
        }
      });
      return res.json(ApiResponse.success(roadmap));
    });
    suggestFocusAreas = asyncHandler(async (req, res) => {
      const { topic } = req.query;
      if (!topic || typeof topic !== "string") {
        return res.json(ApiResponse.success([]));
      }
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let focusAreas = [];
      if (rawKey) {
        try {
          const prompt = `Provide a list of 4-6 key focus areas or subtopics to learn for the topic: "${topic}".
Output exactly a JSON array of strings. For example: ["Hooks & State Management", "Routing", "Next.js"].
Do not include markdown code block syntax. Only return JSON.`;
          const aiResult = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: prompt }],
            mode: "ROADMAP_BUILDER"
          });
          const cleanJson = aiResult.content.replace(/```json/g, "").replace(/```/g, "").trim();
          focusAreas = JSON.parse(cleanJson);
        } catch (err) {
          console.error("Failed to suggest focus areas via AI:", err);
        }
      }
      if (!Array.isArray(focusAreas) || focusAreas.length === 0) {
        const t = topic.toLowerCase();
        if (t.includes("react")) {
          focusAreas = ["Hooks & State Management", "Routing & Navigation", "Performance Optimization", "Testing React Apps", "Next.js & SSR"];
        } else if (t.includes("machine") || t.includes("ml") || t.includes("learning")) {
          focusAreas = ["Math & Statistics", "Supervised Learning", "Neural Networks & Deep Learning", "Model Evaluation & Tuning", "Deployment & MLOps"];
        } else if (t.includes("cyber") || t.includes("security")) {
          focusAreas = ["Network Security", "Cryptography", "Penetration Testing", "Incident Response", "Compliance & Risk"];
        } else {
          focusAreas = ["Foundational Concepts", "Core Implementations", "Advanced Techniques", "Project Deployment", "Testing & Maintenance"];
        }
      }
      return res.json(ApiResponse.success(focusAreas));
    });
    generateRoadmap = asyncHandler(async (req, res) => {
      const { goal, title, level, estimatedWeeks, focusAreas } = req.body;
      const userId = req.user.id;
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let generatedMilestones = [];
      const targetTopic = title || goal || "AI/ML";
      if (rawKey) {
        const prompt = `Design a step-by-step learning path / roadmap for the goal: "${targetTopic}". 
Level: ${level || "intermediate"}.
Estimated duration: ${estimatedWeeks || 8} weeks.
Focused sub-areas to include: ${focusAreas && focusAreas.length > 0 ? focusAreas.join(", ") : "general curriculum"}.

Output exactly a JSON array of milestones. Each milestone object must have:
- title: string
- description: string
- estimatedHours: number
- order: number (starting at 1)
- tags: array of strings
- currentModule: string (brief description of module 1 content)
- resources: array of strings (e.g. ['MDN Web Docs', 'React Documentation'])
- skillsGained: array of strings (e.g. ['State management', 'Component lifecycles'])

Only return JSON. Do not include markdown code block syntax.`;
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts && generatedMilestones.length === 0) {
          attempts++;
          try {
            const aiResult = await callAI({
              provider: selectedProvider,
              rawKey,
              messages: [{ role: "user", content: prompt }],
              mode: "ROADMAP_BUILDER"
            });
            const cleanJson = aiResult.content.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              generatedMilestones = parsed;
            }
          } catch (err) {
            console.error(`AI generate attempt ${attempts} failed:`, err.message);
          }
        }
      }
      if (generatedMilestones.length === 0) {
        generatedMilestones = [
          {
            title: "Foundations of " + targetTopic,
            description: "Learn the fundamental mathematical and algorithmic structures necessary for this domain.",
            estimatedHours: 12,
            order: 1,
            tags: ["Foundations", "Core Concepts"],
            currentModule: "Introduction to Core Terminology and Basics",
            resources: ["W3Schools Guide", "Official Setup Documentation"],
            skillsGained: ["Environment setup", "Basic configuration"]
          },
          {
            title: "Core Implementation & Practices",
            description: "Dive deep into practical development workflows, tooling, and framework setups.",
            estimatedHours: 18,
            order: 2,
            tags: ["Practical", "Workflows"],
            currentModule: "Building your first application module",
            resources: ["MDN Guides", "GitHub Best Practices"],
            skillsGained: ["Module design", "Source control integration"]
          },
          {
            title: "Advanced Domain Architecture",
            description: "Build production-grade applications deploying best patterns and performance profiles.",
            estimatedHours: 24,
            order: 3,
            tags: ["Architecture", "Optimization"],
            currentModule: "Configuring CI/CD pipelines and deployment parameters",
            resources: ["Google Developers Path", "Production Best Practices Guide"],
            skillsGained: ["CI/CD workflow setup", "Deployment engineering"]
          }
        ];
      }
      await db_default.roadmap.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      });
      const roadmap = await db_default.roadmap.create({
        data: {
          userId,
          title: targetTopic,
          description: `Structured roadmap generated for ${goal || targetTopic}.`,
          goal: goal || targetTopic,
          estimatedWeeks: estimatedWeeks || 8,
          isAIGenerated: !!rawKey,
          isActive: true,
          milestones: {
            create: generatedMilestones.map((m, idx) => ({
              title: m.title,
              description: m.description,
              status: idx === 0 ? "IN_PROGRESS" : "LOCKED",
              estimatedHours: m.estimatedHours || 10,
              tags: m.tags || [],
              resources: m.resources || [],
              skillsGained: m.skillsGained || [],
              order: m.order || idx + 1,
              currentModule: m.currentModule || ""
            }))
          }
        },
        include: {
          milestones: {
            orderBy: { order: "asc" }
          }
        }
      });
      return res.status(201).json(ApiResponse.success(roadmap, "Roadmap generated successfully"));
    });
    updateMilestone = asyncHandler(async (req, res) => {
      const { status, progress, actualHours, completedAt } = req.body;
      const milestoneId = req.params.id;
      const milestone = await db_default.roadmapMilestone.findFirst({
        where: { id: milestoneId },
        include: { roadmap: true }
      });
      if (!milestone || milestone.roadmap.userId !== req.user.id) {
        throw new ApiError(404, "Milestone not found");
      }
      const updatedMilestone = await db_default.roadmapMilestone.update({
        where: { id: milestoneId },
        data: {
          ...status && { status },
          ...progress !== void 0 && { progress: parseFloat(progress) },
          ...actualHours !== void 0 && { actualHours: parseFloat(actualHours) },
          ...completedAt !== void 0 && { completedAt: completedAt ? new Date(completedAt) : null },
          ...status === "COMPLETED" && { progress: 100, completedAt: /* @__PURE__ */ new Date() }
        }
      });
      if (status === "COMPLETED") {
        const nextMilestone = await db_default.roadmapMilestone.findFirst({
          where: {
            roadmapId: milestone.roadmapId,
            order: milestone.order + 1
          }
        });
        if (nextMilestone && (nextMilestone.status === "LOCKED" || nextMilestone.status === "UPCOMING")) {
          await db_default.roadmapMilestone.update({
            where: { id: nextMilestone.id },
            data: { status: "IN_PROGRESS" }
          });
        }
      }
      const allMilestones = await db_default.roadmapMilestone.findMany({
        where: { roadmapId: milestone.roadmapId }
      });
      const completedCount = allMilestones.filter((m) => m.status === "COMPLETED").length;
      const overallProgress = completedCount / allMilestones.length * 100;
      await db_default.roadmap.update({
        where: { id: milestone.roadmapId },
        data: { overallProgress }
      });
      if (status === "COMPLETED") {
        const allCompleted = allMilestones.every(
          (m) => m.status === "COMPLETED" || m.id === milestoneId
        );
        if (allCompleted) {
          const roadmap = await db_default.roadmap.findUnique({
            where: { id: milestone.roadmapId }
          });
          if (roadmap) {
            const projectName = `${roadmap.title} \u2014 Capstone Project`;
            const existingCapstone = await db_default.project.findFirst({
              where: { userId: req.user.id, name: projectName }
            });
            if (!existingCapstone) {
              const allSkills = [];
              allMilestones.forEach((m) => {
                if (Array.isArray(m.skillsGained)) {
                  m.skillsGained.forEach((s) => {
                    if (!allSkills.includes(s)) allSkills.push(s);
                  });
                }
              });
              await db_default.project.create({
                data: {
                  userId: req.user.id,
                  name: projectName,
                  description: `Capstone project for your completed "${roadmap.title}" learning roadmap. Apply all the skills you have mastered into one final end-to-end product.`,
                  priority: "HIGH",
                  techStack: allSkills.slice(0, 12),
                  // cap at 12 tags
                  progressLabel: `Auto-created from roadmap: ${roadmap.title}`,
                  progress: 0,
                  sprints: {
                    create: [
                      {
                        name: "Sprint 1: Architecture & Planning",
                        status: "IN_PROGRESS",
                        tasks: [
                          "Review all milestone learnings",
                          "Define project scope and features",
                          "Set up repository and project structure"
                        ]
                      },
                      {
                        name: "Sprint 2: Core Implementation",
                        status: "PLANNED",
                        tasks: [
                          "Build core feature modules",
                          "Integrate backend and frontend",
                          "Implement authentication and data layer"
                        ]
                      },
                      {
                        name: "Sprint 3: Polish & Deploy",
                        status: "PLANNED",
                        tasks: [
                          "Write unit and integration tests",
                          "Optimize performance and UX",
                          "Deploy to production"
                        ]
                      }
                    ]
                  }
                }
              });
              await db_default.user.update({
                where: { id: req.user.id },
                data: { projectsBuilt: { increment: 1 } }
              });
            }
          }
        }
      }
      return res.json(ApiResponse.success(updatedMilestone, "Milestone updated successfully"));
    });
    reoptimizeRoadmap = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const roadmap = await db_default.roadmap.findFirst({
        where: { userId, isActive: true },
        include: { milestones: { orderBy: { order: "asc" } } }
      });
      if (!roadmap) throw new ApiError(404, "No active roadmap found to reoptimize");
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      if (rawKey) {
        try {
          const completedMilestones = roadmap.milestones.filter((m) => m.status === "COMPLETED");
          const incompleteMilestones = roadmap.milestones.filter((m) => m.status !== "COMPLETED");
          const prompt = `The student is learning: "${roadmap.title}".
They have completed: ${completedMilestones.map((m) => m.title).join(", ") || "no milestones yet"}.
The remaining milestones are: ${incompleteMilestones.map((m) => m.title).join(", ")}.

Re-optimize the remaining milestones to adjust for current progress. Keep the same number of milestones (${incompleteMilestones.length}).
Return exactly a JSON array of the remaining milestones with updated titles, descriptions, and estimatedHours.
Example: [{"title": "React Hooks Deep Dive", "description": "Learn custom hooks...", "estimatedHours": 10}]
Only return JSON. Do not include markdown code block syntax.`;
          const aiResult = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: prompt }],
            mode: "ROADMAP_BUILDER"
          });
          const cleanJson = aiResult.content.replace(/```json/g, "").replace(/```/g, "").trim();
          const updated = JSON.parse(cleanJson);
          if (Array.isArray(updated) && updated.length > 0) {
            for (let i = 0; i < Math.min(incompleteMilestones.length, updated.length); i++) {
              const original = incompleteMilestones[i];
              const updateData = updated[i];
              await db_default.roadmapMilestone.update({
                where: { id: original.id },
                data: {
                  title: updateData.title || original.title,
                  description: updateData.description || original.description,
                  estimatedHours: updateData.estimatedHours || original.estimatedHours,
                  tags: updateData.tags || original.tags,
                  resources: updateData.resources || original.resources,
                  skillsGained: updateData.skillsGained || original.skillsGained
                }
              });
            }
          }
        } catch (err) {
          console.error("Reoptimization AI call failed, falling back:", err);
        }
      }
      const lockedMilestones = roadmap.milestones.filter((m) => m.status === "LOCKED");
      if (lockedMilestones.length > 0) {
        await db_default.roadmapMilestone.update({
          where: { id: lockedMilestones[0].id },
          data: { status: "IN_PROGRESS" }
        });
      }
      const reoptimized = await db_default.roadmap.findFirst({
        where: { id: roadmap.id },
        include: { milestones: { orderBy: { order: "asc" } } }
      });
      return res.json(ApiResponse.success(reoptimized, "Roadmap reoptimized based on your progress"));
    });
    startMilestonePractice = asyncHandler(
      async (req, res) => {
        const milestoneId = req.params.id;
        const userId = req.user.id;
        const milestone = await db_default.roadmapMilestone.findFirst({
          where: { id: milestoneId },
          include: { roadmap: true }
        });
        if (!milestone || milestone.roadmap.userId !== userId) {
          throw new ApiError(
            404,
            "Milestone not found"
          );
        }
        const user = await db_default.user.findUnique({
          where: { id: userId },
          select: {
            firstName: true,
            level: true,
            language: true
          }
        });
        const chat = await db_default.chat.create({
          data: {
            userId,
            title: `Practice: ${milestone.title}`,
            mode: "LEARNING",
            milestoneId: milestone.id
          }
        });
        const userApiKey = await db_default.apiKey.findFirst({
          where: { userId, isPrimary: true, isActive: true }
        });
        let selectedProvider;
        let rawKey;
        if (userApiKey) {
          selectedProvider = userApiKey.provider;
          rawKey = decrypt(userApiKey.encryptedKey);
        } else {
          selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
          rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
        }
        if (!rawKey) {
          return res.status(201).json(
            ApiResponse.success({
              chatId: chat.id,
              aiIntroMessage: null,
              noApiKey: true
            })
          );
        }
        const introPrompt = `
You are starting a learning session with ${user?.firstName || "a student"} about:

TOPIC: "${milestone.title}"
DESCRIPTION: "${milestone.description}"
TAGS/SUBTOPICS: ${milestone.tags.join(", ")}
STUDENT LEVEL: ${user?.level || "Intermediate"}
RESOURCES TO COVER: ${milestone.resources?.join(", ") || "Core concepts and practical application"}

Write your OPENING MESSAGE for this learning session. Structure it EXACTLY like this:

1. A warm, engaging introduction to "${milestone.title}" (2-3 sentences that spark curiosity)

2. "Here's what we'll cover in this session:"
   Then list 4-6 specific subtopics as a numbered list. Make each one specific and concrete, not generic.

3. A brief explanation of why this topic matters (1-2 sentences, real-world context)

4. End with EXACTLY this question format:
   "Where would you like to start?"
   Then give 3-4 numbered options matching your subtopics list above.
   Example:
   1\uFE0F\u20E3 [First subtopic] - [1 line description]
   2\uFE0F\u20E3 [Second subtopic] - [1 line description]
   3\uFE0F\u20E3 [Third subtopic] - [1 line description]
   4\uFE0F\u20E3 Start from the very beginning

Keep total length: 150-200 words maximum.
Be encouraging and conversational.
Use markdown for formatting.`;
        let introContent = "";
        let usedProvider = selectedProvider;
        let usedModel = "system-fallback";
        try {
          const result = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{
              role: "user",
              content: introPrompt
            }],
            mode: "LEARNING"
          });
          introContent = result.content;
          usedModel = result.model || "system-fallback";
        } catch (aiError) {
          logger.warn("AI Intro generation failed, using local template fallback:", aiError.message || aiError);
          const tagList = milestone.tags && milestone.tags.length > 0 ? milestone.tags.map((t, idx) => `${idx + 1}. ${t}`).join("\n") : `1. Core concepts of ${milestone.title}
2. Real-world application
3. Practical exercise`;
          const optionsList = milestone.tags && milestone.tags.length > 0 ? milestone.tags.slice(0, 3).map((t, idx) => `${idx + 1}\uFE0F\u20E3 Learn about ${t}`).join("\n") + `
${Math.min(milestone.tags.length, 3) + 1}\uFE0F\u20E3 Start from the very beginning` : `1\uFE0F\u20E3 Theoretical concepts
2\uFE0F\u20E3 Practical exercise
3\uFE0F\u20E3 Start from the very beginning`;
          introContent = `### Introduction to ${milestone.title}

${milestone.description || `Welcome to the practice session for **${milestone.title}**! Let's dive deep and master this topic together.`}

Here's what we'll cover in this session:
${tagList}

This topic matters because mastering these concepts is essential to building modern, robust, and user-friendly software applications.

Where would you like to start?
${optionsList}`;
          usedProvider = "SYSTEM";
        }
        const aiMessage = await db_default.message.create({
          data: {
            chatId: chat.id,
            userId,
            role: "ASSISTANT",
            content: introContent,
            provider: usedProvider,
            model: usedModel
          }
        });
        await db_default.chat.update({
          where: { id: chat.id },
          data: {
            lastMessage: introContent.slice(0, 100),
            lastMessageAt: /* @__PURE__ */ new Date(),
            messageCount: 1
          }
        });
        return res.status(201).json(
          ApiResponse.success({
            chatId: chat.id,
            aiIntroMessage: aiMessage,
            milestone: {
              id: milestone.id,
              title: milestone.title,
              tags: milestone.tags
            }
          })
        );
      }
    );
    validateMilestoneProject = asyncHandler(async (req, res) => {
      const milestoneId = req.params.id;
      const userId = req.user.id;
      const file = req.file;
      if (!file) throw new ApiError(400, "No file was uploaded");
      const milestone = await db_default.roadmapMilestone.findFirst({
        where: { id: milestoneId },
        include: { roadmap: true }
      });
      if (!milestone || milestone.roadmap.userId !== userId) {
        throw new ApiError(404, "Milestone not found");
      }
      const isText = /\.(ts|tsx|js|jsx|json|prisma|py|md|txt|yaml|yml|html|css|sql|sh|go|java)$/i.test(file.originalname);
      const fileContent = isText ? file.buffer.toString("utf-8").slice(0, 6e3) : `[Binary file: ${file.originalname}, ${(file.size / 1024).toFixed(1)} KB]`;
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let score = 0;
      let feedbackObj = {};
      let passed = false;
      if (rawKey) {
        const prompt = `You are an AI project evaluator. A student submitted a file for their milestone.

MILESTONE: "${milestone.title}"
DESCRIPTION: "${milestone.description}"
SKILLS TO DEMONSTRATE: ${milestone.skillsGained.join(", ") || "general programming"}
TAGS: ${milestone.tags.join(", ")}

FILE: ${file.originalname}
CONTENT:
\`\`\`
${fileContent}
\`\`\`

Evaluate whether the file meaningfully demonstrates the milestone's skills. Be fair but strict.

Respond ONLY with valid JSON \u2014 no markdown, no extra text:
{
  "score": <0-100>,
  "passed": <boolean, true if score >= 60>,
  "summary": "<1 sentence verdict>",
  "strengths": ["<point>"],
  "improvements": ["<point>"]
}`;
        try {
          const result = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: prompt }],
            mode: "FREE_CHAT"
          });
          const clean = result.content.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(clean);
          score = Math.min(100, Math.max(0, Number(parsed.score) || 0));
          passed = parsed.passed === true || score >= 60;
          feedbackObj = { summary: parsed.summary || "", strengths: parsed.strengths || [], improvements: parsed.improvements || [] };
        } catch {
          score = 65;
          passed = true;
          feedbackObj = { summary: "File received. Good attempt!", strengths: ["Submitted file present"], improvements: [] };
        }
      } else {
        score = 70;
        passed = true;
        feedbackObj = { summary: "Accepted. Add an AI key for detailed feedback.", strengths: ["Submission received"], improvements: [] };
      }
      if (passed) {
        await db_default.roadmapMilestone.update({
          where: { id: milestoneId },
          data: { status: "COMPLETED", progress: 100, completedAt: /* @__PURE__ */ new Date() }
        });
        const nextMilestone = await db_default.roadmapMilestone.findFirst({
          where: { roadmapId: milestone.roadmapId, order: milestone.order + 1 }
        });
        if (nextMilestone && ["LOCKED", "UPCOMING"].includes(nextMilestone.status)) {
          await db_default.roadmapMilestone.update({ where: { id: nextMilestone.id }, data: { status: "IN_PROGRESS" } });
        }
        const allMilestones = await db_default.roadmapMilestone.findMany({ where: { roadmapId: milestone.roadmapId } });
        const completedCount = allMilestones.filter((m) => m.status === "COMPLETED").length;
        await db_default.roadmap.update({
          where: { id: milestone.roadmapId },
          data: { overallProgress: completedCount / allMilestones.length * 100 }
        });
        if (!nextMilestone) {
          const roadmap = await db_default.roadmap.findUnique({ where: { id: milestone.roadmapId } });
          if (roadmap) {
            const projectName = `${roadmap.title} \u2014 Capstone Project`;
            const existing = await db_default.project.findFirst({ where: { userId, name: projectName } });
            if (!existing) {
              const allSkills = [];
              allMilestones.forEach((m) => {
                m.skillsGained.forEach((s) => {
                  if (!allSkills.includes(s)) allSkills.push(s);
                });
              });
              await db_default.project.create({
                data: {
                  userId,
                  name: projectName,
                  priority: "HIGH",
                  description: `Capstone project for your completed "${roadmap.title}" learning roadmap.`,
                  techStack: allSkills.slice(0, 12),
                  progressLabel: `Auto-created from roadmap: ${roadmap.title}`,
                  progress: 0,
                  sprints: {
                    create: [
                      { name: "Sprint 1: Architecture & Planning", status: "IN_PROGRESS", tasks: ["Review all milestone learnings", "Define project scope", "Set up repository"] },
                      { name: "Sprint 2: Core Implementation", status: "PLANNED", tasks: ["Build core features", "Integrate layers", "Implement data models"] },
                      { name: "Sprint 3: Polish & Deploy", status: "PLANNED", tasks: ["Write tests", "Optimize UX", "Deploy"] }
                    ]
                  }
                }
              });
              await db_default.user.update({ where: { id: userId }, data: { projectsBuilt: { increment: 1 } } });
            }
          }
        }
      }
      return res.json(ApiResponse.success({
        passed,
        score,
        feedback: feedbackObj,
        milestoneCompleted: passed
      }, passed ? "Milestone validated and marked complete!" : "Keep going \u2014 see improvement tips below."));
    });
  }
});

// src/routes/roadmap.routes.ts
import { Router as Router6 } from "express";
import multer2 from "multer";
var upload2, router6, roadmap_routes_default;
var init_roadmap_routes = __esm({
  "src/routes/roadmap.routes.ts"() {
    init_roadmap_controller();
    init_auth_middleware();
    upload2 = multer2({ storage: multer2.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
    router6 = Router6();
    router6.use(authenticate);
    router6.get("/", getRoadmap);
    router6.get("/suggest-focus", suggestFocusAreas);
    router6.post("/generate", generateRoadmap);
    router6.put("/milestone/:id", updateMilestone);
    router6.post("/reoptimize", reoptimizeRoadmap);
    router6.post("/milestone/:id/practice", startMilestonePractice);
    router6.post("/milestone/:id/validate-project", upload2.single("file"), validateMilestoneProject);
    roadmap_routes_default = router6;
  }
});

// src/services/socket.service.ts
import { Server as SocketIOServer } from "socket.io";
import jwt4 from "jsonwebtoken";
var io, getIO;
var init_socket_service = __esm({
  "src/services/socket.service.ts"() {
    init_db();
    init_logger();
    io = null;
    getIO = () => {
      if (!io) {
        throw new Error("Socket.io not initialized");
      }
      return io;
    };
  }
});

// src/controllers/project.controller.ts
var getProjects, createProject, getProject, updateProject, deleteProject, getProjectStats, generateProblemStatement, createStepByStepRoadmap, submitCompleteProject, uploadStepFile, getStepValidation;
var init_project_controller = __esm({
  "src/controllers/project.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    init_ai_router_service();
    init_socket_service();
    getProjects = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const [projects, total] = await Promise.all([
        db_default.project.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: { sprints: true }
        }),
        db_default.project.count({ where: { userId } })
      ]);
      return res.json(ApiResponse.success({
        projects,
        total,
        page,
        pages: Math.ceil(total / limit)
      }));
    });
    createProject = asyncHandler(async (req, res) => {
      const { name, description, priority, techStack, coverImage } = req.body;
      const userId = req.user.id;
      const project = await db_default.project.create({
        data: {
          userId,
          name,
          description,
          priority: priority || "MEDIUM",
          techStack: techStack || [],
          coverImage: coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop",
          progress: 0,
          progressLabel: "Planning Stage",
          sprints: {
            create: [
              { name: "Sprint 1: Architecture & Design", status: "IN_PROGRESS", tasks: ["Define tech stack details", "Draw layout diagrams", "Set up GitHub Repo"] },
              { name: "Sprint 2: Core Components", status: "PLANNED", tasks: ["Implement baseline routing", "Setup database schemas", "Create primary views"] }
            ]
          }
        },
        include: {
          sprints: true
        }
      });
      await db_default.user.update({
        where: { id: userId },
        data: { projectsBuilt: { increment: 1 } }
      });
      return res.status(201).json(ApiResponse.success(project, "Project workspace created"));
    });
    getProject = asyncHandler(async (req, res) => {
      const project = await db_default.project.findFirst({
        where: { id: req.params.id, userId: req.user.id },
        include: {
          sprints: true,
          steps: {
            orderBy: { order: "asc" }
          }
        }
      });
      if (!project) throw new ApiError(404, "Project workspace not found");
      return res.json(ApiResponse.success(project));
    });
    updateProject = asyncHandler(async (req, res) => {
      const { name, description, status, priority, techStack, progress, progressLabel, isStepByStep, hasSelectedMode } = req.body;
      const project = await db_default.project.update({
        where: { id: req.params.id, userId: req.user.id },
        data: {
          ...name && { name },
          ...description !== void 0 && { description },
          ...status && { status },
          ...priority && { priority },
          ...techStack && { techStack },
          ...progress !== void 0 && { progress },
          ...progressLabel !== void 0 && { progressLabel },
          ...isStepByStep !== void 0 && { isStepByStep },
          ...hasSelectedMode !== void 0 && { hasSelectedMode }
        },
        include: {
          sprints: true,
          steps: {
            orderBy: { order: "asc" }
          }
        }
      });
      return res.json(ApiResponse.success(project, "Project updated"));
    });
    deleteProject = asyncHandler(async (req, res) => {
      await db_default.project.deleteMany({
        where: { id: req.params.id, userId: req.user.id }
      });
      return res.json(ApiResponse.success(null, "Project deleted"));
    });
    getProjectStats = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const [totalCount, completedCount, inProgressCount] = await Promise.all([
        db_default.project.count({ where: { userId } }),
        db_default.project.count({ where: { userId, status: "COMPLETED" } }),
        db_default.project.count({ where: { userId, status: "IN_PROGRESS" } })
      ]);
      return res.json(ApiResponse.success({
        total: totalCount,
        completed: completedCount,
        inProgress: inProgressCount
      }));
    });
    generateProblemStatement = asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = req.user.id;
      const project = await db_default.project.findFirst({
        where: { id, userId }
      });
      if (!project) {
        throw new ApiError(404, "Project not found");
      }
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let problemStatement = "";
      if (rawKey) {
        try {
          const prompt = `Generate a realistic, comprehensive, and challenging problem statement for the following project:
Project Name: "${project.name}"
Description: "${project.description || ""}"
Tech Stack: ${project.techStack.join(", ")}

Structure the response nicely using markdown:
- **Title**: A professional title.
- **Background**: 2-3 sentences explaining the context.
- **The Challenge**: A clear explanation of what is being built and why.
- **Core Requirements**: 4-6 bullet points of functional requirements.
- **Technical Scope**: Details on stack application.
Only output the markdown content, no extra talk.`;
          const aiResult = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: prompt }],
            mode: "FREE_CHAT"
          });
          problemStatement = aiResult.content.trim();
        } catch (err) {
          console.error("Failed to generate problem statement via AI:", err.message);
        }
      }
      if (!problemStatement) {
        problemStatement = `### ${project.name}
**Background**: As software developers, we build projects to solve real-world problems.
**The Challenge**: Create a production-ready application for "${project.name}" using ${project.techStack.join(", ") || "modern web standards"}.
**Core Requirements**:
- Setup project framework and configure standard directory structure.
- Define datastore/models representing domain entities.
- Implement business logic via services and controller APIs.
- Build interactive user interfaces with optimized state management.
- Test components and verify system integrations.`;
      }
      const updatedProject = await db_default.project.update({
        where: { id },
        data: { problemStatement }
      });
      return res.json(ApiResponse.success(updatedProject));
    });
    createStepByStepRoadmap = asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = req.user.id;
      const project = await db_default.project.findFirst({
        where: { id, userId },
        include: { steps: { orderBy: { order: "asc" } } }
      });
      if (!project) {
        throw new ApiError(404, "Project not found");
      }
      await db_default.project.update({
        where: { id },
        data: { isStepByStep: true }
      });
      if (project.steps.length > 0) {
        return res.json(ApiResponse.success(project.steps));
      }
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let generatedSteps = [];
      if (rawKey) {
        try {
          const prompt = `Break down this project into a 4-6 step detailed step-by-step implementation plan:
Project Name: "${project.name}"
Description: "${project.description || ""}"
Tech Stack: ${project.techStack.join(", ")}

Output exactly a JSON array of objects. Do not include markdown code block syntax.
Each object must have the following keys:
- title: string
- description: string (detailed instructions on what to implement in this step)
- deliverable: string (what file or content the user must submit to pass, e.g. "database.ts containing Prisma schema config")
- expectedFileTypes: array of strings (e.g. ["ts", "js", "json", "prisma"])
- validationCriteria: array of strings (what the AI reviewer will check, e.g. ["Schema contains user model", "Includes indexes"])
- estimatedHours: number (estimated effort)
- hint: string (actionable hint or code snippet to help the student get started)

Example:
[
  {
    "title": "Database Schema Design",
    "description": "Create the Prisma schema file including User and Profile models.",
    "deliverable": "schema.prisma",
    "expectedFileTypes": ["prisma"],
    "validationCriteria": ["Contains User model", "Relations are properly set"],
    "estimatedHours": 3,
    "hint": "Ensure that the relations are properly set using @relation fields and foreign key mappings."
  }
]`;
          const aiResult = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: prompt }],
            mode: "FREE_CHAT"
          });
          const cleanJson = aiResult.content.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            generatedSteps = parsed;
          }
        } catch (err) {
          console.error("Failed to generate project steps via AI:", err.message);
        }
      }
      if (generatedSteps.length === 0) {
        generatedSteps = [
          {
            title: "Project Initialization & Structure Setup",
            description: "Initialize the codebase directory structure, package configuration, and repository layout.",
            deliverable: "package.json config showing basic setup details",
            expectedFileTypes: ["json", "txt"],
            validationCriteria: ["Includes name and main entrypoint", "Basic scripts are defined"],
            estimatedHours: 2,
            hint: "Use `npm init -y` or `pnpm init` to initialize the project and create a package.json file."
          },
          {
            title: "Backend Database and Schema Configuration",
            description: "Design and set up database models, migrations, and connections.",
            deliverable: "Database configuration or schema file",
            expectedFileTypes: ["prisma", "sql", "js", "ts"],
            validationCriteria: ["Correct relationships modeled", "Indexes configured for core queries"],
            estimatedHours: 4,
            hint: "Define your main database tables and schema using Prisma, SQL, or an ORM like Mongoose."
          },
          {
            title: "API Implementation & Route Handlers",
            description: "Write Express routes and controller functions for CRUD operations.",
            deliverable: "Router code file or controllers directory snapshot",
            expectedFileTypes: ["ts", "js"],
            validationCriteria: ["Authentication middleware used", "Validation schema is present"],
            estimatedHours: 6,
            hint: "Define express.Router() handlers and map them to specific HTTP verbs like GET, POST, PUT, DELETE."
          },
          {
            title: "Frontend Component Assembly & UI Integration",
            description: "Build React pages, layout structures, and wire up states to mock APIs.",
            deliverable: "App.tsx or Page component code",
            expectedFileTypes: ["tsx", "jsx", "css"],
            validationCriteria: ["Component handles loading states", "Includes clean styling"],
            estimatedHours: 8,
            hint: "Create clean functional React components and handle states using useState and useEffect."
          }
        ];
      }
      const createdSteps = await Promise.all(
        generatedSteps.map(
          (step, index) => db_default.projectStep.create({
            data: {
              projectId: project.id,
              order: index + 1,
              title: step.title,
              description: step.description,
              deliverable: step.deliverable,
              expectedFileTypes: step.expectedFileTypes || [],
              validationCriteria: step.validationCriteria || [],
              estimatedHours: step.estimatedHours || 4,
              hint: step.hint || "",
              status: index === 0 ? "IN_PROGRESS" : "PENDING"
            }
          })
        )
      );
      return res.status(201).json(ApiResponse.success(createdSteps));
    });
    submitCompleteProject = asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = req.user.id;
      const file = req.file;
      if (!file) {
        throw new ApiError(400, "Please upload your project file(s)");
      }
      const project = await db_default.project.findFirst({
        where: { id, userId }
      });
      if (!project) {
        throw new ApiError(404, "Project not found");
      }
      const fileContent = file.buffer.toString("utf-8");
      await db_default.project.update({
        where: { id },
        data: {
          status: "IN_REVIEW",
          submittedFileName: file.originalname,
          submittedAt: /* @__PURE__ */ new Date()
        }
      });
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let score = 85;
      let feedback = "Overall excellent structure and layout. The implementation matches all requirements.";
      let passed = true;
      if (rawKey) {
        try {
          const prompt = `Review this student's complete project submission:
Project: "${project.name}"
Description: "${project.description || ""}"
Tech Stack: ${project.techStack.join(", ")}

Submission File Name: "${file.originalname}"
Submission Content Snippet (first 5000 chars):
"""
${fileContent.slice(0, 5e3)}
"""

Please run a comprehensive review. Verify:
1. If the project files map to the configured tech stack.
2. If the main functionality described in the project description is present or stubbed.
3. Code quality, layout patterns, and best practices.

Output exactly a JSON object. Do not include markdown code block syntax.
The object must contain these keys:
- score: number (from 0 to 100)
- passed: boolean (true if score is >= 70, false otherwise)
- feedback: string (detailed review comments and suggestions in markdown)`;
          const aiResult = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: prompt }],
            mode: "FREE_CHAT"
          });
          const cleanJson = aiResult.content.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && typeof parsed === "object") {
            score = parsed.score !== void 0 ? parsed.score : 80;
            passed = parsed.passed !== void 0 ? parsed.passed : score >= 70;
            feedback = parsed.feedback || feedback;
          }
        } catch (err) {
          console.error("Failed to validate complete project via AI:", err.message);
        }
      }
      const finalStatus = passed ? "COMPLETED" : "IN_PROGRESS";
      const updatedProject = await db_default.project.update({
        where: { id },
        data: {
          status: finalStatus,
          aiValidationScore: score,
          aiValidationFeedback: feedback,
          progress: passed ? 100 : project.progress
        }
      });
      return res.json(ApiResponse.success({
        project: updatedProject,
        passed,
        score,
        feedback
      }));
    });
    uploadStepFile = asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = req.user.id;
      const file = req.file;
      if (!file) {
        throw new ApiError(400, "Please upload your step deliverable file");
      }
      const step = await db_default.projectStep.findUnique({
        where: { id },
        include: { project: true }
      });
      if (!step || step.project.userId !== userId) {
        throw new ApiError(404, "Project step not found");
      }
      const fileContent = file.buffer.toString("utf-8");
      const updatedStep1 = await db_default.projectStep.update({
        where: { id },
        data: {
          status: "VALIDATING",
          submittedFileName: file.originalname,
          submittedFileUrl: fileContent.slice(0, 8e3),
          // save content
          submittedAt: /* @__PURE__ */ new Date()
        }
      });
      res.json(ApiResponse.success(updatedStep1, "File uploaded, validation started"));
      (async () => {
        const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
        const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
        let score = 80;
        let feedback = "Good work on this step! The deliverable structure looks sound.";
        let suggestions = ["Check edge cases", "Add comments"];
        let passed = true;
        if (rawKey) {
          try {
            const prompt = `Review this student's project step deliverable:
Project: "${step.project.name}"
Step Title: "${step.title}"
Step Description: "${step.description}"
Validation Criteria: ${step.validationCriteria.join(", ")}

Submission File Name: "${file.originalname}"
Submission Contents:
"""
${fileContent.slice(0, 5e3)}
"""

Output exactly a JSON object. Do not include markdown code block syntax.
The object must contain these keys:
- score: number (from 0 to 100)
- passed: boolean (true if score is >= 70, false otherwise)
- feedback: string (detailed review comments)
- suggestions: array of strings (actionable suggestions)

Example:
{
  "score": 85,
  "passed": true,
  "feedback": "Perfect schema setup. Relationships are fully correct.",
  "suggestions": ["Add indexes on userId"]
}`;
            const aiResult = await callAI({
              provider: selectedProvider,
              rawKey,
              messages: [{ role: "user", content: prompt }],
              mode: "FREE_CHAT"
            });
            const cleanJson = aiResult.content.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed && typeof parsed === "object") {
              score = parsed.score !== void 0 ? parsed.score : 80;
              passed = parsed.passed !== void 0 ? parsed.passed : score >= 70;
              feedback = parsed.feedback || feedback;
              suggestions = parsed.suggestions || suggestions;
            }
          } catch (err) {
            console.error("Failed to validate step deliverable via AI:", err.message);
          }
        }
        const nextStatus = passed ? "COMPLETED" : "IN_PROGRESS";
        await db_default.projectStep.update({
          where: { id },
          data: {
            status: nextStatus,
            aiFeedback: feedback,
            aiScore: score,
            aiSuggestions: suggestions,
            validatedAt: /* @__PURE__ */ new Date()
          }
        });
        if (passed) {
          const nextStep = await db_default.projectStep.findFirst({
            where: {
              projectId: step.projectId,
              order: step.order + 1
            }
          });
          if (nextStep) {
            await db_default.projectStep.update({
              where: { id: nextStep.id },
              data: { status: "IN_PROGRESS" }
            });
          }
        }
        const allSteps = await db_default.projectStep.findMany({
          where: { projectId: step.projectId }
        });
        const completedCount = allSteps.filter((s) => s.status === "COMPLETED").length;
        const progress = completedCount / allSteps.length * 100;
        const progressLabel = `Step ${completedCount} of ${allSteps.length} complete`;
        await db_default.project.update({
          where: { id: step.projectId },
          data: {
            progress,
            progressLabel,
            status: progress === 100 ? "COMPLETED" : "IN_PROGRESS"
          }
        });
        try {
          const ioInstance = getIO();
          ioInstance.emit("step:validated", {
            stepId: step.id,
            status: nextStatus,
            feedback,
            score
          });
        } catch (socketErr) {
          console.warn("Socket io not available or not initialized yet.");
        }
      })().catch((err) => {
        console.error("Background step validation failed:", err);
      });
    });
    getStepValidation = asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = req.user.id;
      const step = await db_default.projectStep.findUnique({
        where: { id },
        include: { project: true }
      });
      if (!step || step.project.userId !== userId) {
        throw new ApiError(404, "Project step not found");
      }
      return res.json(ApiResponse.success({
        status: step.status,
        feedback: step.aiFeedback,
        score: step.aiScore,
        suggestions: step.aiSuggestions,
        validatedAt: step.validatedAt
      }));
    });
  }
});

// src/routes/project.routes.ts
import { Router as Router7 } from "express";
import multer3 from "multer";
var storage2, uploadProjectFile, router7, project_routes_default;
var init_project_routes = __esm({
  "src/routes/project.routes.ts"() {
    init_project_controller();
    init_auth_middleware();
    storage2 = multer3.memoryStorage();
    uploadProjectFile = multer3({
      storage: storage2,
      limits: { fileSize: 20 * 1024 * 1024 }
      // 20MB limit
    });
    router7 = Router7();
    router7.use(authenticate);
    router7.get("/", getProjects);
    router7.post("/", createProject);
    router7.get("/stats", getProjectStats);
    router7.post("/steps/:id/upload", uploadProjectFile.single("file"), uploadStepFile);
    router7.get("/steps/:id/validation", getStepValidation);
    router7.get("/:id", getProject);
    router7.put("/:id", updateProject);
    router7.delete("/:id", deleteProject);
    router7.post("/:id/generate-problem", generateProblemStatement);
    router7.post("/:id/create-step-roadmap", createStepByStepRoadmap);
    router7.post("/:id/submit-complete", uploadProjectFile.single("file"), submitCompleteProject);
    project_routes_default = router7;
  }
});

// src/controllers/planner.controller.ts
var getStudySessions, createStudySession, updateStudySession, deleteStudySession, completeStudySession, getPlannerStats;
var init_planner_controller = __esm({
  "src/controllers/planner.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    getStudySessions = asyncHandler(async (req, res) => {
      const { start, end } = req.query;
      const userId = req.user.id;
      const sessions = await db_default.studySession.findMany({
        where: {
          userId,
          ...start && end && {
            date: {
              gte: new Date(start),
              lte: new Date(end)
            }
          }
        },
        orderBy: { startTime: "asc" }
      });
      return res.json(ApiResponse.success(sessions));
    });
    createStudySession = asyncHandler(async (req, res) => {
      const { title, type, startTime, endTime, duration, date, notes, tags } = req.body;
      const userId = req.user.id;
      const session = await db_default.studySession.create({
        data: {
          userId,
          title,
          type,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          duration: duration || 60,
          date: new Date(date),
          notes,
          tags: tags || [],
          status: "SCHEDULED"
        }
      });
      return res.status(201).json(ApiResponse.success(session, "Study session scheduled"));
    });
    updateStudySession = asyncHandler(async (req, res) => {
      const { title, type, startTime, endTime, duration, date, notes, tags, status } = req.body;
      const session = await db_default.studySession.update({
        where: { id: req.params.id, userId: req.user.id },
        data: {
          ...title && { title },
          ...type && { type },
          ...startTime && { startTime: new Date(startTime) },
          ...endTime && { endTime: new Date(endTime) },
          ...duration !== void 0 && { duration },
          ...date && { date: new Date(date) },
          ...notes !== void 0 && { notes },
          ...tags && { tags },
          ...status && { status }
        }
      });
      return res.json(ApiResponse.success(session, "Study session updated"));
    });
    deleteStudySession = asyncHandler(async (req, res) => {
      await db_default.studySession.deleteMany({
        where: { id: req.params.id, userId: req.user.id }
      });
      return res.json(ApiResponse.success(null, "Study session cancelled/deleted"));
    });
    completeStudySession = asyncHandler(async (req, res) => {
      const session = await db_default.studySession.findFirst({
        where: { id: req.params.id, userId: req.user.id }
      });
      if (!session) throw new ApiError(404, "Session not found");
      const updated = await db_default.studySession.update({
        where: { id: session.id },
        data: { status: "COMPLETED" }
      });
      const hours = session.duration / 60;
      await db_default.user.update({
        where: { id: req.user.id },
        data: {
          hoursStudied: { increment: hours }
        }
      });
      const progress = await db_default.progress.findUnique({ where: { userId: req.user.id } });
      if (progress) {
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        await db_default.activityLog.upsert({
          where: { progressId_date: { progressId: progress.id, date: today } },
          update: {
            hoursStudied: { increment: hours },
            activityCount: { increment: 1 }
          },
          create: {
            progressId: progress.id,
            date: today,
            hoursStudied: hours,
            activityCount: 1
          }
        });
      }
      return res.json(ApiResponse.success(updated, "Study session marked as completed"));
    });
    getPlannerStats = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const totalSessions = await db_default.studySession.count({ where: { userId } });
      const completedSessions = await db_default.studySession.count({ where: { userId, status: "COMPLETED" } });
      const agg = await db_default.studySession.aggregate({
        where: { userId, status: "COMPLETED" },
        _sum: { duration: true }
      });
      return res.json(ApiResponse.success({
        totalScheduled: totalSessions,
        completed: completedSessions,
        totalMinutesStudied: agg._sum.duration || 0
      }));
    });
  }
});

// src/routes/planner.routes.ts
import { Router as Router8 } from "express";
var router8, planner_routes_default;
var init_planner_routes = __esm({
  "src/routes/planner.routes.ts"() {
    init_planner_controller();
    init_auth_middleware();
    router8 = Router8();
    router8.use(authenticate);
    router8.get("/sessions", getStudySessions);
    router8.post("/sessions", createStudySession);
    router8.get("/stats", getPlannerStats);
    router8.put("/sessions/:id", updateStudySession);
    router8.delete("/sessions/:id", deleteStudySession);
    router8.put("/sessions/:id/complete", completeStudySession);
    planner_routes_default = router8;
  }
});

// src/controllers/progress.controller.ts
var getProgress, getActivityHeatmap, getProgressStats, logActivity, addMilestone;
var init_progress_controller = __esm({
  "src/controllers/progress.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    getProgress = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      let progress = await db_default.progress.findUnique({
        where: { userId },
        include: {
          activityLogs: { orderBy: { date: "asc" } },
          topicMastery: true,
          milestones: { orderBy: { earnedAt: "desc" } }
        }
      });
      if (!progress) {
        progress = await db_default.progress.create({
          data: { userId },
          include: {
            activityLogs: true,
            topicMastery: true,
            milestones: true
          }
        });
      }
      return res.json(ApiResponse.success(progress));
    });
    getActivityHeatmap = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const year = parseInt(req.query.year) || (/* @__PURE__ */ new Date()).getFullYear();
      const progress = await db_default.progress.findUnique({ where: { userId } });
      if (!progress) return res.json(ApiResponse.success([]));
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      const logs = await db_default.activityLog.findMany({
        where: {
          progressId: progress.id,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          date: true,
          activityCount: true,
          hoursStudied: true
        }
      });
      return res.json(ApiResponse.success(logs));
    });
    getProgressStats = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const progress = await db_default.progress.findUnique({
        where: { userId },
        include: {
          topicMastery: true,
          milestones: true
        }
      });
      if (!progress) return res.json(ApiResponse.success({ topicMastery: [], milestones: [] }));
      return res.json(ApiResponse.success({
        topicMastery: progress.topicMastery,
        milestones: progress.milestones
      }));
    });
    logActivity = asyncHandler(async (req, res) => {
      const { hoursStudied, activityCount, date } = req.body;
      const userId = req.user.id;
      let progress = await db_default.progress.findUnique({ where: { userId } });
      if (!progress) {
        progress = await db_default.progress.create({ data: { userId } });
      }
      const logDate = date ? new Date(date) : /* @__PURE__ */ new Date();
      logDate.setHours(0, 0, 0, 0);
      const updatedLog = await db_default.activityLog.upsert({
        where: {
          progressId_date: {
            progressId: progress.id,
            date: logDate
          }
        },
        update: {
          activityCount: { increment: activityCount || 1 },
          hoursStudied: { increment: hoursStudied || 0 }
        },
        create: {
          progressId: progress.id,
          date: logDate,
          activityCount: activityCount || 1,
          hoursStudied: hoursStudied || 0
        }
      });
      if (hoursStudied) {
        await db_default.user.update({
          where: { id: userId },
          data: {
            hoursStudied: { increment: hoursStudied }
          }
        });
      }
      return res.json(ApiResponse.success(updatedLog, "Study activity logged successfully"));
    });
    addMilestone = asyncHandler(async (req, res) => {
      const { title, type, metadata } = req.body;
      const userId = req.user.id;
      let progress = await db_default.progress.findUnique({ where: { userId } });
      if (!progress) {
        progress = await db_default.progress.create({ data: { userId } });
      }
      const milestone = await db_default.milestone.create({
        data: {
          progressId: progress.id,
          userId,
          title,
          type,
          metadata
        }
      });
      return res.status(201).json(ApiResponse.success(milestone, "Milestone achievement saved"));
    });
  }
});

// src/routes/progress.routes.ts
import { Router as Router9 } from "express";
var router9, progress_routes_default;
var init_progress_routes = __esm({
  "src/routes/progress.routes.ts"() {
    init_progress_controller();
    init_auth_middleware();
    router9 = Router9();
    router9.use(authenticate);
    router9.get("/", getProgress);
    router9.get("/heatmap", getActivityHeatmap);
    router9.get("/stats", getProgressStats);
    router9.post("/log-activity", logActivity);
    router9.post("/milestones", addMilestone);
    progress_routes_default = router9;
  }
});

// src/controllers/folder.controller.ts
var getFolders, createFolder, updateFolder, deleteFolder, addChatToFolder;
var init_folder_controller = __esm({
  "src/controllers/folder.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    getFolders = asyncHandler(async (req, res) => {
      const folders = await db_default.folder.findMany({
        where: { userId: req.user.id },
        include: { chats: true },
        orderBy: { createdAt: "desc" }
      });
      return res.json(ApiResponse.success(folders));
    });
    createFolder = asyncHandler(async (req, res) => {
      const { name, color } = req.body;
      const folder = await db_default.folder.create({
        data: {
          userId: req.user.id,
          name,
          color: color || "#2563EB"
        }
      });
      return res.status(201).json(ApiResponse.success(folder, "Folder created"));
    });
    updateFolder = asyncHandler(async (req, res) => {
      const { name, color } = req.body;
      const folder = await db_default.folder.update({
        where: { id: req.params.id, userId: req.user.id },
        data: {
          ...name && { name },
          ...color && { color }
        }
      });
      return res.json(ApiResponse.success(folder, "Folder updated"));
    });
    deleteFolder = asyncHandler(async (req, res) => {
      await db_default.chat.updateMany({
        where: { folderId: req.params.id, userId: req.user.id },
        data: { folderId: null }
      });
      await db_default.folder.delete({
        where: { id: req.params.id, userId: req.user.id }
      });
      return res.json(ApiResponse.success(null, "Folder deleted"));
    });
    addChatToFolder = asyncHandler(async (req, res) => {
      const { chatId } = req.body;
      const folderId = req.params.id;
      const updatedChat = await db_default.chat.update({
        where: { id: chatId, userId: req.user.id },
        data: { folderId }
      });
      return res.json(ApiResponse.success(updatedChat, "Chat added to folder"));
    });
  }
});

// src/routes/folder.routes.ts
import { Router as Router10 } from "express";
var router10, folder_routes_default;
var init_folder_routes = __esm({
  "src/routes/folder.routes.ts"() {
    init_folder_controller();
    init_auth_middleware();
    router10 = Router10();
    router10.use(authenticate);
    router10.get("/", getFolders);
    router10.post("/", createFolder);
    router10.put("/:id", updateFolder);
    router10.delete("/:id", deleteFolder);
    router10.post("/:id/chats", addChatToFolder);
    folder_routes_default = router10;
  }
});

// src/controllers/settings.controller.ts
var getSettings, updateVoiceSettings, updateLanguageSettings, updateNotificationSettings, updateAppearanceSettings;
var init_settings_controller = __esm({
  "src/controllers/settings.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    getSettings = asyncHandler(async (req, res) => {
      const settings = await db_default.user.findUnique({
        where: { id: req.user.id },
        select: {
          theme: true,
          language: true,
          aiResponseLang: true,
          timezone: true,
          dateFormat: true,
          codeCommentsLang: true,
          rtlSupport: true,
          voiceEnabled: true,
          selectedVoice: true,
          voiceSpeed: true,
          autoPlayVoice: true,
          micSensitivity: true,
          notifLearning: true,
          notifRoadmap: true,
          notifProject: true,
          notifAchievement: true,
          notifAiUsage: true,
          notifWeekly: true,
          emailDigest: true
        }
      });
      return res.json(ApiResponse.success(settings));
    });
    updateVoiceSettings = asyncHandler(async (req, res) => {
      const { voiceEnabled, selectedVoice, voiceSpeed, autoPlayVoice, micSensitivity } = req.body;
      const updated = await db_default.user.update({
        where: { id: req.user.id },
        data: {
          ...voiceEnabled !== void 0 && { voiceEnabled },
          ...selectedVoice !== void 0 && { selectedVoice },
          ...voiceSpeed !== void 0 && { voiceSpeed },
          ...autoPlayVoice !== void 0 && { autoPlayVoice },
          ...micSensitivity !== void 0 && { micSensitivity }
        },
        select: {
          voiceEnabled: true,
          selectedVoice: true,
          voiceSpeed: true,
          autoPlayVoice: true,
          micSensitivity: true
        }
      });
      return res.json(ApiResponse.success(updated, "Voice and audio settings updated"));
    });
    updateLanguageSettings = asyncHandler(async (req, res) => {
      const { language, aiResponseLang, codeCommentsLang, rtlSupport, timezone, dateFormat } = req.body;
      const updated = await db_default.user.update({
        where: { id: req.user.id },
        data: {
          ...language !== void 0 && { language },
          ...aiResponseLang !== void 0 && { aiResponseLang },
          ...codeCommentsLang !== void 0 && { codeCommentsLang },
          ...rtlSupport !== void 0 && { rtlSupport },
          ...timezone !== void 0 && { timezone },
          ...dateFormat !== void 0 && { dateFormat }
        },
        select: {
          language: true,
          aiResponseLang: true,
          codeCommentsLang: true,
          rtlSupport: true,
          timezone: true,
          dateFormat: true
        }
      });
      return res.json(ApiResponse.success(updated, "Language and region settings updated"));
    });
    updateNotificationSettings = asyncHandler(async (req, res) => {
      const { notifLearning, notifRoadmap, notifProject, notifAchievement, notifAiUsage, notifWeekly, emailDigest } = req.body;
      const updated = await db_default.user.update({
        where: { id: req.user.id },
        data: {
          ...notifLearning !== void 0 && { notifLearning },
          ...notifRoadmap !== void 0 && { notifRoadmap },
          ...notifProject !== void 0 && { notifProject },
          ...notifAchievement !== void 0 && { notifAchievement },
          ...notifAiUsage !== void 0 && { notifAiUsage },
          ...notifWeekly !== void 0 && { notifWeekly },
          ...emailDigest !== void 0 && { emailDigest }
        },
        select: {
          notifLearning: true,
          notifRoadmap: true,
          notifProject: true,
          notifAchievement: true,
          notifAiUsage: true,
          notifWeekly: true,
          emailDigest: true
        }
      });
      return res.json(ApiResponse.success(updated, "Notification preferences updated"));
    });
    updateAppearanceSettings = asyncHandler(async (req, res) => {
      const { theme } = req.body;
      const updated = await db_default.user.update({
        where: { id: req.user.id },
        data: { theme },
        select: { theme: true }
      });
      return res.json(ApiResponse.success(updated, "Theme preference updated"));
    });
  }
});

// src/services/cron.service.ts
import cron from "node-cron";
var baseTemplate2, runWeeklyReportGenerator;
var init_cron_service = __esm({
  "src/services/cron.service.ts"() {
    init_db();
    init_ai_router_service();
    init_nodemailer();
    init_logger();
    baseTemplate2 = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BodhAI Weekly Progress Report</title>
</head>
<body style="margin:0;padding:0; background-color:#F8FAFC; font-family:'Helvetica Neue', Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; border:1px solid #E2E8F0; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #1E3A5F 0%,#2563EB 100%); padding:32px 40px; text-align:center;">
              <table width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background:rgba(255,255,255,0.15); border-radius:12px; padding:10px 20px;">
                      <span style="color:#fff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">BodhAI Weekly</span>
                    </div>
                    <p style="color: rgba(255,255,255,0.7); font-size:13px; margin:8px 0 0;">AI Learning Report & Performance Insights</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #E2E8F0; padding:24px 40px; text-align:center; background:#F8FAFC;">
              <p style="color:#94A3B8; font-size:12px; line-height:1.6; margin:0;">
                \xA9 2024 BodhAI Cognitive Systems<br/>
                You are receiving this because you signed up for weekly progress reports.<br/>
                <a href="${process.env.CLIENT_URL || "http://localhost:8080"}/settings" style="color:#2563EB; text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
    runWeeklyReportGenerator = async () => {
      logger.info("[CRON] Starting weekly progress report generation...");
      const users = await db_default.user.findMany({
        include: {
          roadmaps: {
            where: { isActive: true },
            include: {
              milestones: true
            }
          },
          quizAttempts: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
                // last 7 days
              }
            }
          },
          projects: {
            include: {
              steps: {
                where: {
                  validatedAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
                  },
                  status: "COMPLETED"
                }
              }
            }
          }
        }
      });
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      for (const user of users) {
        try {
          const activeRoadmap = user.roadmaps[0];
          const roadmapTitle = activeRoadmap ? activeRoadmap.title : "General Learning Path";
          const weeklyCompletedMilestones = activeRoadmap ? activeRoadmap.milestones.filter(
            (m) => m.status === "COMPLETED" && m.completedAt && m.completedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
          ) : [];
          const completedCount = weeklyCompletedMilestones.length;
          const passedQuizzes = user.quizAttempts.filter((q) => q.passed).length;
          let completedStepsCount = 0;
          user.projects.forEach((proj) => {
            completedStepsCount += proj.steps.length;
          });
          const messagesCount = await db_default.message.count({
            where: {
              userId: user.id,
              role: "USER",
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
              }
            }
          });
          logger.info(
            `[CRON] Generating report for user=${user.email} (Milestones=${completedCount}, Quizzes=${passedQuizzes}, Steps=${completedStepsCount}, Chats=${messagesCount})`
          );
          let aiReportHtml = "";
          if (rawKey) {
            const prompt = `Generate a beautiful, encouraging weekly learning progress report for the student: ${user.firstName || "Learner"}.
Goal/Roadmap: "${roadmapTitle}"

Activity this past week:
- Roadmaps Milestones Completed: ${completedCount}
- Passed Quizzes: ${passedQuizzes}
- Project Implementation Steps Completed: ${completedStepsCount}
- Mentorship Chat Messages Sent: ${messagesCount}

Generate a personalized weekly progress report. Include:
1. A summary of achievements.
2. Constructive, actionable learning feedback.
3. 3 specific focus areas/tips for next week.

The output must be formatted as raw HTML suitable for insertion inside an email body. Do not include markdown code block tags (\`\`\`html or \`\`\`). Use clean headings (<h2>, <h3>), paragraphs (<p>), list items (<li>), and inline styles with modern, appealing colors (e.g. primary deep blues #1E3A5F, success greens #10B981) to make it look premium.`;
            const aiResult = await callAI({
              provider: selectedProvider,
              rawKey,
              messages: [{ role: "user", content: prompt }],
              mode: "FREE_CHAT"
            });
            aiReportHtml = aiResult.content.replace(/```html/g, "").replace(/```/g, "").trim();
          } else {
            aiReportHtml = `
          <h2 style="color: #1E3A5F; margin: 0 0 12px;">Weekly Progress Report</h2>
          <p style="color: #64748B; font-size: 15px; line-height: 1.6;">
            Hi ${user.firstName || "Learner"}, here is your learning progress overview for this week on <strong>${roadmapTitle}</strong>:
          </p>
          <ul style="color: #475569; font-size: 14px; line-height: 1.8;">
            <li>\u{1F3C1} <strong>Completed Milestones:</strong> ${completedCount}</li>
            <li>\u{1F9EA} <strong>Quizzes Passed:</strong> ${passedQuizzes}</li>
            <li>\u{1F6E0}\uFE0F <strong>Project Steps Completed:</strong> ${completedStepsCount}</li>
            <li>\u{1F4AC} <strong>Mentorship Interactions:</strong> ${messagesCount} messages</li>
          </ul>
          <h3 style="color: #2563EB; margin: 20px 0 10px;">Tips for Next Week:</h3>
          <ol style="color: #475569; font-size: 14px; line-height: 1.8;">
            <li>Keep utilizing the BodhAI chat to clarify complex code blocks.</li>
            <li>Try to take a quiz at the end of each milestone to test your understanding.</li>
            <li>Build on your project steps to validate your knowledge.</li>
          </ol>
        `;
          }
          await transporter.sendMail({
            from: ` "BodhAI Weekly" <${process.env.GMAIL_USER}> `,
            to: user.email,
            subject: `\u{1F4C8} Your BodhAI Weekly Progress Report \u2014 ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
            html: baseTemplate2(aiReportHtml)
          });
          logger.info(`[CRON] Weekly report email sent successfully to ${user.email}`);
        } catch (err) {
          logger.error(`[CRON] Failed to generate weekly report for ${user.email}: ${err.message}`);
        }
      }
    };
  }
});

// src/routes/settings.routes.ts
import { Router as Router11 } from "express";
var router11, settings_routes_default;
var init_settings_routes = __esm({
  "src/routes/settings.routes.ts"() {
    init_settings_controller();
    init_auth_middleware();
    init_cron_service();
    router11 = Router11();
    router11.use(authenticate);
    router11.get("/", getSettings);
    router11.put("/voice", updateVoiceSettings);
    router11.put("/language", updateLanguageSettings);
    router11.put("/notifications", updateNotificationSettings);
    router11.put("/appearance", updateAppearanceSettings);
    router11.post("/trigger-weekly-report", async (req, res, next) => {
      try {
        await runWeeklyReportGenerator();
        res.json({ success: true, message: "Weekly progress report triggered successfully" });
      } catch (err) {
        next(err);
      }
    });
    settings_routes_default = router11;
  }
});

// src/controllers/quiz.controller.ts
var getMilestoneQuiz, submitQuizAnswers;
var init_quiz_controller = __esm({
  "src/controllers/quiz.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    init_ai_router_service();
    getMilestoneQuiz = asyncHandler(async (req, res) => {
      const { milestoneId } = req.params;
      const milestone = await db_default.roadmapMilestone.findUnique({
        where: { id: milestoneId }
      });
      if (!milestone) {
        throw new ApiError(404, "Milestone not found");
      }
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let questions = [];
      if (rawKey) {
        try {
          const prompt = `Generate exactly 10 multiple-choice quiz questions to test a student's knowledge on this topic:
Milestone: "${milestone.title}"
Description: "${milestone.description || ""}"
Skills: ${milestone.skillsGained.join(", ")}

Output exactly a JSON array of objects. Do not include markdown code block syntax or any other text.
Each object must have the following keys:
- questionText: string (the test question)
- options: array of 4 strings (the options)
- correctIndex: number (the 0-based index of the correct option: 0, 1, 2, or 3)
- explanation: string (why the answer is correct)

Example:
[
  {
    "questionText": "What does CSS stand for?",
    "options": ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
    "correctIndex": 1,
    "explanation": "CSS stands for Cascading Style Sheets."
  }
]`;
          const aiResult = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: prompt }],
            mode: "FREE_CHAT"
            // Use standard/free chat mode
          });
          const cleanJson = aiResult.content.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            questions = parsed.slice(0, 10);
          }
        } catch (err) {
          console.error("Failed to generate AI quiz, falling back to mock:", err.message);
        }
      }
      if (questions.length === 0) {
        for (let i = 1; i <= 10; i++) {
          questions.push({
            questionText: `Test Question ${i} for milestone: "${milestone.title}"`,
            options: [
              `Option A: Core concept validation ${i}`,
              `Option B: Practical application study ${i}`,
              `Option C: Advanced architecture topic ${i}`,
              `Option D: None of the above`
            ],
            correctIndex: i % 4,
            explanation: `This is a fallback explanation for question ${i} regarding ${milestone.title}.`
          });
        }
      }
      return res.json(ApiResponse.success({ milestoneId, questions }));
    });
    submitQuizAnswers = asyncHandler(async (req, res) => {
      const { milestoneId } = req.params;
      const { answers, questions } = req.body;
      const userId = req.user.id;
      if (!Array.isArray(answers) || !Array.isArray(questions) || answers.length !== questions.length) {
        throw new ApiError(400, "Invalid quiz submission format");
      }
      const milestone = await db_default.roadmapMilestone.findFirst({
        where: { id: milestoneId },
        include: { roadmap: true }
      });
      if (!milestone || milestone.roadmap.userId !== userId) {
        throw new ApiError(404, "Milestone not found");
      }
      let correctCount = 0;
      const results = questions.map((q, index) => {
        const selected = answers[index];
        const isCorrect = selected === q.correctIndex;
        if (isCorrect) correctCount++;
        return {
          questionText: q.questionText,
          selectedOption: q.options[selected] || "Unanswered",
          correctOption: q.options[q.correctIndex],
          isCorrect,
          explanation: q.explanation
        };
      });
      const score = correctCount / questions.length * 100;
      const passed = score >= 70;
      const attempt = await db_default.quizAttempt.create({
        data: {
          userId,
          milestoneId,
          score,
          passed,
          answers: JSON.stringify(answers),
          results: JSON.stringify(results)
        }
      });
      if (passed) {
        await db_default.roadmapMilestone.update({
          where: { id: milestoneId },
          data: {
            status: "COMPLETED",
            progress: 100,
            completedAt: /* @__PURE__ */ new Date()
          }
        });
        const nextMilestone = await db_default.roadmapMilestone.findFirst({
          where: {
            roadmapId: milestone.roadmapId,
            order: milestone.order + 1
          }
        });
        if (nextMilestone && (nextMilestone.status === "LOCKED" || nextMilestone.status === "UPCOMING")) {
          await db_default.roadmapMilestone.update({
            where: { id: nextMilestone.id },
            data: { status: "IN_PROGRESS" }
          });
        }
        const allMilestones = await db_default.roadmapMilestone.findMany({
          where: { roadmapId: milestone.roadmapId }
        });
        const completedCount = allMilestones.filter((m) => m.status === "COMPLETED").length;
        const overallProgress = completedCount / allMilestones.length * 100;
        await db_default.roadmap.update({
          where: { id: milestone.roadmapId },
          data: { overallProgress }
        });
      }
      return res.json(ApiResponse.success({
        attemptId: attempt.id,
        score,
        passed,
        results
      }));
    });
  }
});

// src/routes/quiz.routes.ts
import { Router as Router12 } from "express";
var router12, quiz_routes_default;
var init_quiz_routes = __esm({
  "src/routes/quiz.routes.ts"() {
    init_quiz_controller();
    init_auth_middleware();
    router12 = Router12();
    router12.use(authenticate);
    router12.get("/:milestoneId", getMilestoneQuiz);
    router12.post("/:milestoneId/submit", submitQuizAnswers);
    quiz_routes_default = router12;
  }
});

// src/controllers/collab.controller.ts
var createRoom, listRooms, getRoomMessages, getRoomMembers;
var init_collab_controller = __esm({
  "src/controllers/collab.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    createRoom = asyncHandler(async (req, res) => {
      const { name, description, topic, isPublic } = req.body;
      const userId = req.user.id;
      if (!name || name.trim() === "") {
        throw new ApiError(400, "Room name is required");
      }
      const room = await db_default.collabRoom.create({
        data: {
          name,
          description,
          topic,
          isPublic: isPublic !== void 0 ? isPublic : true,
          createdBy: userId,
          members: {
            create: {
              userId,
              role: "admin",
              isOnline: true,
              lastSeenAt: /* @__PURE__ */ new Date()
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatar: true }
              }
            }
          }
        }
      });
      return res.status(201).json(ApiResponse.success(room, "Collaborative chat room created successfully"));
    });
    listRooms = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const rooms = await db_default.collabRoom.findMany({
        where: {
          OR: [
            { isPublic: true },
            {
              members: {
                some: { userId }
              }
            }
          ]
        },
        include: {
          members: {
            select: { userId: true }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return res.json(ApiResponse.success(rooms));
    });
    getRoomMessages = asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const userId = req.user.id;
      const room = await db_default.collabRoom.findUnique({
        where: { id: roomId },
        include: { members: true }
      });
      if (!room) {
        throw new ApiError(404, "Room not found");
      }
      if (!room.isPublic && !room.members.some((m) => m.userId === userId)) {
        throw new ApiError(403, "Access denied to this private room");
      }
      const messages = await db_default.roomMessage.findMany({
        where: { roomId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        },
        orderBy: { createdAt: "asc" }
      });
      return res.json(ApiResponse.success(messages));
    });
    getRoomMembers = asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const userId = req.user.id;
      const room = await db_default.collabRoom.findUnique({
        where: { id: roomId },
        include: { members: true }
      });
      if (!room) {
        throw new ApiError(404, "Room not found");
      }
      if (!room.isPublic && !room.members.some((m) => m.userId === userId)) {
        throw new ApiError(403, "Access denied to this private room");
      }
      const members = await db_default.roomMember.findMany({
        where: { roomId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        }
      });
      return res.json(ApiResponse.success(members));
    });
  }
});

// src/routes/collab.routes.ts
import { Router as Router13 } from "express";
var router13, collab_routes_default;
var init_collab_routes = __esm({
  "src/routes/collab.routes.ts"() {
    init_collab_controller();
    init_auth_middleware();
    router13 = Router13();
    router13.use(authenticate);
    router13.post("/rooms", createRoom);
    router13.get("/rooms", listRooms);
    router13.get("/rooms/:roomId/messages", getRoomMessages);
    router13.get("/rooms/:roomId/members", getRoomMembers);
    collab_routes_default = router13;
  }
});

// src/controllers/knowledge.controller.ts
var uploadDocument, listDocuments, queryDocument, deleteDocument, getDocument, createArticle, updateArticle;
var init_knowledge_controller = __esm({
  "src/controllers/knowledge.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    init_ai_router_service();
    uploadDocument = asyncHandler(async (req, res) => {
      const file = req.file;
      const userId = req.user.id;
      if (!file) {
        throw new ApiError(400, "No file uploaded");
      }
      let text = "";
      const fileType = file.mimetype;
      const originalName = file.originalname;
      if (fileType === "application/pdf") {
        try {
          const pdfParse = await import("pdf-parse");
          const parseFn = pdfParse.default || pdfParse;
          const data = await parseFn(file.buffer);
          text = data.text || "";
        } catch (err) {
          throw new ApiError(400, `Failed to parse PDF document: ${err.message}`);
        }
      } else if (fileType.startsWith("text/") || originalName.endsWith(".txt") || originalName.endsWith(".md") || originalName.endsWith(".json") || originalName.endsWith(".js") || originalName.endsWith(".ts")) {
        text = file.buffer.toString("utf-8");
      } else {
        throw new ApiError(400, "Unsupported file format. Please upload PDF, TXT, MD, JSON, JS, or TS files.");
      }
      if (!text || text.trim() === "") {
        throw new ApiError(400, "Document contains no readable text");
      }
      const chunkSize = 1e3;
      const overlap = 200;
      const chunks = [];
      let index = 0;
      while (index < text.length) {
        const chunk = text.substring(index, index + chunkSize).trim();
        if (chunk) {
          chunks.push(chunk);
        }
        index += chunkSize - overlap;
      }
      const doc = await db_default.knowledgeDoc.create({
        data: {
          userId,
          title: originalName,
          fileUrl: "",
          // Locally parsed, url is empty
          fileType,
          totalChunks: chunks.length,
          extractedText: text,
          chunks: {
            create: chunks.map((content, chunkIndex) => ({
              content,
              chunkIndex
            }))
          }
        }
      });
      return res.status(201).json(ApiResponse.success(doc, "Document uploaded and indexed successfully"));
    });
    listDocuments = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const docs = await db_default.knowledgeDoc.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          fileType: true,
          totalChunks: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" }
      });
      return res.json(ApiResponse.success(docs));
    });
    queryDocument = asyncHandler(async (req, res) => {
      const { docId } = req.params;
      const { query } = req.body;
      const userId = req.user.id;
      if (!query || query.trim() === "") {
        throw new ApiError(400, "Query is required");
      }
      const doc = await db_default.knowledgeDoc.findFirst({
        where: { id: docId, userId },
        include: { chunks: true }
      });
      if (!doc) {
        throw new ApiError(404, "Document not found");
      }
      const queryWords = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const scoredChunks = doc.chunks.map((chunk) => {
        let score = 0;
        const contentLower = chunk.content.toLowerCase();
        queryWords.forEach((word) => {
          if (contentLower.includes(word)) {
            score += 1;
            const occurrences = contentLower.split(word).length - 1;
            score += occurrences * 0.2;
          }
        });
        return { chunk, score };
      });
      const topChunks = scoredChunks.filter((sc) => sc.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map((sc) => sc.chunk.content);
      const contextChunks = topChunks.length > 0 ? topChunks : doc.chunks.slice(0, 2).map((c) => c.content);
      const contextText = contextChunks.join("\n\n---\n\n");
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let answer = "AI service is unavailable";
      if (rawKey) {
        const prompt = `Use the following document segments extracted from "${doc.title}" to answer the student's question.
If the answer cannot be found in the document, answer using your general knowledge but clearly state that the document did not explicitly cover this point.

--- DOCUMENT EXTRACTS START ---
${contextText}
--- DOCUMENT EXTRACTS END ---

User's Question: "${query}"`;
        const aiResult = await callAI({
          provider: selectedProvider,
          rawKey,
          messages: [{ role: "user", content: prompt }],
          mode: "FREE_CHAT"
        });
        answer = aiResult.content;
      } else {
        answer = "AI API key not configured. Matching text segments from the document:\n\n" + contextText;
      }
      return res.json(ApiResponse.success({
        query,
        answer,
        sources: contextChunks
      }));
    });
    deleteDocument = asyncHandler(async (req, res) => {
      const { docId } = req.params;
      const userId = req.user.id;
      const doc = await db_default.knowledgeDoc.findFirst({
        where: { id: docId, userId }
      });
      if (!doc) {
        throw new ApiError(404, "Document not found");
      }
      await db_default.knowledgeDoc.delete({
        where: { id: docId }
      });
      return res.json(ApiResponse.success(null, "Document deleted successfully"));
    });
    getDocument = asyncHandler(async (req, res) => {
      const { docId } = req.params;
      const userId = req.user.id;
      const doc = await db_default.knowledgeDoc.findFirst({
        where: { id: docId, userId }
      });
      if (!doc) {
        throw new ApiError(404, "Document not found");
      }
      return res.json(ApiResponse.success(doc));
    });
    createArticle = asyncHandler(async (req, res) => {
      const { title, content } = req.body;
      const userId = req.user.id;
      if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
      }
      const chunkSize = 1e3;
      const overlap = 200;
      const chunks = [];
      let index = 0;
      while (index < content.length) {
        const chunk = content.substring(index, index + chunkSize).trim();
        if (chunk) {
          chunks.push(chunk);
        }
        index += chunkSize - overlap;
      }
      const doc = await db_default.knowledgeDoc.create({
        data: {
          userId,
          title,
          fileUrl: "",
          fileType: "text/markdown",
          totalChunks: chunks.length,
          extractedText: content,
          chunks: {
            create: chunks.map((c, chunkIndex) => ({
              content: c,
              chunkIndex
            }))
          }
        }
      });
      return res.status(201).json(ApiResponse.success(doc, "Article created successfully"));
    });
    updateArticle = asyncHandler(async (req, res) => {
      const { docId } = req.params;
      const { title, content } = req.body;
      const userId = req.user.id;
      if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
      }
      const doc = await db_default.knowledgeDoc.findFirst({
        where: { id: docId, userId }
      });
      if (!doc) {
        throw new ApiError(404, "Article not found");
      }
      const chunkSize = 1e3;
      const overlap = 200;
      const chunks = [];
      let index = 0;
      while (index < content.length) {
        const chunk = content.substring(index, index + chunkSize).trim();
        if (chunk) {
          chunks.push(chunk);
        }
        index += chunkSize - overlap;
      }
      const updatedDoc = await db_default.$transaction(async (tx) => {
        await tx.docChunk.deleteMany({
          where: { docId }
        });
        return tx.knowledgeDoc.update({
          where: { id: docId },
          data: {
            title,
            totalChunks: chunks.length,
            extractedText: content,
            chunks: {
              create: chunks.map((c, chunkIndex) => ({
                content: c,
                chunkIndex
              }))
            }
          }
        });
      });
      return res.json(ApiResponse.success(updatedDoc, "Article updated successfully"));
    });
  }
});

// src/routes/knowledge.routes.ts
import { Router as Router14 } from "express";
import multer4 from "multer";
var router14, storage3, fileFilter2, uploadDoc, knowledge_routes_default;
var init_knowledge_routes = __esm({
  "src/routes/knowledge.routes.ts"() {
    init_knowledge_controller();
    init_auth_middleware();
    init_apiResponse();
    router14 = Router14();
    storage3 = multer4.memoryStorage();
    fileFilter2 = (_req, file, cb) => {
      const allowedExtensions = /\.(pdf|txt|md|json|js|ts)$/i;
      const isAllowedExt = allowedExtensions.test(file.originalname);
      if (isAllowedExt) {
        cb(null, true);
      } else {
        cb(new ApiError(400, "Unsupported file format. Please upload PDF, TXT, MD, JSON, JS, or TS files."));
      }
    };
    uploadDoc = multer4({
      storage: storage3,
      fileFilter: fileFilter2,
      limits: { fileSize: 10 * 1024 * 1024 }
      // 10MB limit for documents
    });
    router14.use(authenticate);
    router14.post("/upload", uploadDoc.single("doc"), uploadDocument);
    router14.get("/list", listDocuments);
    router14.post("/article", createArticle);
    router14.put("/article/:docId", updateArticle);
    router14.get("/:docId", getDocument);
    router14.post("/:docId/query", queryDocument);
    router14.delete("/:docId", deleteDocument);
    knowledge_routes_default = router14;
  }
});

// src/controllers/profile.controller.ts
var getPublicProfile, getProfileSettings, updateProfileSettings;
var init_profile_controller = __esm({
  "src/controllers/profile.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    getPublicProfile = asyncHandler(async (req, res) => {
      const { slug } = req.params;
      if (!slug || slug.trim() === "") {
        throw new ApiError(400, "Profile slug is required");
      }
      const user = await db_default.user.findFirst({
        where: { profileSlug: slug, isProfilePublic: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
          location: true,
          title: true,
          portfolioLinks: true,
          createdAt: true,
          // Include statistics
          totalChats: true,
          projectsBuilt: true,
          hoursStudied: true,
          dayStreak: true,
          // Relations
          roadmaps: {
            where: { isActive: true },
            include: {
              milestones: {
                orderBy: { order: "asc" }
              }
            }
          },
          projects: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              coverImage: true,
              progress: true,
              techStack: true
            }
          },
          milestones: {
            orderBy: { earnedAt: "desc" }
          }
        }
      });
      if (!user) {
        throw new ApiError(404, "Public profile not found or profile is set to private");
      }
      return res.json(ApiResponse.success(user));
    });
    getProfileSettings = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const user = await db_default.user.findUnique({
        where: { id: userId },
        select: {
          profileSlug: true,
          isProfilePublic: true,
          portfolioLinks: true
        }
      });
      return res.json(ApiResponse.success(user));
    });
    updateProfileSettings = asyncHandler(async (req, res) => {
      const { profileSlug, isProfilePublic, portfolioLinks } = req.body;
      const userId = req.user.id;
      if (profileSlug && profileSlug.trim() !== "") {
        const slugLower = profileSlug.trim().toLowerCase();
        if (!/^[a-z0-9-_]+$/.test(slugLower)) {
          throw new ApiError(400, "Profile slug can only contain letters, numbers, dashes, and underscores");
        }
        const existing = await db_default.user.findFirst({
          where: {
            profileSlug: slugLower,
            NOT: { id: userId }
          }
        });
        if (existing) {
          throw new ApiError(400, "This profile slug is already taken. Please choose another one.");
        }
      }
      const updatedUser = await db_default.user.update({
        where: { id: userId },
        data: {
          ...profileSlug !== void 0 && { profileSlug: profileSlug.trim().toLowerCase() },
          ...isProfilePublic !== void 0 && { isProfilePublic },
          ...portfolioLinks !== void 0 && { portfolioLinks }
        },
        select: {
          profileSlug: true,
          isProfilePublic: true,
          portfolioLinks: true
        }
      });
      return res.json(ApiResponse.success(updatedUser, "Profile sharing settings updated successfully"));
    });
  }
});

// src/routes/profile.routes.ts
import { Router as Router15 } from "express";
var router15, profile_routes_default;
var init_profile_routes = __esm({
  "src/routes/profile.routes.ts"() {
    init_profile_controller();
    init_auth_middleware();
    router15 = Router15();
    router15.get("/public/:slug", getPublicProfile);
    router15.get("/settings", authenticate, getProfileSettings);
    router15.put("/settings", authenticate, updateProfileSettings);
    profile_routes_default = router15;
  }
});

// src/controllers/projectBuilder.controller.ts
var generateProjectSteps, submitProjectStep, validateProjectStep;
var init_projectBuilder_controller = __esm({
  "src/controllers/projectBuilder.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    init_ai_router_service();
    generateProjectSteps = asyncHandler(async (req, res) => {
      const { projectId } = req.params;
      const userId = req.user.id;
      const project = await db_default.project.findFirst({
        where: { id: projectId, userId },
        include: { steps: true }
      });
      if (!project) {
        throw new ApiError(404, "Project not found");
      }
      if (project.steps.length > 0) {
        return res.json(ApiResponse.success(project.steps));
      }
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let generatedSteps = [];
      if (rawKey) {
        try {
          const prompt = `Break down this project into a 4-6 step detailed step-by-step implementation plan:
Project Name: "${project.name}"
Description: "${project.description || ""}"
Tech Stack: ${project.techStack.join(", ")}

Output exactly a JSON array of objects. Do not include markdown code block syntax.
Each object must have the following keys:
- title: string
- description: string (detailed instructions on what to implement in this step)
- deliverable: string (what file or content the user must submit to pass, e.g. "database.ts containing Prisma schema config")
- expectedFileTypes: array of strings (e.g. ["ts", "js", "json", "prisma"])
- validationCriteria: array of strings (what the AI reviewer will check, e.g. ["Schema contains user model", "Includes indexes"])
- estimatedHours: number (estimated effort)

Example:
[
  {
    "title": "Database Schema Design",
    "description": "Create the Prisma schema file including User and Profile models.",
    "deliverable": "schema.prisma",
    "expectedFileTypes": ["prisma"],
    "validationCriteria": ["Contains User model", "Relations are properly set"],
    "estimatedHours": 3
  }
]`;
          const aiResult = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: prompt }],
            mode: "FREE_CHAT"
          });
          const cleanJson = aiResult.content.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            generatedSteps = parsed;
          }
        } catch (err) {
          console.error("Failed to generate project steps via AI:", err.message);
        }
      }
      if (generatedSteps.length === 0) {
        generatedSteps = [
          {
            title: "Project Initialization & Structure Setup",
            description: "Initialize the codebase directory structure, package configuration, and repository layout.",
            deliverable: "package.json config showing basic setup details",
            expectedFileTypes: ["json", "txt"],
            validationCriteria: ["Includes name and main entrypoint", "Basic scripts are defined"],
            estimatedHours: 2
          },
          {
            title: "Backend Database and Schema Configuration",
            description: "Design and set up database models, migrations, and connections.",
            deliverable: "Database configuration or schema file",
            expectedFileTypes: ["prisma", "sql", "js", "ts"],
            validationCriteria: ["Correct relationships modeled", "Indexes configured for core queries"],
            estimatedHours: 4
          },
          {
            title: "API Implementation & Route Handlers",
            description: "Write Express routes and controller functions for CRUD operations.",
            deliverable: "Router code file or controllers directory snapshot",
            expectedFileTypes: ["ts", "js"],
            validationCriteria: ["Authentication middleware used", "Validation schema is present"],
            estimatedHours: 6
          },
          {
            title: "Frontend Component Assembly & UI Integration",
            description: "Build React pages, layout structures, and wire up states to mock APIs.",
            deliverable: "App.tsx or Page component code",
            expectedFileTypes: ["tsx", "jsx", "css"],
            validationCriteria: ["Component handles loading states", "Includes clean styling"],
            estimatedHours: 8
          }
        ];
      }
      const createdSteps = await Promise.all(
        generatedSteps.map(
          (step, index) => db_default.projectStep.create({
            data: {
              projectId: project.id,
              order: index + 1,
              title: step.title,
              description: step.description,
              deliverable: step.deliverable,
              expectedFileTypes: step.expectedFileTypes || [],
              validationCriteria: step.validationCriteria || [],
              estimatedHours: step.estimatedHours || 4,
              status: index === 0 ? "IN_PROGRESS" : "PENDING"
            }
          })
        )
      );
      return res.status(201).json(ApiResponse.success(createdSteps));
    });
    submitProjectStep = asyncHandler(async (req, res) => {
      const { stepId } = req.params;
      const { submissionText, submissionFileName } = req.body;
      const userId = req.user.id;
      const step = await db_default.projectStep.findUnique({
        where: { id: stepId },
        include: { project: true }
      });
      if (!step || step.project.userId !== userId) {
        throw new ApiError(404, "Project step not found");
      }
      const updatedStep = await db_default.projectStep.update({
        where: { id: stepId },
        data: {
          status: "PENDING_VALIDATION",
          submittedFileUrl: submissionText,
          // We store the code/content in this field
          submittedFileName: submissionFileName || "submission.txt",
          submittedAt: /* @__PURE__ */ new Date()
        }
      });
      return res.json(ApiResponse.success(updatedStep, "Step deliverable submitted successfully. AI review is running."));
    });
    validateProjectStep = asyncHandler(async (req, res) => {
      const { stepId } = req.params;
      const userId = req.user.id;
      const step = await db_default.projectStep.findUnique({
        where: { id: stepId },
        include: { project: true }
      });
      if (!step || step.project.userId !== userId) {
        throw new ApiError(404, "Project step not found");
      }
      if (step.status !== "PENDING_VALIDATION" || !step.submittedFileUrl) {
        throw new ApiError(400, "Step is not ready for validation");
      }
      const selectedProvider = process.env.DEFAULT_AI_PROVIDER || "GROQ";
      const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
      let score = 80;
      let feedback = "Excellent implementation. The code layout satisfies the requirements.";
      let suggestions = ["Refactor helper operations", "Write unit tests"];
      let passed = true;
      if (rawKey) {
        try {
          const prompt = `Review this student's project deliverable:
Project: "${step.project.name}"
Step: "${step.title}"
Instructions: "${step.description}"
Validation Criteria: ${step.validationCriteria.join(", ")}

Student Submission Contents:
"""
${step.submittedFileUrl}
"""

Output exactly a JSON object. Do not include markdown code block syntax.
The object must contain these keys:
- score: number (from 0 to 100)
- passed: boolean (true if score is >= 70, false otherwise)
- feedback: string (detailed review comments)
- suggestions: array of strings (actionable refactoring advice)

Example:
{
  "score": 85,
  "passed": true,
  "feedback": "The file is structured correctly and contains all core fields.",
  "suggestions": ["Add documentation", "Separate DB config"]
}`;
          const aiResult = await callAI({
            provider: selectedProvider,
            rawKey,
            messages: [{ role: "user", content: prompt }],
            mode: "FREE_CHAT"
          });
          const cleanJson = aiResult.content.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && typeof parsed === "object") {
            score = parsed.score !== void 0 ? parsed.score : 80;
            passed = parsed.passed !== void 0 ? parsed.passed : score >= 70;
            feedback = parsed.feedback || feedback;
            suggestions = parsed.suggestions || suggestions;
          }
        } catch (err) {
          console.error("Failed to validate project step via AI:", err.message);
        }
      }
      const nextStatus = passed ? "COMPLETED" : "IN_PROGRESS";
      const updatedStep = await db_default.projectStep.update({
        where: { id: stepId },
        data: {
          status: nextStatus,
          aiFeedback: feedback,
          aiScore: score,
          aiSuggestions: suggestions,
          validatedAt: /* @__PURE__ */ new Date()
        }
      });
      if (passed) {
        const nextStep = await db_default.projectStep.findFirst({
          where: {
            projectId: step.projectId,
            order: step.order + 1
          }
        });
        if (nextStep) {
          await db_default.projectStep.update({
            where: { id: nextStep.id },
            data: { status: "IN_PROGRESS" }
          });
        }
      }
      const allSteps = await db_default.projectStep.findMany({
        where: { projectId: step.projectId }
      });
      const completedCount = allSteps.filter((s) => s.status === "COMPLETED").length;
      const progress = completedCount / allSteps.length * 100;
      const progressLabel = `Step ${completedCount} of ${allSteps.length} complete`;
      await db_default.project.update({
        where: { id: step.projectId },
        data: {
          progress,
          progressLabel,
          status: progress === 100 ? "COMPLETED" : "IN_PROGRESS"
        }
      });
      return res.json(ApiResponse.success({
        step: updatedStep,
        passed,
        score,
        feedback,
        suggestions,
        projectProgress: progress
      }));
    });
  }
});

// src/routes/projectBuilder.routes.ts
import { Router as Router16 } from "express";
var router16, projectBuilder_routes_default;
var init_projectBuilder_routes = __esm({
  "src/routes/projectBuilder.routes.ts"() {
    init_projectBuilder_controller();
    init_auth_middleware();
    router16 = Router16();
    router16.use(authenticate);
    router16.post("/:projectId/steps/generate", generateProjectSteps);
    router16.post("/steps/:stepId/submit", submitProjectStep);
    router16.post("/steps/:stepId/validate", validateProjectStep);
    projectBuilder_routes_default = router16;
  }
});

// src/config/voices.ts
var VOICES;
var init_voices = __esm({
  "src/config/voices.ts"() {
    VOICES = {
      // ElevenLabs voices
      elevenlabs: {
        aria: {
          id: "EXAVITQu4vr4xnSDxMaL",
          name: "Aria",
          description: "Soft & Academic",
          gender: "female",
          accent: "American",
          preview: "Hi, I am Aria your BodhAI learning assistant."
        },
        atlas: {
          id: "VR6AewLTigWG4xSOukaG",
          name: "Atlas",
          description: "Deep & Authoritative",
          gender: "male",
          accent: "American",
          preview: "Hello, I am Atlas. Let us explore this together."
        },
        priya: {
          id: "XB0fDUnXU5powFXDhCwa",
          name: "Priya",
          description: "Warm & Encouraging",
          gender: "female",
          accent: "Indian",
          preview: "Namaste! I am Priya, ready to help you learn."
        },
        rohan: {
          id: "onwK4e9ZLuTAKqWW03F9",
          name: "Rohan",
          description: "Clear & Energetic",
          gender: "male",
          accent: "Indian",
          preview: "Hi there! I am Rohan. Let us get started!"
        },
        nova: {
          id: "pFZP5JQG7iQjIQuC4Bku",
          name: "Nova",
          description: "Precise & Analytical",
          gender: "neutral",
          accent: "Global",
          preview: "Greetings. I am Nova. Processing your request."
        },
        luna: {
          id: "jsCqWAovK2LkecY7zXl4",
          name: "Luna",
          description: "Calm & Soothing",
          gender: "female",
          accent: "British",
          preview: "Hello there. I am Luna. Shall we begin?"
        }
      },
      // Web Speech API fallback voices
      // (built-in browser, no API key needed)
      webSpeech: {
        defaultFemale: {
          name: "System Female",
          description: "Browser built-in female",
          gender: "female",
          voiceURI: "Google US English Female"
        },
        defaultMale: {
          name: "System Male",
          description: "Browser built-in male",
          gender: "male",
          voiceURI: "Google US English Male"
        }
      }
    };
  }
});

// src/controllers/voice.controller.ts
import { ElevenLabsClient } from "elevenlabs";
async function streamTTS(params, res) {
  const { text, voiceId, speed = 1, stability = 0.5, similarityBoost = 0.75 } = params;
  if (!text || text.length === 0) {
    throw new ApiError(400, "No text provided");
  }
  const cleanText = text.replace(/#{1,6}\s/g, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/`{1,3}[^`]*`{1,3}/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/^\s*[-*+]\s/gm, "").replace(/^\s*\d+\.\s/gm, "").replace(/\n{2,}/g, ". ").trim().slice(0, 1e3);
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new ApiError(503, "Voice service not configured");
  }
  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
  });
  const selectedVoiceId = voiceId || VOICES.elevenlabs.aria.id;
  const audioStream = await client.generate({
    voice: selectedVoiceId,
    text: cleanText,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability,
      similarity_boost: similarityBoost,
      speed
    }
  });
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Transfer-Encoding", "chunked");
  for await (const chunk of audioStream) {
    res.write(chunk);
  }
  res.end();
}
var textToSpeech, previewVoice;
var init_voice_controller = __esm({
  "src/controllers/voice.controller.ts"() {
    init_asyncHandler();
    init_apiResponse();
    init_voices();
    textToSpeech = asyncHandler(async (req, res) => {
      const { text, voiceId, speed, stability, similarityBoost } = req.body;
      await streamTTS({ text, voiceId, speed, stability, similarityBoost }, res);
    });
    previewVoice = asyncHandler(async (req, res) => {
      const { voiceId, voiceName } = req.body;
      const preview = Object.values(VOICES.elevenlabs).find(
        (v) => v.id === voiceId
      )?.preview || `Hello! I am ${voiceName || "your assistant"}.`;
      await streamTTS({ text: preview, voiceId }, res);
    });
  }
});

// src/routes/voice.routes.ts
import { Router as Router17 } from "express";
var router17, voice_routes_default;
var init_voice_routes = __esm({
  "src/routes/voice.routes.ts"() {
    init_voice_controller();
    init_auth_middleware();
    router17 = Router17();
    router17.use(authenticate);
    router17.post("/speak", textToSpeech);
    router17.post("/preview", previewVoice);
    voice_routes_default = router17;
  }
});

// src/services/ai/debate.prompts.ts
var buildRound1Prompt, buildRound2Prompt, buildRound3Prompt, buildSynthesisPrompt;
var init_debate_prompts = __esm({
  "src/services/ai/debate.prompts.ts"() {
    buildRound1Prompt = (question, provider, mode, totalParticipants) => `
You are ${provider} participating in a 
structured multi-AI expert debate with 
${totalParticipants} AI models total.

THIS IS ROUND 1 \u2014 Your Initial Position.

Your job: Give your absolute BEST answer.
Other AI models will read and critique it next.
Make your reasoning transparent and clear.
Be specific, not generic.

QUESTION / TASK:
"${question}"

INSTRUCTIONS:
- Give your most accurate, complete answer
- Show your reasoning step by step
- Include code examples if relevant to the topic
- State any important assumptions you make
- End with: "CONFIDENCE: [High/Medium/Low] because..."
- Do NOT be vague \u2014 commit to your position
- Length: As thorough as the question requires

Your response will be evaluated by other AIs 
and a final synthesizer. Make it count.`;
    buildRound2Prompt = (question, myProvider, myRound1Answer, othersAnswers) => `
You are ${myProvider} in Round 2 of a 
structured AI debate.

ORIGINAL QUESTION:
"${question}"

YOUR ROUND 1 ANSWER:
${myRound1Answer}

OTHER AI MODELS' ANSWERS:
${othersAnswers.map((o) => `
\u2501\u2501\u2501 ${o.provider} said: \u2501\u2501\u2501
${o.content}
`).join("\n")}

YOUR ROUND 2 TASK \u2014 Respond in this EXACT format:

## \u2705 Points I Agree With
List specific points from other models that 
are correct. Quote them briefly.
Explain WHY you agree with evidence.

## \u274C Points I Challenge  
List specific points from other models that
are wrong, incomplete, or misleading.
Give your reasoning and evidence for WHY.
Be direct and specific \u2014 not vague criticism.

## \u{1F4A1} Critical Points Everyone Missed
What important aspect did NO model cover yet?
This is your chance to add unique value.

## \u{1F504} My Revised & Stronger Answer
Rewrite your answer incorporating:
- Valid points you learned from others
- Corrections to errors in your Round 1 answer
- Defense of your correct original positions
- New insights from the cross-examination

This revised answer should be NOTICEABLY 
BETTER than your Round 1 answer.
If you had nothing to revise, your Round 1 
was already perfect \u2014 say so and explain why.

End with: "REVISED CONFIDENCE: [High/Medium/Low]"`;
    buildRound3Prompt = (question, myProvider, myRound1, myRound2, othersRound2) => `
You are ${myProvider} in Round 3 \u2014 
your FINAL position in the AI debate.

QUESTION: "${question}"

YOUR JOURNEY:
Round 1 (your initial): ${myRound1.slice(0, 300)}...

Round 2 (after seeing others): ${myRound2.slice(0, 300)}...

OTHERS' ROUND 2 RESPONSES:
${othersRound2.map((o) => `
${o.provider}: ${o.content.slice(0, 400)}...
`).join("\n")}

FINAL ROUND TASK:
This is your last statement before synthesis.

Give your DEFINITIVE FINAL ANSWER:
1. Start with "## FINAL POSITION:"
2. Give your complete best answer
   (clean, no debate format \u2014 just the answer)
3. Then "## What Changed From Round 1:"
   (briefly what you updated and why)
4. Then "## What I Stand By:"
   (what you defended successfully)
5. Final confidence: 0-100

Make this your masterpiece answer.
The synthesizer will use this as primary input.`;
    buildSynthesisPrompt = (question, allRounds, providers) => `
You are the MASTER SYNTHESIZER in a 
multi-AI debate. Your job is to read all 
debate rounds and produce ONE definitive, 
superior answer.

DEBATE QUESTION:
"${question}"

PARTICIPANTS: ${providers.join(", ")}

ALL DEBATE ROUNDS:
${allRounds.map((r) => `
\u2554\u2550\u2550 Round ${r.round} | ${r.provider} 
  (${r.role}) \u2550\u2550\u2557
${r.content}
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`).join("\n")}

YOUR SYNTHESIS TASK:
Produce the SINGLE BEST answer by combining 
the strongest elements from all rounds.

Return ONLY this exact JSON structure:

{
  "consensus": "FULL MARKDOWN ANSWER HERE.
This must be the definitive best answer to the question. It should be better than any single model's answer because it combines the best insights from all.
Include: clear explanation, examples, code if relevant, edge cases, practical guidance.
Format properly with markdown headers, bullet points, code blocks etc.
Minimum 200 words for complex topics.",
  "executiveSummary": "2-3 sentence TL;DR of the consensus answer for users who want the quick version.",
  "contributions": {
    "PROVIDER_NAME": "The unique, specific insight this model contributed that made it into the final answer",
    "PROVIDER_NAME_2": "Their contribution"
  },
  "agreements": [
    "Point all models agreed on",
    "Another agreement point"
  ],
  "debates": [
    {
      "topic": "What was debated",
      "positions": {
        "PROVIDER_A": "Their position",
        "PROVIDER_B": "Their position"
      },
      "resolution": "How it was resolved in the final answer"
    }
  ],
  "keyInsights": [
    "Most important insight from the debate",
    "Second key insight",
    "Third key insight"
  ],
  "whatWasImproved": "What changed between Round 1 and final positions \u2014 what did the debate process actually improve?",
  "confidenceScore": 85,
  "winner": "PROVIDER_NAME if one model was clearly most accurate, or null if it was a collaborative result",
  "winnerReason": "Why this provider won, or why no single winner if null",
  "warningFlags": [
    "Any important caveats about the answer",
    "Edge cases where answer may not apply"
  ]
}

SYNTHESIS RULES:
- The consensus must be BETTER than any single model's answer
- If all models agreed \u2192 summarize clearly
- If models disagreed \u2192 take the more logically sound position and explain why
- Include concrete examples from the debate
- Do not pick a winner just to pick one
- Be intellectually honest about uncertainty
- Ensure the returned text is VALID, PARSABLE JSON only, with no other text, markdown wrapper, or trailing blocks outside the JSON object.`;
  }
});

// src/services/ai/debate.service.ts
var processAIMessage, runDebate, runRound;
var init_debate_service = __esm({
  "src/services/ai/debate.service.ts"() {
    init_db();
    init_encryption_service();
    init_ai_router_service();
    init_debate_prompts();
    processAIMessage = async (params) => {
      const { providerOverride, messages, mode, rawKey } = params;
      let keyToUse = rawKey;
      if (!keyToUse) {
        const dbKey = await db_default.apiKey.findFirst({
          where: {
            userId: params.userId,
            provider: providerOverride,
            isActive: true
          }
        });
        if (dbKey) {
          keyToUse = decrypt(dbKey.encryptedKey);
        } else {
          keyToUse = process.env[`${providerOverride.toUpperCase()}_API_KEY`];
        }
      }
      if (!keyToUse) {
        throw new Error(`API key for provider ${providerOverride} not found.`);
      }
      return await callAI({
        provider: providerOverride,
        rawKey: keyToUse,
        messages,
        mode
      });
    };
    runDebate = async ({
      userId,
      question,
      providers,
      mode,
      totalRounds,
      userContext,
      onRoundComplete
    }) => {
      const apiKeys = await db_default.apiKey.findMany({
        where: {
          userId,
          isActive: true,
          provider: { in: providers }
        }
      });
      const availableProviders = apiKeys.map(
        (k) => k.provider
      );
      if (availableProviders.length < 2) {
        throw new Error(
          `Only ${availableProviders.length} provider(s) found. Need at least 2. Add more API keys in Settings \u2192 AI Configuration.`
        );
      }
      const allRoundResponses = [];
      const round1 = await runRound(
        1,
        "initial",
        apiKeys.map((key) => ({
          provider: key.provider,
          rawKey: decrypt(key.encryptedKey)
        })),
        (provider, rawKey) => processAIMessage({
          userId,
          messages: [{
            role: "user",
            content: buildRound1Prompt(
              question,
              provider,
              mode,
              availableProviders.length
            )
          }],
          mode,
          providerOverride: provider,
          rawKey,
          userContext
        })
      );
      allRoundResponses.push(round1);
      if (onRoundComplete) {
        await onRoundComplete(1, round1);
      }
      let round2 = [];
      if (totalRounds >= 2) {
        round2 = await runRound(
          2,
          "critique",
          apiKeys.map((key) => ({
            provider: key.provider,
            rawKey: decrypt(key.encryptedKey)
          })),
          (provider, rawKey) => {
            const myAnswer = round1.find(
              (r) => r.provider === provider
            );
            const othersAnswers = round1.filter((r) => r.provider !== provider).map((r) => ({
              provider: r.provider,
              content: r.content
            }));
            return processAIMessage({
              userId,
              messages: [{
                role: "user",
                content: buildRound2Prompt(
                  question,
                  provider,
                  myAnswer?.content || "",
                  othersAnswers
                )
              }],
              mode: "FREE_CHAT",
              providerOverride: provider,
              rawKey
            });
          }
        );
        allRoundResponses.push(round2);
        if (onRoundComplete) {
          await onRoundComplete(2, round2);
        }
      }
      let round3 = [];
      if (totalRounds >= 3) {
        round3 = await runRound(
          3,
          "final",
          apiKeys.map((key) => ({
            provider: key.provider,
            rawKey: decrypt(key.encryptedKey)
          })),
          (provider, rawKey) => {
            const myRound1 = round1.find(
              (r) => r.provider === provider
            );
            const myRound2 = round2.find(
              (r) => r.provider === provider
            );
            const othersRound2 = round2.filter(
              (r) => r.provider !== provider
            ).map((r) => ({
              provider: r.provider,
              content: r.content
            }));
            return processAIMessage({
              userId,
              messages: [{
                role: "user",
                content: buildRound3Prompt(
                  question,
                  provider,
                  myRound1?.content || "",
                  myRound2?.content || "",
                  othersRound2
                )
              }],
              mode: "FREE_CHAT",
              providerOverride: provider,
              rawKey
            });
          }
        );
        allRoundResponses.push(round3);
        if (onRoundComplete) {
          await onRoundComplete(3, round3);
        }
      }
      const lastRound = round3.length > 0 ? round3 : round2.length > 0 ? round2 : round1;
      const allFlat = allRoundResponses.flat();
      const primaryKey = apiKeys.find(
        (k) => k.isPrimary
      ) || apiKeys[0];
      const synthesisResult = await processAIMessage({
        userId,
        messages: [{
          role: "user",
          content: buildSynthesisPrompt(
            question,
            allFlat,
            availableProviders
          )
        }],
        mode: "FREE_CHAT",
        providerOverride: primaryKey.provider,
        rawKey: decrypt(primaryKey.encryptedKey)
      });
      let synthesis;
      try {
        const match = synthesisResult.content.match(/\{[\s\S]*\}/);
        synthesis = JSON.parse(match[0]);
      } catch {
        synthesis = {
          consensus: lastRound[0]?.content || "Synthesis failed. See individual answers.",
          executiveSummary: "See full answer above.",
          contributions: {},
          agreements: [],
          debates: [],
          keyInsights: [],
          whatWasImproved: "",
          confidenceScore: 70,
          winner: null,
          winnerReason: "",
          warningFlags: [
            "Synthesis parsing failed. Showing best available answer."
          ]
        };
      }
      await Promise.all(
        apiKeys.map(
          (key) => db_default.apiKey.update({
            where: { id: key.id },
            data: {
              totalRequests: {
                increment: totalRounds + 1
              },
              lastUsedAt: /* @__PURE__ */ new Date()
            }
          })
        )
      );
      return {
        rounds: allRoundResponses,
        synthesis,
        providers: availableProviders,
        totalRounds: allRoundResponses.length
      };
    };
    runRound = async (roundNumber, role, participants, callAI2) => {
      const results = await Promise.allSettled(
        participants.map(async (p) => {
          try {
            const result = await callAI2(
              p.provider,
              p.rawKey
            );
            return {
              provider: p.provider,
              model: result.model || p.provider,
              content: result.content,
              round: roundNumber,
              role,
              tokensUsed: result.tokens?.total || 0
            };
          } catch (err) {
            return {
              provider: p.provider,
              model: p.provider,
              content: `[${p.provider} failed in Round ${roundNumber}: ${err.message}]`,
              round: roundNumber,
              role,
              tokensUsed: 0
            };
          }
        })
      );
      return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    };
  }
});

// src/controllers/debate.controller.ts
var startDebate, getDebateSession, streamDebate;
var init_debate_controller = __esm({
  "src/controllers/debate.controller.ts"() {
    init_db();
    init_asyncHandler();
    init_apiResponse();
    init_debate_service();
    startDebate = asyncHandler(async (req, res) => {
      const {
        chatId,
        question,
        providers,
        rounds = 2,
        mode = "FREE_CHAT"
      } = req.body;
      const userId = req.user.id;
      if (!question?.trim()) {
        throw new ApiError(400, "Question is required");
      }
      if (!providers || providers.length < 2) {
        throw new ApiError(400, "Select at least 2 AI providers");
      }
      if (providers.length > 4) {
        throw new ApiError(400, "Maximum 4 providers per debate");
      }
      if (rounds < 1 || rounds > 3) {
        throw new ApiError(400, "Rounds must be 1, 2, or 3");
      }
      const chat = await db_default.chat.findFirst({
        where: { id: chatId, userId }
      });
      if (!chat) {
        throw new ApiError(404, "Chat not found");
      }
      const user = await db_default.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          level: true,
          goal: true,
          topics: true,
          language: true
        }
      });
      const debateSession = await db_default.debateSession.create({
        data: {
          userId,
          chatId,
          question,
          mode,
          providers,
          totalRounds: rounds,
          status: "IN_PROGRESS"
        }
      });
      const userMessage = await db_default.message.create({
        data: {
          chatId,
          userId,
          role: "USER",
          content: question
        }
      });
      try {
        const result = await runDebate({
          userId,
          question,
          providers,
          mode,
          totalRounds: rounds,
          userContext: {
            name: user?.firstName,
            level: user?.level,
            goal: user?.goal,
            topics: user?.topics,
            language: user?.language
          },
          onRoundComplete: async (round, responses) => {
            const roundData = JSON.stringify(responses);
            await db_default.debateSession.update({
              where: { id: debateSession.id },
              data: {
                [`round${round}Data`]: roundData
              }
            });
          }
        });
        await db_default.debateSession.update({
          where: { id: debateSession.id },
          data: {
            status: "COMPLETED",
            consensusData: JSON.stringify(result.synthesis),
            confidenceScore: result.synthesis.confidenceScore,
            winner: result.synthesis.winner,
            completedAt: /* @__PURE__ */ new Date()
          }
        });
        const debateMessage = await db_default.message.create({
          data: {
            chatId,
            userId,
            role: "ASSISTANT",
            content: result.synthesis.consensus,
            messageType: "DEBATE",
            debateData: JSON.stringify({
              sessionId: debateSession.id,
              rounds: result.rounds,
              synthesis: result.synthesis,
              providers: result.providers,
              totalRounds: result.totalRounds,
              question
            })
          }
        });
        await db_default.chat.update({
          where: { id: chatId },
          data: {
            lastMessage: `[Debate] ${result.synthesis.consensus.slice(0, 100)}`,
            lastMessageAt: /* @__PURE__ */ new Date(),
            messageCount: { increment: 2 }
          }
        });
        return res.status(200).json(
          ApiResponse.success({
            userMessage,
            debateMessage,
            debate: {
              sessionId: debateSession.id,
              rounds: result.rounds,
              synthesis: result.synthesis,
              providers: result.providers,
              totalRounds: result.totalRounds
            }
          })
        );
      } catch (err) {
        await db_default.debateSession.update({
          where: { id: debateSession.id },
          data: { status: "FAILED" }
        });
        throw err;
      }
    });
    getDebateSession = asyncHandler(async (req, res) => {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const session = await db_default.debateSession.findFirst({
        where: { id: sessionId, userId }
      });
      if (!session) {
        throw new ApiError(404, "Debate session not found");
      }
      return res.status(200).json(
        ApiResponse.success({
          ...session,
          round1: session.round1Data ? JSON.parse(session.round1Data) : null,
          round2: session.round2Data ? JSON.parse(session.round2Data) : null,
          round3: session.round3Data ? JSON.parse(session.round3Data) : null,
          consensus: session.consensusData ? JSON.parse(session.consensusData) : null
        })
      );
    });
    streamDebate = asyncHandler(async (req, res) => {
      const {
        chatId,
        question,
        providers,
        rounds = 2,
        mode = "FREE_CHAT"
      } = req.body;
      const userId = req.user.id;
      if (!question?.trim()) {
        throw new ApiError(400, "Question is required");
      }
      if (!providers || providers.length < 2) {
        throw new ApiError(400, "Select at least 2 AI providers");
      }
      if (providers.length > 4) {
        throw new ApiError(400, "Maximum 4 providers per debate");
      }
      if (rounds < 1 || rounds > 3) {
        throw new ApiError(400, "Rounds must be 1, 2, or 3");
      }
      const chat = await db_default.chat.findFirst({
        where: { id: chatId, userId }
      });
      if (!chat) {
        throw new ApiError(404, "Chat not found");
      }
      const user = await db_default.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          level: true,
          goal: true,
          topics: true,
          language: true
        }
      });
      const debateSession = await db_default.debateSession.create({
        data: {
          userId,
          chatId,
          question,
          mode,
          providers,
          totalRounds: rounds,
          status: "IN_PROGRESS"
        }
      });
      await db_default.message.create({
        data: {
          chatId,
          userId,
          role: "USER",
          content: question
        }
      });
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();
      const send = (data) => {
        res.write(`data: ${JSON.stringify(data)}

`);
      };
      try {
        send({
          type: "DEBATE_STARTED",
          message: "Debate is starting...",
          providers,
          totalRounds: rounds
        });
        const result = await runDebate({
          userId,
          question,
          providers,
          mode,
          totalRounds: rounds,
          userContext: {
            name: user?.firstName,
            level: user?.level,
            goal: user?.goal,
            topics: user?.topics,
            language: user?.language
          },
          onRoundComplete: async (round, responses) => {
            const roundData = JSON.stringify(responses);
            await db_default.debateSession.update({
              where: { id: debateSession.id },
              data: {
                [`round${round}Data`]: roundData
              }
            });
            send({
              type: "ROUND_COMPLETE",
              round,
              responses: responses.map((r) => ({
                provider: r.provider,
                content: r.content,
                role: r.role
              })),
              message: `Round ${round} complete. ${rounds - round} round(s) remaining...`
            });
          }
        });
        await db_default.debateSession.update({
          where: { id: debateSession.id },
          data: {
            status: "COMPLETED",
            consensusData: JSON.stringify(result.synthesis),
            confidenceScore: result.synthesis.confidenceScore,
            winner: result.synthesis.winner,
            completedAt: /* @__PURE__ */ new Date()
          }
        });
        await db_default.message.create({
          data: {
            chatId,
            userId,
            role: "ASSISTANT",
            content: result.synthesis.consensus,
            messageType: "DEBATE",
            debateData: JSON.stringify({
              sessionId: debateSession.id,
              rounds: result.rounds,
              synthesis: result.synthesis,
              providers: result.providers,
              totalRounds: result.totalRounds,
              question
            })
          }
        });
        await db_default.chat.update({
          where: { id: chatId },
          data: {
            lastMessage: `[Debate] ${result.synthesis.consensus.slice(0, 100)}`,
            lastMessageAt: /* @__PURE__ */ new Date(),
            messageCount: { increment: 2 }
          }
        });
        send({
          type: "SYNTHESIS_COMPLETE",
          synthesis: result.synthesis,
          rounds: result.rounds,
          providers: result.providers
        });
        send({ type: "DEBATE_DONE", done: true });
        res.end();
      } catch (err) {
        await db_default.debateSession.update({
          where: { id: debateSession.id },
          data: { status: "FAILED" }
        });
        send({
          type: "ERROR",
          error: err.message || "Debate failed"
        });
        res.end();
      }
    });
  }
});

// src/routes/debate.routes.ts
import { Router as Router18 } from "express";
var router18, debate_routes_default;
var init_debate_routes = __esm({
  "src/routes/debate.routes.ts"() {
    init_auth_middleware();
    init_debate_controller();
    router18 = Router18();
    router18.use(authenticate);
    router18.post("/start", startDebate);
    router18.post("/stream", streamDebate);
    router18.get("/:sessionId", getDebateSession);
    debate_routes_default = router18;
  }
});

// server/routes/chat.ts
var handleChat;
var init_chat = __esm({
  "server/routes/chat.ts"() {
    handleChat = async (req, res) => {
      try {
        const { messages, system_prompt, model, max_tokens, apiKey: clientApiKey } = req.body;
        if (!messages || !model || !system_prompt) {
          return res.status(400).json({ error: "Missing required fields: messages, model, system_prompt" });
        }
        const apiKey = clientApiKey || process.env.GROQ_API_KEY;
        if (!apiKey) {
          console.error("No API key provided - client key:", !!clientApiKey, "env key:", !!process.env.GROQ_API_KEY);
          return res.status(401).json({ error: "GROQ_API_KEY not configured. Please set your API key in Settings." });
        }
        console.log(`Chat request: model=${model}, messages=${messages.length}, maxTokens=${max_tokens}`);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: system_prompt },
              ...messages
            ],
            max_tokens
          })
        });
        if (!response.ok) {
          const error = await response.json();
          console.error("Groq API error:", response.status, error);
          return res.status(response.status).json(error);
        }
        const data = await response.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error("Unexpected Groq response format:", data);
          return res.status(500).json({ error: "Unexpected response format from Groq API" });
        }
        const aiMessage = data.choices[0].message.content;
        const result = {
          message: aiMessage
        };
        console.log(`Chat response successful: ${aiMessage.length} characters`);
        res.json(result);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: `Failed to process chat request: ${errorMessage}` });
      }
    };
  }
});

// src/config/passport.ts
import passport2 from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
var passport_default;
var init_passport = __esm({
  "src/config/passport.ts"() {
    init_db();
    passport2.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
          scope: ["profile", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const avatar = profile.photos?.[0]?.value;
            const firstName = profile.name?.givenName || "";
            const lastName = profile.name?.familyName || "";
            const googleId = profile.id;
            if (!email) {
              return done(new Error("No email from Google"), void 0);
            }
            let user = await db_default.user.findFirst({
              where: {
                OR: [
                  { googleId },
                  { email }
                ]
              }
            });
            if (user) {
              if (!user.googleId) {
                user = await db_default.user.update({
                  where: { id: user.id },
                  data: {
                    googleId,
                    avatar: user.avatar || avatar,
                    isEmailVerified: true
                  }
                });
              }
            } else {
              user = await db_default.user.create({
                data: {
                  firstName,
                  lastName,
                  email,
                  googleId,
                  avatar,
                  isEmailVerified: true,
                  progress: { create: {} }
                }
              });
            }
            return done(null, user);
          } catch (err) {
            return done(err, void 0);
          }
        }
      )
    );
    passport_default = passport2;
  }
});

// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
var app, app_default;
var init_app = __esm({
  "src/app.ts"() {
    init_rateLimit_middleware();
    init_error_middleware();
    init_auth_routes();
    init_user_routes();
    init_chat_routes();
    init_message_routes();
    init_apikey_routes();
    init_roadmap_routes();
    init_project_routes();
    init_planner_routes();
    init_progress_routes();
    init_folder_routes();
    init_settings_routes();
    init_quiz_routes();
    init_collab_routes();
    init_knowledge_routes();
    init_profile_routes();
    init_projectBuilder_routes();
    init_voice_routes();
    init_debate_routes();
    init_chat();
    init_db();
    init_passport();
    app = express();
    app.set("trust proxy", 1);
    app.use(passport_default.initialize());
    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    app.use(cors({
      origin: process.env.CLIENT_URL || "http://localhost:8080",
      credentials: true
    }));
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    app.use("/api/", apiLimiter);
    app.get("/api/health", async (req, res) => {
      let dbStatus = "UNKNOWN";
      try {
        await db_default.user.count();
        dbStatus = "CONNECTED";
      } catch (err) {
        dbStatus = `FAILED: ${err.message}`;
      }
      res.status(200).json({
        status: "OK",
        env: process.env.NODE_ENV,
        database: dbStatus,
        jwtAccessSecretExists: !!process.env.JWT_ACCESS_SECRET,
        jwtRefreshSecretExists: !!process.env.JWT_REFRESH_SECRET,
        gmailUserExists: !!process.env.GMAIL_USER,
        gmailAppPasswordExists: !!process.env.GMAIL_APP_PASSWORD,
        groqApiKeyExists: !!process.env.GROQ_API_KEY
      });
    });
    app.post("/api/chat", handleChat);
    app.use("/api/auth", auth_routes_default);
    app.use("/api/user", user_routes_default);
    app.use("/api/chats", chat_routes_default);
    app.use("/api/messages", message_routes_default);
    app.use("/api/apikeys", apikey_routes_default);
    app.use("/api/roadmap", roadmap_routes_default);
    app.use("/api/projects", project_routes_default);
    app.use("/api/planner", planner_routes_default);
    app.use("/api/progress", progress_routes_default);
    app.use("/api/folders", folder_routes_default);
    app.use("/api/settings", settings_routes_default);
    app.use("/api/quiz", quiz_routes_default);
    app.use("/api/collab", collab_routes_default);
    app.use("/api/knowledge", knowledge_routes_default);
    app.use("/api/profile", profile_routes_default);
    app.use("/api/project-builder", projectBuilder_routes_default);
    app.use("/api/voice", voice_routes_default);
    app.use("/api/debate", debate_routes_default);
    app.use(notFound);
    app.use(errorHandler);
    app_default = app;
  }
});

// server/index.ts
var server_exports = {};
__export(server_exports, {
  createServer: () => createServer
});
import "dotenv/config";
function createServer() {
  connectRedis();
  return app_default;
}
var init_server = __esm({
  "server/index.ts"() {
    init_polyfill();
    init_app();
    init_redis();
  }
});

// api/index_src.ts
init_polyfill();
import "dotenv/config";
var app2 = null;
var initError = null;
async function getApp() {
  if (app2) return app2;
  try {
    const { createServer: createServer2 } = await Promise.resolve().then(() => (init_server(), server_exports));
    app2 = createServer2();
    return app2;
  } catch (err) {
    initError = err;
    console.error("Initialization error:", err);
    throw err;
  }
}
async function handler(req, res) {
  try {
    const expressApp = await getApp();
    return expressApp(req, res);
  } catch (err) {
    res.status(500).json({
      error: "Initialization failed",
      message: err.message,
      stack: err.stack,
      initError: initError ? { message: initError.message, stack: initError.stack } : null
    });
  }
}
export {
  handler as default
};
