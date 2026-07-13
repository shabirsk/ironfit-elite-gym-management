/**
 * Input sanitization utilities for XSS prevention.
 * HTML-encodes special characters in user text inputs.
 * NOTE: React already escapes output by default. This is defense-in-depth.
 */

/** Fields that should NOT be sanitized (passwords, tokens, etc.) */
const SKIP_FIELDS = new Set(['password']);

/**
 * HTML-encode special characters to prevent XSS.
 * Skips forward slashes and apostrophes to preserve URLs, dates, addresses, and names.
 */
export const sanitizeText = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim();
};

/**
 * Sanitize an entire object's string fields recursively.
 * Skips fields in SKIP_FIELDS set to avoid corrupting passwords/tokens.
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item =>
    typeof item === 'string' ? sanitizeText(item) : sanitizeObject(item)
  );
  const sanitized = {};
  for (const key of Object.keys(obj)) {
    if (SKIP_FIELDS.has(key)) {
      sanitized[key] = obj[key];
    } else if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeText(obj[key]);
    } else if (obj[key] && typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

/**
 * Express middleware to sanitize incoming request body and query strings.
 * Password fields are preserved as-is to prevent bcrypt comparison failures.
 */
export const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeText(req.query[key]);
      }
    }
  }
  next();
};

/**
 * Validate image file content by checking magic bytes.
 * @param {string} filePath
 * @param {string} mimeType
 * @returns {Promise<boolean>}
 */
export const validateImageMagicBytes = async (filePath, mimeType) => {
  const fs = await import('fs');
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(12);
  fs.readSync(fd, buffer, 0, 12, 0);
  fs.closeSync(fd);

  if (mimeType === 'image/svg+xml') {
    const fd2 = fs.openSync(filePath, 'r');
    const buf256 = Buffer.alloc(256);
    fs.readSync(fd2, buf256, 0, 256, 0);
    fs.closeSync(fd2);
    const header = buf256.toString('utf8').trim();
    return header.includes('<svg') || header.startsWith('<?xml');
  }

  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  if (mimeType === 'image/png') {
    const pngSig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    return pngSig.every((b, i) => buffer[i] === b);
  }
  if (mimeType === 'image/gif') {
    return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  }
  if (mimeType === 'image/webp') {
    return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
      && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  }
  return false;
};

/**
 * Validate that a string is a valid MongoDB ObjectId.
 * Returns true if valid, false otherwise.
 */
export const isValidObjectId = (id) => {
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Express middleware to validate MongoDB ObjectId route params.
 * Returns 400 with descriptive message if any :id param is invalid.
 */
export const validateObjectId = async (req, res, next) => {
  const idParams = ['id', 'leadId', 'memberId', 'paymentId', 'trainerId', 'workoutId'];
  for (const param of idParams) {
    if (req.params[param] && !isValidObjectId(req.params[param])) {
      return res.status(400).json({ message: 'Invalid ID format: ' + param });
    }
  }
  next();
};

export default {
  sanitizeText, sanitizeObject, sanitizeMiddleware,
  validateImageMagicBytes, isValidObjectId, validateObjectId,
};
