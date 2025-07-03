// Shared type definitions for the spreadsheet mapper

// Performance metrics interface
export interface PerformanceMetrics {
  fileSize: number;
  processingTime: number;
  rowCount: number;
  memoryUsage?: number;
}

// Security configuration interface
export interface SecurityConfig {
  /** Maximum file size in bytes (default: 50MB) */
  maxFileSize?: number;
  /** Allowed file extensions (default: ['.xlsx', '.xls', '.csv']) */
  allowedExtensions?: string[];
  /** Allowed MIME types for file validation */
  allowedMimeTypes?: string[];
  /** Enable cell data sanitization to prevent XSS (default: true) */
  sanitizeData?: boolean;
  /** Rate limiting: max files per time window */
  maxFilesPerWindow?: number;
  /** Rate limiting time window in milliseconds (default: 60000 = 1 minute) */
  rateLimitWindow?: number;
}

// Performance configuration interface
export interface PerformanceConfig {
  /** Enable chunked reading for large files (default: true) */
  enableChunkedReading?: boolean;
  /** Chunk size for reading large files in bytes (default: 1MB) */
  chunkSize?: number;
  /** Throttle processing delay between files in ms (default: 100) */
  processingThrottle?: number;
  /** Enable performance monitoring (default: false) */
  enableMetrics?: boolean;
  /** Maximum number of concurrent file processing (default: 3) */
  maxConcurrentFiles?: number;
}

// Accessibility configuration interface
export interface AccessibilityConfig {
  /** Enable screen reader announcements (default: true) */
  announceChanges?: boolean;
  /** Enable high contrast mode support (default: false) */
  highContrastMode?: boolean;
  /** Custom ARIA labels for different elements */
  ariaLabels?: {
    fileInput?: string;
    mappingSelect?: string;
    saveButton?: string;
    finishButton?: string;
    errorList?: string;
    successMessage?: string;
  };
}

export interface SpreadsheetConfig {
  headerRow?: number;
  omitHeader?: boolean;
  dataStartRow?: number;
  sheet?: string | number;
  previewRowCount?: number;
  /** Security configuration options */
  security?: SecurityConfig;
  /** Performance configuration options */
  performance?: PerformanceConfig;
  /** Accessibility configuration options */
  accessibility?: AccessibilityConfig;
}

export interface SpreadsheetData {
  name: string;
  columns: string[];
  data: Record<string, unknown>[];
  /** Performance metrics for this file processing */
  metrics?: PerformanceMetrics;
}

export interface MappedField {
  field: string;
  value: string;
  saved?: boolean;
  /** File name for per-file mapping support */
  fileName?: string;
}

export interface MappingOption {
  label: string;
  value: string;
  required?: boolean;
}

export interface MappingError {
  option: MappingOption;
  message: string;
  /** Error type for better categorization */
  type?: 'validation' | 'security' | 'performance' | 'accessibility';
}

export interface MappedData {
  [key: string]: unknown;
}

// File validation result interface
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileSize: number;
  mimeType?: string;
  extension?: string;
}

// Rate limiting state interface
export interface RateLimitState {
  fileCount: number;
  windowStart: number;
}

export type CellValue = string | number | boolean | null | undefined;
export type SpreadsheetRow = CellValue[];
export type SpreadsheetMatrix = SpreadsheetRow[]; 