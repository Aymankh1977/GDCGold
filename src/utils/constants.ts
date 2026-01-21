export const APP_NAME = 'DetEdTech';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-Powered GDC Accreditation Platform';

export const FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
export const SUPPORTED_FILE_TYPES = ['.pdf', '.docx', '.doc'];

export const COMPLIANCE_COLORS = {
  met: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-500'
  },
  'partially-met': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: 'text-yellow-500'
  },
  'not-met': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'text-red-500'
  }
};

export const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-green-600 bg-green-50'
};