const jwt = require('jsonwebtoken');
const { generateErrorInstance } = require('../utils');

class JWTAuth {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    this.accessTokenExpiry = process.env.JWT_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  // Generate access token
  generateAccessToken(payload) {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'lms-api',
      audience: 'lms-client'
    });
  }

  // Generate refresh token
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'lms-api',
      audience: 'lms-client'
    });
  }

  // Generate both tokens
  generateTokenPair(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken({ id: user.id });

    return { accessToken, refreshToken };
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'lms-api',
        audience: 'lms-client'
      });
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'lms-api',
        audience: 'lms-client'
      });
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Session management removed - using stateless JWT

  // Extract token from header
  extractToken(req) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header found');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }
}

const jwtAuth = new JWTAuth();

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = jwtAuth.extractToken(req);
    const decoded = jwtAuth.verifyAccessToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    // Check if token is expired vs invalid
    const isExpired = error.message.includes('expired') || error.message.includes('jwt expired');
    
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: isExpired ? 'Token expired. Please refresh your token.' : error.message,
      code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      shouldRefresh: isExpired
    });
  }
};

// Async wrapper for middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Refresh token middleware
const refreshToken = asyncHandler(async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw generateErrorInstance({
        status: 400,
        message: 'Refresh token is required'
      });
    }

    const decoded = jwtAuth.verifyRefreshToken(refreshToken);

    // Generate new token pair
    const { Users } = require('../models');
    const user = await Users.findByPk(decoded.id);
    
    if (!user) {
      throw generateErrorInstance({
        status: 404,
        message: 'User not found'
      });
    }

    const tokenPair = jwtAuth.generateTokenPair(user);

    res.status(200).json({
      success: true,
      data: tokenPair
    });
  } catch (error) {
    next(error);
  }
});

// Logout middleware
const logout = asyncHandler(async (req, res, next) => {
  try {
    // Simple logout - just return success
    // In stateless JWT, logout is handled client-side by removing the token
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

// Role-based authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return next();
    }

    const token = jwtAuth.extractToken(req);
    const decoded = jwtAuth.verifyAccessToken(token);
    
    const session = await jwtAuth.getSession(decoded.id);
    if (session) {
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  jwtAuth,
  authenticateToken,
  refreshToken,
  logout,
  authorizeRoles,
  optionalAuth
};
