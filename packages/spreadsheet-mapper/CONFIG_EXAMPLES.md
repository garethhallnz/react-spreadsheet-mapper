# Configuration Examples

This document provides practical configuration examples for different use cases and security requirements.

## Table of Contents

- [Enterprise Security Configuration](#enterprise-security-configuration)
- [Personal Application Configuration](#personal-application-configuration)
- [Development Environment Configuration](#development-environment-configuration)
- [Performance-Optimized Configuration](#performance-optimized-configuration)
- [Accessibility-First Configuration](#accessibility-first-configuration)
- [High-Volume Processing Configuration](#high-volume-processing-configuration)

## Enterprise Security Configuration

For enterprise applications requiring maximum security and compliance:

```typescript
import React, { useEffect } from 'react';
import { useSpreadsheetMapper, SpreadsheetConfig } from 'spreadsheet-mapper';

const enterpriseConfig: SpreadsheetConfig = {
  // Basic spreadsheet settings
  headerRow: 1,
  omitHeader: false,
  previewRowCount: 3, // Limited preview for security

  // Enhanced security settings
  security: {
    maxFileSize: 10 * 1024 * 1024, // 10MB strict limit
    allowedExtensions: ['.xlsx'], // Only modern Excel format
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    sanitizeData: true, // Always sanitize for XSS protection
    maxFilesPerWindow: 3, // Conservative rate limiting
    rateLimitWindow: 60000 // 1 minute window
  },

  // Performance settings optimized for security
  performance: {
    enableChunkedReading: true,
    chunkSize: 512 * 1024, // 512KB chunks for better control
    processingThrottle: 300, // Slow processing to prevent overload
    enableMetrics: true, // Monitor for anomalies
    maxConcurrentFiles: 1 // Process one file at a time
  },

  // Accessibility compliance
  accessibility: {
    announceChanges: true,
    highContrastMode: false, // Let system handle contrast
    ariaLabels: {
      fileInput: 'Upload enterprise spreadsheet files',
      mappingSelect: 'Map spreadsheet column to data field',
      saveButton: 'Save field mapping',
      finishButton: 'Complete mapping and process data',
      errorList: 'Processing errors and validation issues',
      successMessage: 'Mapping completed successfully'
    }
  }
};

// Usage
const EnterpriseMapper = () => {
  const {
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
    announce
  } = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleSecureFinish,
    config: enterpriseConfig,
    clientId: `enterprise-${userId}`,
    onAnnounce: (message, type) => {
      // Log all events for compliance
      logComplianceEvent({
        timestamp: new Date().toISOString(),
        userId,
        message,
        type,
        sessionId: getSessionId()
      });
      
      // Announce to screen readers
      announceToScreenReader(message, type);
    }
  });

  // Monitor security and performance metrics
  const performanceSummary = getPerformanceSummary();
  useEffect(() => {
    if (performanceSummary) {
      // Log performance metrics for security monitoring
      logSecurityMetrics({
        userId,
        filesProcessed: performanceSummary.totalFiles,
        totalSize: performanceSummary.totalSize,
        averageProcessingTime: performanceSummary.averageProcessingTime,
        timestamp: new Date().toISOString()
      });
    }
  }, [performanceSummary, userId]);

  return (
    <div role="main" aria-label="Enterprise Spreadsheet Mapper">
      {/* Display processing status for enterprise monitoring */}
      {isProcessing && (
        <div role="status" aria-live="polite">
          Processing {fileProcessingStates.length} files...
        </div>
      )}
      
      {/* Display errors with compliance logging */}
      {errors.length > 0 && (
        <div role="alert" aria-live="assertive">
          {errors.map((error, index) => {
            // Log security-related errors
            if (error.type === 'security') {
              logSecurityEvent({
                userId,
                errorMessage: error.message,
                timestamp: new Date().toISOString()
              });
            }
            return (
              <div key={index} className="error-message">
                {error.message}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Your secure UI implementation */}
    </div>
  );
};
```

## Personal Application Configuration

For personal or small business applications with balanced security:

```typescript
const personalConfig: SpreadsheetConfig = {
  // Standard spreadsheet settings
  headerRow: 1,
  omitHeader: false,
  previewRowCount: 5,

  // Balanced security settings
  security: {
    maxFileSize: 50 * 1024 * 1024, // 50MB reasonable limit
    allowedExtensions: ['.xlsx', '.xls', '.csv'],
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ],
    sanitizeData: true,
    maxFilesPerWindow: 10,
    rateLimitWindow: 60000
  },

  // Standard performance settings
  performance: {
    enableChunkedReading: true,
    chunkSize: 1024 * 1024, // 1MB chunks
    processingThrottle: 100,
    enableMetrics: false, // Disable for privacy
    maxConcurrentFiles: 3
  },

  // Basic accessibility
  accessibility: {
    announceChanges: true,
    ariaLabels: {
      fileInput: 'Choose spreadsheet files to upload',
      mappingSelect: 'Select target field for column',
      saveButton: 'Save mapping',
      finishButton: 'Process mapped data',
      errorList: 'Errors and warnings',
      successMessage: 'Processing completed'
    }
  }
};

// Usage
const PersonalMapper = () => {
  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleFinish,
    config: personalConfig,
    onAnnounce: (message, type) => {
      // Simple toast notifications
      showToast(message, type);
    }
  });

  return (
    <div>
      {/* Your personal app UI */}
    </div>
  );
};
```

## Development Environment Configuration

For development and testing with relaxed constraints:

```typescript
const devConfig: SpreadsheetConfig = {
  // Flexible spreadsheet settings
  headerRow: 1,
  omitHeader: false,
  previewRowCount: 10, // More data for testing

  // Relaxed security for development
  security: {
    maxFileSize: 100 * 1024 * 1024, // 100MB for large test files
    allowedExtensions: ['.xlsx', '.xls', '.csv', '.tsv', '.txt'],
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
      'text/tab-separated-values',
      'text/plain'
    ],
    sanitizeData: true, // Keep sanitization even in dev
    maxFilesPerWindow: 100, // High limit for testing
    rateLimitWindow: 60000
  },

  // Performance monitoring enabled
  performance: {
    enableChunkedReading: true,
    chunkSize: 2 * 1024 * 1024, // 2MB chunks
    processingThrottle: 50, // Faster processing
    enableMetrics: true, // Monitor performance during development
    maxConcurrentFiles: 5
  },

  // Full accessibility testing
  accessibility: {
    announceChanges: true,
    highContrastMode: false,
    ariaLabels: {
      fileInput: 'Development: Upload test spreadsheet files',
      mappingSelect: 'Development: Map column to field',
      saveButton: 'Development: Save mapping',
      finishButton: 'Development: Process data',
      errorList: 'Development: Error list',
      successMessage: 'Development: Success message'
    }
  }
};

// Usage with extensive logging
const DevMapper = () => {
  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: (data) => {
      console.log('Development: Processing complete', data);
      handleFinish(data);
    },
    config: devConfig,
    clientId: 'dev-session',
    onAnnounce: (message, type) => {
      console.log(`[${type.toUpperCase()}] ${message}`);
      
      // Show in UI for development
      const devConsole = document.getElementById('dev-console');
      if (devConsole) {
        devConsole.innerHTML += `<div class="${type}">${message}</div>`;
      }
    }
  });

  const performanceSummary = mapper.getPerformanceSummary();

  return (
    <div>
      {/* Development UI with debug info */}
      <div id="dev-console" style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
        <h4>Development Console</h4>
        {performanceSummary && (
          <div>
            <p>Files: {performanceSummary.totalFiles}</p>
            <p>Total Size: {(performanceSummary.totalSize / 1024 / 1024).toFixed(2)}MB</p>
            <p>Avg Processing Time: {performanceSummary.averageProcessingTime.toFixed(2)}ms</p>
          </div>
        )}
      </div>
      {/* Your dev UI */}
    </div>
  );
};
```

## Performance-Optimized Configuration

For applications prioritizing speed and throughput:

```typescript
const performanceConfig: SpreadsheetConfig = {
  // Minimal processing settings
  headerRow: 1,
  omitHeader: false,
  previewRowCount: 3, // Minimal preview for speed

  // Streamlined security
  security: {
    maxFileSize: 25 * 1024 * 1024, // 25MB for faster processing
    allowedExtensions: ['.xlsx', '.csv'], // Fastest formats only
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    sanitizeData: true, // Keep security essentials
    maxFilesPerWindow: 20, // Higher throughput
    rateLimitWindow: 60000
  },

  // Optimized performance settings
  performance: {
    enableChunkedReading: false, // Direct reading for small files
    chunkSize: 2 * 1024 * 1024, // Large chunks when needed
    processingThrottle: 0, // No throttling
    enableMetrics: true, // Monitor performance
    maxConcurrentFiles: 8 // High concurrency
  },

  // Minimal accessibility overhead
  accessibility: {
    announceChanges: false, // Disable for performance
    ariaLabels: {
      fileInput: 'Upload files',
      mappingSelect: 'Map field',
      saveButton: 'Save',
      finishButton: 'Process',
      errorList: 'Errors',
      successMessage: 'Complete'
    }
  }
};
```

## Accessibility-First Configuration

For applications requiring maximum accessibility compliance:

```typescript
const accessibilityConfig: SpreadsheetConfig = {
  // Standard settings
  headerRow: 1,
  omitHeader: false,
  previewRowCount: 5,

  // Standard security
  security: {
    maxFileSize: 50 * 1024 * 1024,
    allowedExtensions: ['.xlsx', '.xls', '.csv'],
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ],
    sanitizeData: true,
    maxFilesPerWindow: 10,
    rateLimitWindow: 60000
  },

  // Accessibility-optimized performance
  performance: {
    enableChunkedReading: true,
    chunkSize: 1024 * 1024,
    processingThrottle: 200, // Slower for better screen reader experience
    enableMetrics: false,
    maxConcurrentFiles: 2 // Fewer concurrent operations
  },

  // Comprehensive accessibility
  accessibility: {
    announceChanges: true,
    highContrastMode: true,
    ariaLabels: {
      fileInput: 'Select spreadsheet files to upload. Supported formats: Excel (.xlsx, .xls) and CSV (.csv). Maximum file size: 50MB.',
      mappingSelect: 'Choose which data field this spreadsheet column should map to. Use arrow keys to navigate options.',
      saveButton: 'Save the current field mapping. This will be remembered for processing.',
      finishButton: 'Complete all mappings and process the uploaded data. Ensure all required fields are mapped before proceeding.',
      errorList: 'List of validation errors and processing issues that need attention.',
      successMessage: 'Spreadsheet processing completed successfully. Data is ready for use.'
    }
  }
};

// Usage with comprehensive accessibility
const AccessibleMapper = () => {
  const [liveRegion, setLiveRegion] = useState('');

  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleFinish,
    config: accessibilityConfig,
    onAnnounce: (message, type) => {
      // Update live region for screen readers
      setLiveRegion(`${type}: ${message}`);
      
      // Clear after screen readers have time to announce
      setTimeout(() => setLiveRegion(''), 3000);
    }
  });

  return (
    <div>
      {/* Screen reader live region */}
      <div
        id="live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveRegion}
      </div>
      
      {/* Skip links */}
      <div className="skip-links">
        <a href="#file-upload" className="skip-link">
          Skip to file upload
        </a>
        <a href="#field-mapping" className="skip-link">
          Skip to field mapping
        </a>
        <a href="#process-button" className="skip-link">
          Skip to process button
        </a>
      </div>

      {/* High contrast support */}
      <div className={`mapper-container ${accessibilityConfig.accessibility?.highContrastMode ? 'high-contrast' : ''}`}>
        {/* Your accessible UI implementation */}
      </div>
    </div>
  );
};
```

## High-Volume Processing Configuration

For applications processing many files or large datasets:

```typescript
const highVolumeConfig: SpreadsheetConfig = {
  // Efficient processing settings
  headerRow: 1,
  omitHeader: false,
  previewRowCount: 2, // Minimal preview for large datasets

  // Balanced security for volume
  security: {
    maxFileSize: 100 * 1024 * 1024, // 100MB for large files
    allowedExtensions: ['.xlsx', '.csv'], // Fastest processing formats
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    sanitizeData: true,
    maxFilesPerWindow: 50, // High volume allowance
    rateLimitWindow: 60000
  },

  // High-volume performance settings
  performance: {
    enableChunkedReading: true, // Essential for large files
    chunkSize: 4 * 1024 * 1024, // 4MB chunks for efficiency
    processingThrottle: 50, // Minimal throttling
    enableMetrics: true, // Monitor performance under load
    maxConcurrentFiles: 10 // High concurrency
  },

  // Streamlined accessibility
  accessibility: {
    announceChanges: true,
    ariaLabels: {
      fileInput: 'Bulk upload spreadsheet files',
      mappingSelect: 'Map data field',
      saveButton: 'Save mapping',
      finishButton: 'Process all files',
      errorList: 'Processing errors',
      successMessage: 'Bulk processing complete'
    }
  }
};

// Usage with progress tracking
const HighVolumeMapper = () => {
  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleBulkFinish,
    config: highVolumeConfig,
    clientId: `bulk-${Date.now()}`,
    onAnnounce: (message, type) => {
      updateProgressIndicator(message, type);
    }
  });

  // Monitor processing states
  const completedFiles = mapper.fileProcessingStates.filter(state => state.status === 'completed').length;
  const totalFiles = mapper.fileProcessingStates.length;
  const progressPercentage = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  return (
    <div>
      {/* Progress indicator for bulk processing */}
      {mapper.isProcessing && (
        <div role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
          <span>Processing {completedFiles} of {totalFiles} files</span>
        </div>
      )}

      {/* Performance summary */}
      {mapper.getPerformanceSummary() && (
        <div className="performance-summary">
          <h3>Processing Summary</h3>
          <p>Total files: {mapper.getPerformanceSummary()?.totalFiles}</p>
          <p>Total size: {((mapper.getPerformanceSummary()?.totalSize || 0) / 1024 / 1024).toFixed(2)}MB</p>
          <p>Average processing time: {(mapper.getPerformanceSummary()?.averageProcessingTime || 0).toFixed(2)}ms</p>
        </div>
      )}

      {/* Your high-volume UI */}
    </div>
  );
};
```

## Configuration Selection Guide

| Use Case | Configuration | Key Features |
|----------|---------------|--------------|
| Enterprise/Corporate | `enterpriseConfig` | Maximum security, compliance, audit logging |
| Personal/Small Business | `personalConfig` | Balanced security and usability |
| Development/Testing | `devConfig` | Relaxed limits, extensive logging, debugging |
| Performance Critical | `performanceConfig` | Optimized for speed and throughput |
| Accessibility Required | `accessibilityConfig` | WCAG compliance, screen reader support |
| High Volume Processing | `highVolumeConfig` | Bulk processing, progress tracking |

Choose the configuration that best matches your specific use case and customize as needed for your requirements. 