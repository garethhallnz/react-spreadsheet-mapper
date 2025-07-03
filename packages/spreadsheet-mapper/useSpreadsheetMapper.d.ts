declare module 'react-spreadsheet-mapper' {
  export interface SpreadsheetConfig {
    headerRow?: number;
    omitHeader?: boolean;
    dataStartRow?: number;
    sheet?: string | number;
    previewRowCount?: number;
    security?: {
      maxFileSize?: number;
      allowedExtensions?: string[];
      allowedMimeTypes?: string[];
      sanitizeData?: boolean;
      maxFilesPerWindow?: number;
      rateLimitWindow?: number;
    };
    performance?: {
      enableChunkedReading?: boolean;
      chunkSize?: number;
      processingThrottle?: number;
      enableMetrics?: boolean;
      maxConcurrentFiles?: number;
    };
    accessibility?: {
      announceChanges?: boolean;
      highContrastMode?: boolean;
      ariaLabels?: {
        fileInput?: string;
        mappingSelect?: string;
        saveButton?: string;
        finishButton?: string;
        errorList?: string;
        successMessage?: string;
      };
    };
  }

  export interface MappedField {
    field: string;
    value: string;
    saved?: boolean;
  }

  export interface MappingOption {
    label: string;
    value: string;
    required?: boolean;
  }

  export interface MappingError {
    option: MappingOption;
    message: string;
    type?: 'validation' | 'security' | 'performance' | 'accessibility';
  }

  export interface PerformanceMetrics {
    fileSize: number;
    processingTime: number;
    rowCount: number;
    memoryUsage?: number;
  }

  export interface SpreadsheetData {
    name: string;
    columns: string[];
    data: Record<string, unknown>[];
    metrics?: PerformanceMetrics;
  }

  export interface FileProcessingState {
    file: File;
    status: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
    data?: SpreadsheetData;
  }

  export interface PerformanceSummary {
    totalFiles: number;
    totalSize: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    totalRows: number;
    averageFileSize: number;
  }

  export interface UseSpreadsheetMapperProps {
    options: MappingOption[];
    onFinish: (data: SpreadsheetData & { map: { field: string; value: string }[] }) => void;
    config?: SpreadsheetConfig;
    clientId?: string;
    onAnnounce?: (message: string, type?: 'success' | 'error' | 'info') => void;
  }

  export interface UseSpreadsheetMapperReturn {
    map: MappedField[];
    errors: MappingError[];
    processedFiles: SpreadsheetData[];
    fileProcessingStates: FileProcessingState[];
    isProcessing: boolean;
    performanceMetrics: PerformanceMetrics[];
    updateOrCreate: (item: MappedField) => void;
    save: (field: string) => void;
    finish: () => void;
    handleFiles: (files: File[]) => void;
    handleFileFinish: (data: SpreadsheetData) => void;
    reset: () => void;
    getPerformanceSummary: () => PerformanceSummary | null;
    announce: (message: string, type?: 'success' | 'error' | 'info') => void;
  }

  export function useSpreadsheetMapper(props: UseSpreadsheetMapperProps): UseSpreadsheetMapperReturn;
  export default useSpreadsheetMapper;
}