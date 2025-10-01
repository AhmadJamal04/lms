const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const Joi = require('joi');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again later'
);

const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests, please try again later'
);

const strictRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // 20 requests per window
  'Rate limit exceeded, please slow down'
);

// Input validation schemas
const validationSchemas = {
  signup: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      }),
    instructor: Joi.boolean().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required()
  }),

  course: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    course_intro: Joi.string().min(10).max(200).required(),
    description: Joi.string().min(20).max(1000).required(),
    category: Joi.string().max(50).optional(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').optional(),
    price: Joi.number().min(0).optional(),
    tags: Joi.array().items(Joi.string().max(20)).max(10).optional(),
    prerequisites: Joi.array().items(Joi.string().max(100)).max(5).optional(),
    duration: Joi.number().min(1).max(1000).optional(), // in hours
    language: Joi.string().max(10).optional()
  }),

  courseUpdate: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    course_intro: Joi.string().min(10).max(200).optional(),
    description: Joi.string().min(20).max(1000).optional(),
    category: Joi.string().max(50).optional(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').optional(),
    price: Joi.number().min(0).optional(),
    tags: Joi.array().items(Joi.string().max(20)).max(10).optional(),
    prerequisites: Joi.array().items(Joi.string().max(100)).max(5).optional(),
    duration: Joi.number().min(1).max(1000).optional(),
    language: Joi.string().max(10).optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional()
  }),

  courseStatusUpdate: Joi.object({
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED', 'REJECTED').required(),
    reason: Joi.string().max(200).optional()
  }),

  module: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    order: Joi.number().min(1).optional(),
    isPublished: Joi.boolean().optional()
  }),

  moduleUpdate: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(500).optional(),
    order: Joi.number().min(1).optional(),
    isPublished: Joi.boolean().optional()
  }),

  assignment: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    deadline: Joi.date().greater('now').required(),
    maxScore: Joi.number().min(1).max(1000).optional(),
    instructions: Joi.string().max(2000).optional(),
    attachments: Joi.array().items(Joi.string()).max(5).optional()
  }),

  assignmentUpdate: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    deadline: Joi.date().greater('now').optional(),
    maxScore: Joi.number().min(1).max(1000).optional(),
    instructions: Joi.string().max(2000).optional(),
    status: Joi.string().valid('pending', 'active', 'completed', 'graded').optional()
  }),

  announcement: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    content: Joi.string().min(10).max(2000).required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
    isPinned: Joi.boolean().optional()
  }),

  announcementUpdate: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    content: Joi.string().min(10).max(2000).optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
    isPinned: Joi.boolean().optional()
  }),

  category: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(200).optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }),

  categoryUpdate: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    description: Joi.string().max(200).optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }),

  progressUpdate: Joi.object({
    completedModules: Joi.number().min(0).optional(),
    lastAccessed: Joi.date().optional()
  }),

  enrollmentStatusUpdate: Joi.object({
    status: Joi.string().valid('ACTIVE', 'COMPLETED', 'WITHDRAWN', 'SUSPENDED').required(),
    reason: Joi.string().max(200).optional()
  }),

  passwordReset: Joi.object({
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      })
  })
};

// Validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = {
  authRateLimit,
  generalRateLimit,
  strictRateLimit,
  validateInput,
  sanitizeInput,
  securityHeaders,
  corsOptions,
  validationSchemas
};
