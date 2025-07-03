# Configuration Examples

This document provides comprehensive configuration examples for different use cases and security requirements when using the Spreadsheet Mapper library.

## Quick Start Configurations

### Default Configuration (Recommended)

```typescript
import useSpreadsheetMapper from 'spreadsheet-mapper';
import type { SpreadsheetConfig } from 'spreadsheet-mapper';

const MyComponent = () => {
  const config: SpreadsheetConfig = {
    // Uses secure defaults for all security, performance, and accessibility settings
    headerRow: 1,
    previewRowCount: 5
  };

  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleFinish,
    config,
    clientId: 'my-app-user',
    onAnnounce: (message, type) => {
      // Handle accessibility announcements
      console.log(`${type}: ${message}`);
    }
  });
  
  return (
    <div>
      {/* Your UI implementation */}
    </div>
  );
};
```

### Enterprise Configuration

**Use Case**: Large organizations, compliance requirements, high security needs

```typescript
import React, { useEffect } from 'react';
const enterpriseConfig = {
  security: {
    maxFileSize: 25 * 1024 * 1024, // 25MB - conservative for enterprise
    allowedExtensions: ['.xlsx', '.csv'], // Limited formats for security
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv'
    ],
    sanitizeData: true, // Always enabled
    maxFilesPerWindow: 5, // Conservative rate limiting
    rateLimitWindow: 60000 // 1 minute
  },
  performance: {
    enableChunkedReading: true,
    chunkSize: 512 * 1024, // 512KB chunks for stability
    processingThrottle: 200, // Slower processing to prevent overload
    enableMetrics: true, // Enable for monitoring
    maxConcurrentFiles: 2 // Conservative concurrency
  },
  accessibility: {
    announceChanges: true,
    highContrastMode: true, // Support accessibility requirements
    ariaLabels: {
      fileInput: 'Upload spreadsheet files for data mapping',
      mappingSelect: 'Select target field for mapping',
      saveButton: 'Save current field mapping',
      finishButton: 'Complete mapping and process data',
      errorList: 'Validation errors and warnings',
      successMessage: 'Mapping completed successfully'
    }
  }
};

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
    onFinish: handleFinish,
    config: enterpriseConfig,
    clientId: `user-${userId}`, // User-specific rate limiting
    onAnnounce: (message, type) => {
      // Enterprise logging
      logger.info(`Accessibility announcement: ${message}`, { type, userId });
      // Send to screen reader
      screenReaderAnnounce(message, type);
    }
  });

  // Monitor performance in enterprise environment
  const performanceSummary = getPerformanceSummary();
  useEffect(() => {
    if (performanceSummary && performanceSummary.averageProcessingTime > 5000) {
      // Alert if processing is slow
      logger.warn('Slow processing detected', performanceSummary);
    }
  }, [performanceSummary]);

  return (
    <EnterpriseMappingInterface 
      mapper={{
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
        announce
      }}
      performanceSummary={performanceSummary}
    />
  );
};
```

### Personal/Small Business Configuration

**Use Case**: Personal projects, small businesses, trusted environments

```typescript
const personalConfig = {
  security: {
    maxFileSize: 50 * 1024 * 1024, // 50MB - standard limit
    allowedExtensions: ['.xlsx', '.xls', '.csv'], // All standard formats
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ],
    sanitizeData: true, // Keep enabled for safety
    maxFilesPerWindow: 10, // More permissive
    rateLimitWindow: 60000
  },
  performance: {
    enableChunkedReading: true,
    chunkSize: 1024 * 1024, // 1MB chunks
    processingThrottle: 100, // Moderate throttling
    enableMetrics: false, // Disable for simplicity
    maxConcurrentFiles: 3 // Standard concurrency
  },
  accessibility: {
    announceChanges: true,
    ariaLabels: {
      fileInput: 'Choose your spreadsheet file',
      mappingSelect: 'Map to field',
      saveButton: 'Save mapping',
      finishButton: 'Process data'
    }
  }
};

const PersonalMapper = () => {
  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleFinish,
    config: personalConfig
  });

  return <SimpleMappingInterface mapper={mapper} />;
};
```

### Development Configuration

**Use Case**: Development and testing environments

**⚠️ WARNING**: Never use in production!

```typescript
const developmentConfig = {
  security: {
    maxFileSize: 100 * 1024 * 1024, // 100MB for testing large files
    allowedExtensions: ['.xlsx', '.xls', '.csv', '.ods', '.tsv'], // All formats for testing
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
      'application/vnd.oasis.opendocument.spreadsheet',
      'text/tab-separated-values'
    ],
    sanitizeData: false, // Disabled for testing raw data
    maxFilesPerWindow: 100, // No meaningful limit
    rateLimitWindow: 10000 // Short window for rapid testing
  },
  performance: {
    enableChunkedReading: false, // Simpler for debugging
    processingThrottle: 0, // No throttling
    enableMetrics: true, // Useful for performance analysis
    maxConcurrentFiles: 10 // High concurrency for stress testing
  },
  accessibility: {
    announceChanges: true,
    ariaLabels: {
      fileInput: 'DEV: Upload test files',
      mappingSelect: 'DEV: Map field',
      saveButton: 'DEV: Save',
      finishButton: 'DEV: Process'
    }
  }
};

const DevelopmentMapper = () => {
  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: (data) => {
      console.log('Development data:', data);
      handleFinish(data);
    },
    config: developmentConfig,
    clientId: 'dev-client'
  });

  return <DebugMappingInterface mapper={mapper} />;
};
```

