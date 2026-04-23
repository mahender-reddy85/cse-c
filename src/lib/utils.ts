/**
 * Sanitizes a string for use in Cloudinary folder paths or Firestore fields.
 */
export const sanitizePath = (str: string): string => {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
};

/**
 * Sanitizes unit numbers, ensuring they don't have redundant 'unit' prefixes.
 */
export const sanitizeUnit = (unit: string): string => {
  const clean = unit.toLowerCase().trim().replace(/^unit\s*/i, '');
  return clean.replace(/[^a-z0-9]+/g, '-');
};

/**
 * Validates file size and type for uploads.
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'FILE_SIZE_EXCEEDS_10MB_LIMIT' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'ONLY_PDF_AND_IMAGES_SUPPORTED' };
  }

  return { valid: true };
};
