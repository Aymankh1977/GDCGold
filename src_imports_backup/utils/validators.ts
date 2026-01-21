import { SUPPORTED_FILE_TYPES, FILE_SIZE_LIMIT } from './constants';

export const validateFileType = (filename: string): boolean => {
  const extension = '.' + filename.split('.').pop()?.toLowerCase();
  return SUPPORTED_FILE_TYPES.includes(extension);
};

export const validateFileSize = (size: number): boolean => {
  return size <= FILE_SIZE_LIMIT;
};

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!validateFileType(file.name)) {
    return {
      valid: false,
      error: `Invalid file type. Supported types: ${SUPPORTED_FILE_TYPES.join(', ')}`
    };
  }
  
  if (!validateFileSize(file.size)) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${FILE_SIZE_LIMIT / (1024 * 1024)}MB`
    };
  }
  
  return { valid: true };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};