### Performance-Optimized Configuration

**Use Case**: High-volume processing, performance-critical applications

```typescript
const performanceConfig = {
  security: {
    maxFileSize: 200 * 1024 * 1024, // 200MB for large datasets
    allowedExtensions: ['.csv'], // CSV only for maximum speed
    allowedMimeTypes: ['text/csv', 'application/csv'],
    sanitizeData: false, // Disabled for performance (ensure data is trusted)
    maxFilesPerWindow: 50,
    rateLimitWindow: 60000
  },
  performance: {
    enableChunkedReading: true,
    chunkSize: 2 * 1024 * 1024, // 2MB chunks for efficiency
    processingThrottle: 0, // No throttling
    enableMetrics: true, // Monitor performance
    maxConcurrentFiles: 8 // High concurrency
  },
  accessibility: {
    announceChanges: false, // Disabled for performance
    ariaLabels: {
      fileInput: 'Bulk file upload',
      finishButton: 'Process files'
    }
  },
  // Only process headers and minimal preview for speed
  previewRowCount: 0,
  omitHeader: false
};

const PerformanceMapper = () => {
  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleFinish,
    config: performanceConfig,
    clientId: 'bulk-processor'
  });

  // Monitor performance
  useEffect(() => {
    const summary = mapper.getPerformanceSummary();
    if (summary) {
      console.log('Performance metrics:', summary);
      // Send to monitoring system
    }
  }, [mapper.performanceMetrics]);

  return <HighPerformanceMappingInterface mapper={mapper} />;
};
```

### Accessibility-First Configuration

**Use Case**: Applications prioritizing accessibility compliance

```typescript
const accessibilityConfig = {
  security: {
    maxFileSize: 50 * 1024 * 1024,
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
  performance: {
    enableChunkedReading: true,
    chunkSize: 1024 * 1024,
    processingThrottle: 150, // Slightly slower for better UX
    enableMetrics: false, // Simplify for accessibility
    maxConcurrentFiles: 1 // Sequential processing for clearer announcements
  },
  accessibility: {
    announceChanges: true,
    highContrastMode: true,
    ariaLabels: {
      fileInput: 'Select spreadsheet file to upload and process. Supported formats: Excel (xlsx, xls) and CSV files. Maximum file size is 50MB.',
      mappingSelect: 'Choose which field this column should map to. Required fields are marked with an asterisk.',
      saveButton: 'Save this field mapping. The mapping will be stored for the final data processing.',
      finishButton: 'Complete field mapping and process the spreadsheet data. All required fields must be mapped before processing.',
      errorList: 'List of validation errors that must be resolved before processing can continue',
      successMessage: 'Data processing completed successfully. You can now download or use the mapped data.'
    }
  }
};

const AccessibleMapper = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleFinish,
    config: accessibilityConfig,
    onAnnounce: (message, type) => {
      // Add to announcement history
      setAnnouncements(prev => [...prev.slice(-9), `${type?.toUpperCase()}: ${message}`]);
      
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      // Clean up after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  });

  return (
    <div>
      {/* Skip links */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#file-upload" className="skip-link">
        Skip to file upload
      </a>
      
      {/* Announcement history for screen readers */}
      <div 
        id="announcement-history" 
        className="sr-only" 
        aria-label="Recent announcements"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
      
      <AccessibleMappingInterface mapper={mapper} />
    </div>
  );
};
```

### High-Volume Processing Configuration

**Use Case**: Batch processing, data migration, high-throughput scenarios

```typescript
const highVolumeConfig = {
  security: {
    maxFileSize: 500 * 1024 * 1024, // 500MB for large datasets
    allowedExtensions: ['.csv', '.xlsx'], // Focus on common formats
    allowedMimeTypes: [
      'text/csv',
      'application/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    sanitizeData: true, // Keep enabled for safety
    maxFilesPerWindow: 100, // High volume processing
    rateLimitWindow: 300000 // 5 minute window
  },
  performance: {
    enableChunkedReading: true,
    chunkSize: 4 * 1024 * 1024, // 4MB chunks for large files
    processingThrottle: 50, // Minimal throttling
    enableMetrics: true, // Essential for monitoring
    maxConcurrentFiles: 5 // Balanced concurrency
  },
  accessibility: {
    announceChanges: false, // Disabled for high volume
    ariaLabels: {
      fileInput: 'Batch file upload area'
    }
  },
  // Optimize for large datasets
  previewRowCount: 10, // Minimal preview
  headerRow: 1
};

const HighVolumeMapper = () => {
  const [processingStats, setProcessingStats] = useState(null);
  
  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleFinish,
    config: highVolumeConfig,
    clientId: `batch-${Date.now()}`
  });

  // Advanced performance monitoring
  useEffect(() => {
    const summary = mapper.getPerformanceSummary();
    if (summary) {
      setProcessingStats(summary);
      
      // Alert if performance degrades
      if (summary.averageProcessingTime > 10000) { // 10 seconds
        console.warn('Processing time degradation detected');
      }
    }
  }, [mapper.performanceMetrics]);

  return (
    <div>
      <BatchProcessingInterface 
        mapper={mapper}
        stats={processingStats}
      />
    </div>
  );
};
```

