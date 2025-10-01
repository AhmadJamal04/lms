const sharp = require('sharp');
const { Readable } = require('stream');

class ImageOptimizer {
  constructor() {
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.qualitySettings = {
      jpeg: 85,
      png: 90,
      webp: 85
    };
  }

  // Validate image file
  validateImage(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new Error('File size too large. Maximum size is 5MB');
    }

    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    if (!this.supportedFormats.includes(fileExtension)) {
      throw new Error(`Unsupported file format. Supported formats: ${this.supportedFormats.join(', ')}`);
    }

    return true;
  }

  // Optimize image based on type and size
  async optimizeImage(buffer, options = {}) {
    const {
      width = null,
      height = null,
      quality = null,
      format = 'jpeg',
      fit = 'cover'
    } = options;

    let sharpInstance = sharp(buffer);

    // Get image metadata
    const metadata = await sharpInstance.metadata();
    
    // Resize if dimensions provided
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit,
        withoutEnlargement: true
      });
    }

    // Apply format-specific optimizations
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({
          quality: quality || this.qualitySettings.jpeg,
          progressive: true,
          mozjpeg: true
        });
        break;
      
      case 'png':
        sharpInstance = sharpInstance.png({
          quality: quality || this.qualitySettings.png,
          progressive: true,
          compressionLevel: 9
        });
        break;
      
      case 'webp':
        sharpInstance = sharpInstance.webp({
          quality: quality || this.qualitySettings.webp,
          effort: 6
        });
        break;
      
      default:
        // Keep original format but optimize
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
          sharpInstance = sharpInstance.jpeg({
            quality: quality || this.qualitySettings.jpeg,
            progressive: true
          });
        } else if (metadata.format === 'png') {
          sharpInstance = sharpInstance.png({
            quality: quality || this.qualitySettings.png,
            progressive: true
          });
        }
    }

    return await sharpInstance.toBuffer();
  }

  // Create multiple image sizes for responsive design
  async createResponsiveImages(buffer) {
    const sizes = [
      { width: 150, height: 150, suffix: 'thumb' },
      { width: 300, height: 300, suffix: 'small' },
      { width: 600, height: 600, suffix: 'medium' },
      { width: 1200, height: 1200, suffix: 'large' }
    ];

    const optimizedImages = {};

    for (const size of sizes) {
      try {
        const optimizedBuffer = await this.optimizeImage(buffer, {
          width: size.width,
          height: size.height,
          format: 'webp'
        });

        optimizedImages[size.suffix] = {
          buffer: optimizedBuffer,
          width: size.width,
          height: size.height,
          size: optimizedBuffer.length
        };
      } catch (error) {
        console.error(`Error creating ${size.suffix} image:`, error);
      }
    }

    return optimizedImages;
  }

  // Generate thumbnail
  async generateThumbnail(buffer, size = 150) {
    return await this.optimizeImage(buffer, {
      width: size,
      height: size,
      format: 'jpeg',
      quality: 80
    });
  }

  // Convert buffer to stream
  bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}

// Async wrapper for middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware for image optimization
const imageOptimization = (options = {}) => {
  const optimizer = new ImageOptimizer();
  
  return asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    try {
      // Validate image
      optimizer.validateImage(req.file);

      const {
        createResponsive = false,
        generateThumbnail = true,
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 85
      } = options;

      let optimizedBuffer = req.file.buffer;

      // Optimize main image
      optimizedBuffer = await optimizer.optimizeImage(optimizedBuffer, {
        width: maxWidth,
        height: maxHeight,
        quality,
        format: 'webp'
      });

      // Update file buffer with optimized version
      req.file.buffer = optimizedBuffer;
      req.file.size = optimizedBuffer.length;

      // Generate thumbnail if requested
      if (generateThumbnail) {
        const thumbnailBuffer = await optimizer.generateThumbnail(req.file.buffer);
        req.file.thumbnail = {
          buffer: thumbnailBuffer,
          size: thumbnailBuffer.length
        };
      }

      // Create responsive images if requested
      if (createResponsive) {
        const responsiveImages = await optimizer.createResponsiveImages(req.file.buffer);
        req.file.responsive = responsiveImages;
      }

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Image optimization failed',
        message: error.message
      });
    }
  });
};

// Profile image specific optimization
const profileImageOptimization = imageOptimization({
  maxWidth: 400,
  maxHeight: 400,
  quality: 90,
  generateThumbnail: true
});

// Course image specific optimization
const courseImageOptimization = imageOptimization({
  maxWidth: 800,
  maxHeight: 600,
  quality: 85,
  createResponsive: true
});

// Document image optimization
const documentImageOptimization = imageOptimization({
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80
});

module.exports = {
  ImageOptimizer,
  imageOptimization,
  profileImageOptimization,
  courseImageOptimization,
  documentImageOptimization
};
