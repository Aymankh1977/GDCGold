import { format, parseISO, isValid } from 'date-fns';

/**
 * Generate a reasonably unique ID for client-side entities.
 */
export function generateId(prefix: string = 'id'): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as Crypto).randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}-${uuid}`;
}

/**
 * Join class names safely.
 */
export function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a date safely.
 * Accepts Date or ISO string. Never throws.
 */
export function formatDate(
  value?: string | Date | null,
  pattern: string = 'dd MMM yyyy'
): string {
  if (!value) return '—';

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    date = parseISO(value);
  } else {
    return '—';
  }

  if (!isValid(date)) return '—';

  try {
    return format(date, pattern);
  } catch {
    return '—';
  }
}

/**
 * Format file size (bytes) into human-readable string.
 */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Calculate overall compliance status from individual requirement results.
 * Conservative logic:
 * - Any 'not_met' → not_met
 * - Any 'partially_met' → partially_met
 * - Otherwise → met
 */
export function calculateOverallStatus(
  results: Array<{ status?: string }> | undefined
): 'met' | 'partially_met' | 'not_met' {
  if (!results || results.length === 0) return 'not_met';

  const statuses = results.map(r => r.status);

  if (statuses.includes('not_met')) return 'not_met';
  if (statuses.includes('partially_met')) return 'partially_met';

  return 'met';
}

/**
 * Debounce utility (browser-safe).
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  waitMs = 250
) {
  let timeoutId: number | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), waitMs);
  };
}