## Advanced Configuration Patterns

### Dynamic Configuration Based on File Size

```typescript
const getDynamicConfig = (file: File) => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (fileSizeMB > 100) {
    // Large file configuration
    return {
      performance: {
        enableChunkedReading: true,
        chunkSize: 2 * 1024 * 1024, // 2MB chunks
        processingThrottle: 200,
        maxConcurrentFiles: 1 // Process one at a time
      }
    };
  } else if (fileSizeMB > 10) {
    // Medium file configuration
    return {
      performance: {
        enableChunkedReading: true,
        chunkSize: 1 * 1024 * 1024, // 1MB chunks
        processingThrottle: 100,
        maxConcurrentFiles: 2
      }
    };
  } else {
    // Small file configuration
    return {
      performance: {
        enableChunkedReading: false,
        processingThrottle: 0,
        maxConcurrentFiles: 5
      }
    };
  }
};
```

### Environment-Based Configuration

```typescript
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV;
  const isProduction = env === 'production';
  const isStaging = env === 'staging';
  
  return {
    security: {
      maxFileSize: isProduction ? 25 * 1024 * 1024 : 100 * 1024 * 1024,
      sanitizeData: isProduction || isStaging,
      maxFilesPerWindow: isProduction ? 5 : 50
    },
    performance: {
      enableMetrics: !isProduction, // Disable in prod for performance
      processingThrottle: isProduction ? 200 : 0
    },
    accessibility: {
      announceChanges: true,
      highContrastMode: isProduction // Enable in production for compliance
    }
  };
};
```

### Feature Flag Configuration

```typescript
const getFeatureFlagConfig = (featureFlags: FeatureFlags) => {
  return {
    security: {
      sanitizeData: featureFlags.enableDataSanitization ?? true,
      maxFileSize: featureFlags.increasedFileSizeLimit ? 
        100 * 1024 * 1024 : 50 * 1024 * 1024
    },
    performance: {
      enableChunkedReading: featureFlags.enableChunkedReading ?? true,
      enableMetrics: featureFlags.enablePerformanceMetrics ?? false,
      maxConcurrentFiles: featureFlags.increasedConcurrency ? 8 : 3
    },
    accessibility: {
      announceChanges: featureFlags.enhancedAccessibility ?? true,
      highContrastMode: featureFlags.highContrastMode ?? false
    }
  };
};
```

## Best Practices

### 1. Configuration Validation

```typescript
const validateConfig = (config: SpreadsheetConfig) => {
  const errors: string[] = [];
  
  if (config.security?.maxFileSize && config.security.maxFileSize > 1000 * 1024 * 1024) {
    errors.push('File size limit exceeds recommended maximum (1GB)');
  }
  
  if (config.performance?.maxConcurrentFiles && config.performance.maxConcurrentFiles > 10) {
    errors.push('Concurrent file limit may cause performance issues');
  }
  
  if (errors.length > 0) {
    console.warn('Configuration warnings:', errors);
  }
  
  return errors.length === 0;
};
```

### 2. Configuration Documentation

Always document your configuration choices:

```typescript
const productionConfig = {
  // File size limited to 25MB for performance and security
  // Based on analysis of typical user files (95th percentile: 15MB)
  security: {
    maxFileSize: 25 * 1024 * 1024,
    // Only allow Excel and CSV for security review compliance
    allowedExtensions: ['.xlsx', '.csv']
  },
  // Conservative performance settings for stability
  performance: {
    // Chunked reading for files >1MB to prevent browser freezing
    chunkSize: 1024 * 1024,
    // Throttling prevents UI blocking during processing
    processingThrottle: 150,
    // Metrics disabled in production for performance
    enableMetrics: false
  }
};
```

### 3. Monitoring Configuration Impact

```typescript
const monitorConfig = (config: SpreadsheetConfig) => {
  // Log configuration for debugging
  console.log('Using configuration:', {
    maxFileSize: config.security?.maxFileSize,
    allowedExtensions: config.security?.allowedExtensions,
    enableMetrics: config.performance?.enableMetrics
  });
  
  // Track configuration effectiveness
  if (config.performance?.enableMetrics) {
    // Set up performance monitoring
  }
};
```

These configurations provide a solid foundation for different use cases while maintaining security and performance standards. Always test configurations thoroughly before deploying to production. 