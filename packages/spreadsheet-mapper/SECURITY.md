# Security Guide

This document provides comprehensive security guidelines and configuration options for the react-spreadsheet-mapper library.

## Security Configuration

The library provides robust security features through the `security` configuration object:

```typescript
const config: SpreadsheetConfig = {
  security: {
    maxFileSize: 50 * 1024 * 1024, // 50MB (default)
    allowedExtensions: ['.xlsx', '.xls', '.csv'], // Default allowed extensions
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ],
    sanitizeData: true, // Enable XSS protection (default: true)
    maxFilesPerWindow: 10, // Rate limiting (default: 10 files per minute)
    rateLimitWindow: 60000 // Rate limit window in milliseconds
  }
};
```

## Security Features

### 1. File Size Validation

**Purpose**: Prevents memory exhaustion and DoS attacks through large file uploads.

**Default**: 50MB maximum file size

**Configuration**:
```typescript
security: {
  maxFileSize: 25 * 1024 * 1024 // 25MB limit
}
```

**Security Impact**: 
- Prevents memory-based DoS attacks
- Reduces server load
- Improves user experience with clear error messages

### 2. File Extension Validation

**Purpose**: Prevents malicious file uploads by restricting allowed file types.

**Default**: `.xlsx`, `.xls`, `.csv`

**Configuration**:
```typescript
security: {
  allowedExtensions: ['.xlsx', '.csv'] // Only Excel and CSV files
}
```

**Security Impact**:
- Prevents execution of malicious scripts disguised as spreadsheets
- Reduces attack surface
- Enforces expected file formats

### 3. MIME Type Validation

**Purpose**: Provides additional layer of file type validation beyond extensions.

**Default**: Standard spreadsheet MIME types

**Configuration**:
```typescript
security: {
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
}
```

**Security Impact**:
- Prevents MIME type spoofing attacks
- More reliable than extension-only validation
- Browser-level security enforcement

### 4. Data Sanitization

**Purpose**: Prevents XSS attacks through malicious cell content.

**Default**: Enabled

**Configuration**:
```typescript
security: {
  sanitizeData: true // Enable XSS protection
}
```

**What it does**:
- Removes HTML/script tags from cell values
- Strips dangerous JavaScript protocols
- Cleans event handlers (onclick, onload, etc.)

**Security Impact**:
- Prevents stored XSS attacks
- Safe display of user-generated content
- Maintains data integrity while removing threats

### 5. Rate Limiting

**Purpose**: Prevents abuse and DoS attacks through excessive file processing.

**Default**: 10 files per minute per client

**Configuration**:
```typescript
security: {
  maxFilesPerWindow: 5, // 5 files maximum
  rateLimitWindow: 30000 // In 30 seconds
}
```

**Security Impact**:
- Prevents resource exhaustion
- Limits automated attacks
- Fair usage enforcement

### 6. Error Message Security

**Purpose**: Prevents information disclosure through error messages.

**Implementation**: 
- Generic error messages for security failures
- Detailed errors only in development mode
- No internal system information exposure

**Security Impact**:
- Prevents system fingerprinting
- Reduces information leakage
- Professional error handling

## Configuration Examples

### Enterprise Security (High Security)

```typescript
const enterpriseConfig: SpreadsheetConfig = {
  security: {
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    allowedExtensions: ['.xlsx'], // Only modern Excel files
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    sanitizeData: true,
    maxFilesPerWindow: 3, // Strict rate limiting
    rateLimitWindow: 60000
  },
  performance: {
    maxConcurrentFiles: 1, // Process one file at a time
    enableMetrics: true, // Monitor for anomalies
    processingThrottle: 200 // Add processing delay
  }
};
```

### Personal Application (Balanced Security)

```typescript
const personalConfig: SpreadsheetConfig = {
  security: {
    maxFileSize: 50 * 1024 * 1024, // 50MB (default)
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
  performance: {
    maxConcurrentFiles: 3,
    enableMetrics: false
  }
};
```

