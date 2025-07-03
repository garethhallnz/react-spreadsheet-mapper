import { useState, useCallback, useRef } from 'react';
import SpreadSheetService from './SpreadsheetService';
import type { SpreadsheetData, SpreadsheetConfig, MappedField, MappingError, MappingOption, PerformanceMetrics } from './types';

/**
 * Props for the useSpreadsheetMapper hook.
 * @interface UseSpreadsheetMapperProps
 * @property {MappingOption[]} options - An array of target options for mapping.
 * @property {(data: SpreadsheetData & { map: { field: string; value: string }[] }) => void} onFinish - Callback function to be called when the mapping process is finished.
 * @property {SpreadsheetConfig} [config] - Optional configuration for spreadsheet processing.
 * @property {string} [clientId] - Optional client identifier for rate limiting (defaults to 'default').
 * @property {(message: string, type?: 'success' | 'error' | 'info') => void} [onAnnounce] - Optional callback for screen reader announcements.
 */
interface UseSpreadsheetMapperProps {
  options: MappingOption[];
  onFinish: (data: SpreadsheetData & { map: { field: string; value: string }[] }) => void;
  config?: SpreadsheetConfig;
  clientId?: string;
  onAnnounce?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

/**
 * File processing state interface
 */
interface FileProcessingState {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  data?: SpreadsheetData;
}

/**
 * A headless React hook for mapping spreadsheet data with enhanced security, performance, and accessibility features.
 * Provides state and functions for file processing, field mapping, and error handling.
 * @function useSpreadsheetMapper
 * @param {UseSpreadsheetMapperProps} { options, onFinish, config, clientId, onAnnounce } - Props for the hook.
 * @returns Enhanced return object with performance metrics and accessibility features
 */
const useSpreadsheetMapper = ({ options, onFinish, config, clientId = 'default', onAnnounce }: UseSpreadsheetMapperProps) => {
  const [map, setMap] = useState<MappedField[]>([]);
  const [errors, setErrors] = useState<MappingError[]>([]);
  const [processedFiles, setProcessedFiles] = useState<SpreadsheetData[]>([]);
  const [fileProcessingStates, setFileProcessingStates] = useState<FileProcessingState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  
  // Use ref to track active processing count for rate limiting
  const activeProcessingCount = useRef(0);
  const maxConcurrentFiles = config?.performance?.maxConcurrentFiles ?? 3;

  /**
   * Announces messages for screen readers
   */
  const announce = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onAnnounce) {
      onAnnounce(message, type);
    }
  }, [onAnnounce]);

  /**
   * Updates an existing mapped field or creates a new one.
   * @param {MappedField} record - The mapped field to update or create.
   */
  const updateOrCreate = useCallback((record: MappedField) => {
    const { value, fileName } = record;
    // For backward compatibility: if fileName is not provided in either record or existing mappings, match by value only
    const index = map.findIndex((item) => 
      item.value === value && 
      (!fileName || !item.fileName || item.fileName === fileName)
    );
    const exists = index !== -1;

    if (!exists) {
      setMap((prevState) => [...prevState, record]);
      announce(`Field mapping created: ${record.field} mapped to ${record.value}`, 'success');
    } else {
      setMap((prevState) => {
        const newState = [...prevState];
        newState[index] = record;
        return newState;
      });
      announce(`Field mapping updated: ${record.field} mapped to ${record.value}`, 'info');
    }
  }, [map, announce]);

  /**
   * Marks a mapped field as saved or unsaved.
   * @param {string} value - The field value to save.
   * @param {string} fileName - Optional file name for per-file mapping.
   */
  const save = useCallback((value: string, fileName?: string) => {
    // For backward compatibility: if fileName is not provided, match by value only
    const index = map.findIndex((item) => 
      item.value === value && 
      (!fileName || !item.fileName || item.fileName === fileName)
    );
    if (index !== -1) {
      setMap((prevState) => {
        const newState = [...prevState];
        const currentItem = newState[index];
        if (currentItem) {
          const saved = !(currentItem.saved && currentItem.saved === true);
          newState[index] = { ...currentItem, saved };
          announce(`Field ${currentItem.field} ${saved ? 'saved' : 'unsaved'}`, saved ? 'success' : 'info');
        }
        return newState;
      });
    }
  }, [map, announce]);

  /**
   * Finalizes the mapping process and checks for any required fields that are not mapped.
   */
  const finish = useCallback(() => {
    setErrors([]);
    const validationErrors: MappingError[] = [];
    
    options.forEach((option) => {
      if (option.required && !map.find((item) => item.value === option.value)) {
        validationErrors.push({ 
          option, 
          message: `${option.label} is required`,
          type: 'validation'
        });
      }
    });
    
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      announce(`Validation failed: ${validationErrors.length} required fields are missing`, 'error');
    } else {
      announce('All required fields are mapped successfully', 'success');
    }
  }, [map, options, announce]);

  /**
   * Processes a single file with concurrency control
   */
  const processSingleFile = useCallback(async (file: File, fileIndex: number) => {
    try {
      // Update state to processing
      setFileProcessingStates(prev => 
        prev.map((state, index) => 
          index === fileIndex ? { ...state, status: 'processing' } : state
        )
      );
      
      const data = await SpreadSheetService(file, config, clientId);
      
      // Update state to completed
      setFileProcessingStates(prev => 
        prev.map((state, index) => 
          index === fileIndex ? { ...state, status: 'completed', data } : state
        )
      );
      
      setProcessedFiles(prev => [...prev, data]);
      
      // Store performance metrics if available
      if (data.metrics) {
        setPerformanceMetrics(prev => [...prev, data.metrics!]);
      }
      
      announce(`File processed successfully: ${file.name}`, 'success');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Update state to error
      setFileProcessingStates(prev => 
        prev.map((state, index) => 
          index === fileIndex ? { ...state, status: 'error', error: errorMessage } : state
        )
      );
      
      announce(`File processing failed: ${file.name} - ${errorMessage}`, 'error');
      
      setErrors(prev => [...prev, {
        option: { label: file.name, value: file.name },
        message: `File processing failed: ${errorMessage}`,
        type: 'security'
      }]);
    } finally {
      activeProcessingCount.current--;
    }
  }, [config, clientId, announce]);

  /**
   * Processes the selected files using the SpreadsheetService with concurrency control.
   * @param {File[]} files - An array of File objects to process.
   */
  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    
    setProcessedFiles([]);
    setErrors([]);
    setPerformanceMetrics([]);
    setIsProcessing(true);
    
    // Initialize file processing states
    const initialStates: FileProcessingState[] = files.map(file => ({
      file,
      status: 'pending'
    }));
    setFileProcessingStates(initialStates);
    
    announce(`Starting to process ${files.length} file${files.length > 1 ? 's' : ''}`, 'info');
    
    // Process files with concurrency control
    const processQueue = async () => {
      const promises: Promise<void>[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue; // Skip if file is undefined
        
        // Wait if we've reached the concurrent file limit
        while (activeProcessingCount.current >= maxConcurrentFiles) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        activeProcessingCount.current++;
        promises.push(processSingleFile(file, i));
      }
      
      // Wait for all files to complete
      await Promise.allSettled(promises);
      setIsProcessing(false);
      
      // Final announcement
      const successCount = initialStates.filter(state => state.status === 'completed').length;
      const errorCount = initialStates.filter(state => state.status === 'error').length;
      
      if (errorCount === 0) {
        announce(`All ${files.length} files processed successfully`, 'success');
      } else {
        announce(`Processing completed: ${successCount} successful, ${errorCount} failed`, 'info');
      }
    };
    
    processQueue();
  }, [maxConcurrentFiles, processSingleFile, announce]);

  /**
   * Handles the completion of a single file's mapping process.
   * @param {SpreadsheetData} data - The processed data for the file.
   */
  const handleFileFinish = useCallback((data: SpreadsheetData) => {
    // First validate required fields
    setErrors([]);
    const validationErrors: MappingError[] = [];
    
    options.forEach((option) => {
      if (option.required) {
        // For backward compatibility: if no fileName is specified in mappings, assume single-file mode
        const mappedField = map.find((item) => 
          item.value === option.value && 
          (!item.fileName || item.fileName === data.name)
        );
        if (!mappedField || !mappedField.saved) {
          validationErrors.push({ 
            option, 
            message: `${option.label} is required and must be saved`,
            type: 'validation'
          });
        }
      }
    });
    
    // If there are validation errors, set them and prevent finishing
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      announce(`Cannot finish: ${validationErrors.length} required fields are not properly mapped`, 'error');
      return;
    }
    
    // If no validation errors, proceed with finishing
    // For backward compatibility: if no fileName is specified in mappings, include all mappings
    const result = map
      .filter((item) => !item.fileName || item.fileName === data.name)
      .map(({ field, value }) => ({
        field,
        value,
      }));
    
    announce('Mapping completed successfully', 'success');
    onFinish({ ...data, map: result });
  }, [map, onFinish, options, announce]);

  /**
   * Resets all state to initial values
   */
  const reset = useCallback(() => {
    setMap([]);
    setErrors([]);
    setProcessedFiles([]);
    setFileProcessingStates([]);
    setPerformanceMetrics([]);
    setIsProcessing(false);
    activeProcessingCount.current = 0;
    announce('All data has been reset', 'info');
  }, [announce]);

  /**
   * Gets performance summary for all processed files
   */
  const getPerformanceSummary = useCallback(() => {
    if (performanceMetrics.length === 0) return null;
    
    const totalSize = performanceMetrics.reduce((sum, metric) => sum + metric.fileSize, 0);
    const totalTime = performanceMetrics.reduce((sum, metric) => sum + metric.processingTime, 0);
    const totalRows = performanceMetrics.reduce((sum, metric) => sum + metric.rowCount, 0);
    const avgProcessingTime = totalTime / performanceMetrics.length;
    
    return {
      totalFiles: performanceMetrics.length,
      totalSize,
      totalProcessingTime: totalTime,
      averageProcessingTime: avgProcessingTime,
      totalRows,
      averageFileSize: totalSize / performanceMetrics.length
    };
  }, [performanceMetrics]);

  return {
    map,
    errors,
    processedFiles,
    fileProcessingStates,
    isProcessing,
    performanceMetrics,
    updateOrCreate,
    save,
    finish,
    handleFiles,
    handleFileFinish,
    reset,
    getPerformanceSummary,
    // Accessibility helpers
    announce
  };
};

export default useSpreadsheetMapper;
