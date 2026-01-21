import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ComplianceStatus } from '@/types';

export const generateId = (): string => uuidv4();

export const formatDate = (date: Date, formatString = 'PPP'): string => {
  return format(date, formatString);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

export const calculateOverallStatus = (statuses: ComplianceStatus[]): ComplianceStatus => {
  if (statuses.includes('not-met')) return 'not-met';
  if (statuses.includes('partially-met')) return 'partially-met';
  return 'met';
};

export const calculateCompliancePercentage = (results: { status: ComplianceStatus }[]): number => {
  if (results.length === 0) return 0;
  const metCount = results.filter(r => r.status === 'met').length;
  const partialCount = results.filter(r => r.status === 'partially-met').length;
  return Math.round(((metCount + partialCount * 0.5) / results.length) * 100);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const classNames = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};