### Development Environment (Relaxed Security)

```typescript
const devConfig: SpreadsheetConfig = {
  security: {
    maxFileSize: 100 * 1024 * 1024, // 100MB for testing
    allowedExtensions: ['.xlsx', '.xls', '.csv', '.tsv'], // Include test formats
    sanitizeData: true, // Always keep sanitization enabled
    maxFilesPerWindow: 50, // High limit for testing
    rateLimitWindow: 60000
  },
  performance: {
    maxConcurrentFiles: 5,
    enableMetrics: true // Monitor performance during development
  }
};
```

## Security Best Practices

### 1. Client-Side Implementation

```typescript
import { useSpreadsheetMapper } from 'react-spreadsheet-mapper';

const MyComponent = () => {
  const mapper = useSpreadsheetMapper({
    options: mappingOptions,
    onFinish: handleFinish,
    config: enterpriseConfig, // Use appropriate security config
    clientId: 'user-' + userId, // Unique client identifier for rate limiting
    onAnnounce: (message, type) => {
      // Handle accessibility announcements
      if (type === 'error') {
        // Log security events for monitoring
        console.warn('Security event:', message);
      }
    }
  });

  return (
    <div>
      {/* Your UI implementation */}
    </div>
  );
};
```

### 2. Error Handling

```typescript
const handleFinish = (data) => {
  try {
    // Process the mapped data
    processSpreadsheetData(data);
  } catch (error) {
    // Don't expose internal errors to users
    showUserMessage('Processing failed. Please try again.');
    
    // Log detailed errors for developers
    console.error('Internal processing error:', error);
  }
};
```

### 3. File Validation Feedback

```typescript
const handleFiles = (files: File[]) => {
  // Pre-validate files before processing
  const oversizedFiles = files.filter(file => file.size > config.security.maxFileSize);
  
  if (oversizedFiles.length > 0) {
    showUserMessage(
      `${oversizedFiles.length} file(s) exceed the maximum size limit. Please reduce file size and try again.`
    );
    return;
  }
  
  // Proceed with processing
  mapper.handleFiles(files);
};
```

## Security Monitoring

### Performance Metrics for Security

Monitor these metrics to detect potential security issues:

```typescript
const performanceSummary = mapper.getPerformanceSummary();

if (performanceSummary) {
  // Monitor for anomalies
  if (performanceSummary.averageProcessingTime > 5000) {
    console.warn('Unusually long processing time detected');
  }
  
  if (performanceSummary.averageFileSize > 25 * 1024 * 1024) {
    console.warn('Large average file size detected');
  }
}
```

### Security Event Logging

```typescript
const onAnnounce = (message: string, type: 'success' | 'error' | 'info') => {
  if (type === 'error') {
    // Log security events for monitoring
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      clientId: currentClientId,
      message,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }
};
```

## Compliance Considerations

### GDPR/Privacy

- No personal data is stored in memory longer than necessary
- File processing is client-side only
- No data transmission to external servers
- Clear error messages without exposing personal information

### Security Standards

- Input validation on all file inputs
- XSS prevention through data sanitization
- Rate limiting to prevent abuse
- Secure error handling
- Resource limits to prevent DoS

## Updating Security Configuration

When updating security settings, consider:

1. **Backward Compatibility**: Ensure existing implementations continue to work
2. **User Impact**: More restrictive settings may require user communication
3. **Performance**: Stricter validation may impact processing speed
4. **Testing**: Validate all security measures in your specific environment

## Reporting Security Issues

If you discover a security vulnerability in this library, please report it responsibly:

1. Do not create public GitHub issues for security vulnerabilities
2. Contact the maintainers privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Security Changelog

Track security updates and improvements:

- **v1.0.0**: Initial security implementation
  - File size validation
  - Extension and MIME type filtering
  - XSS protection through data sanitization
  - Rate limiting
  - Secure error handling 