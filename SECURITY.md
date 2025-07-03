# Security Documentation

## Overview

The Spreadsheet Mapper library includes comprehensive security features to protect against common attack vectors when processing user-uploaded files. This document outlines the security implications of different configurations and provides best practices for various deployment scenarios.

## Security Features

### File Validation

The library provides multiple layers of file validation:

#### 1. File Size Validation
- **Default**: 50MB maximum file size
- **Purpose**: Prevents DoS attacks through resource exhaustion
- **Configuration**: `config.security.maxFileSize`

```typescript
// Conservative setting for public applications
const securityConfig = {
  maxFileSize: 10 * 1024 * 1024 // 10MB
};

// More permissive for internal enterprise tools
const securityConfig = {
  maxFileSize: 100 * 1024 * 1024 // 100MB
};
```

#### 2. File Extension Validation
- **Default**: `.xlsx`, `.xls`, `.csv`
- **Purpose**: Prevents execution of malicious file types
- **Configuration**: `config.security.allowedExtensions`

```typescript
// Strict configuration - CSV only
const securityConfig = {
  allowedExtensions: ['.csv']
};

// Standard configuration
const securityConfig = {
  allowedExtensions: ['.xlsx', '.xls', '.csv']
};
```

#### 3. MIME Type Validation
- **Default**: Standard spreadsheet MIME types
- **Purpose**: Prevents file type spoofing attacks
- **Configuration**: `config.security.allowedMimeTypes`

```typescript
const securityConfig = {
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/csv'
  ]
};
```

### Data Sanitization

#### XSS Protection
- **Default**: Enabled
- **Purpose**: Prevents cross-site scripting attacks through malicious cell content
- **Configuration**: `config.security.sanitizeData`

The sanitization process:
1. Removes HTML/script tags
2. Neutralizes JavaScript protocols
3. Strips event handlers
4. Preserves legitimate data content

```typescript
// Maximum security - always sanitize
const securityConfig = {
  sanitizeData: true
};

// Only disable for trusted internal data sources
const securityConfig = {
  sanitizeData: false // Use with extreme caution
};
```

### Rate Limiting

Prevents DoS attacks by limiting file processing frequency:

- **Default**: 10 files per minute per client
- **Configuration**: `config.security.maxFilesPerWindow` and `config.security.rateLimitWindow`

```typescript
// Strict rate limiting for public APIs
const securityConfig = {
  maxFilesPerWindow: 5,
  rateLimitWindow: 60000 // 1 minute
};

// More permissive for internal tools
const securityConfig = {
  maxFilesPerWindow: 20,
  rateLimitWindow: 60000
};
```

## Security Implications by Configuration

### High Security Configuration (Public Applications)

**Use Case**: Public-facing applications, untrusted users, compliance requirements

```typescript
const highSecurityConfig = {
  security: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.csv'], // CSV only
    allowedMimeTypes: ['text/csv', 'application/csv'],
    sanitizeData: true, // Always sanitize
    maxFilesPerWindow: 3, // Very restrictive
    rateLimitWindow: 60000
  },
  performance: {
    enableChunkedReading: true,
    chunkSize: 512 * 1024, // Smaller chunks
    processingThrottle: 500, // Longer delays
    maxConcurrentFiles: 1 // Process one at a time
  }
};
```

**Security Benefits**:
- Minimal attack surface (CSV only)
- Low resource consumption
- Strong DoS protection
- Maximum data sanitization

**Trade-offs**:
- Limited file format support
- Slower processing
- Lower throughput

### Medium Security Configuration (Enterprise Internal)

**Use Case**: Internal enterprise applications, authenticated users, controlled environment

```typescript
const mediumSecurityConfig = {
  security: {
    maxFileSize: 50 * 1024 * 1024, // 50MB (default)
    allowedExtensions: ['.xlsx', '.xls', '.csv'],
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ],
    sanitizeData: true,
    maxFilesPerWindow: 10, // Standard rate limiting
    rateLimitWindow: 60000
  },
  performance: {
    enableChunkedReading: true,
    chunkSize: 1024 * 1024, // 1MB chunks
    processingThrottle: 100,
    maxConcurrentFiles: 3
  }
};
```

**Security Benefits**:
- Balanced protection and functionality
- Support for common formats
- Reasonable performance
- Data sanitization enabled

**Trade-offs**:
- Moderate resource usage
- Some processing overhead

### Low Security Configuration (Development/Testing)

**Use Case**: Development environments, trusted data sources, testing scenarios

```typescript
const lowSecurityConfig = {
  security: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedExtensions: ['.xlsx', '.xls', '.csv', '.ods'],
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
      'application/vnd.oasis.opendocument.spreadsheet'
    ],
    sanitizeData: false, // Disabled for performance
    maxFilesPerWindow: 50,
    rateLimitWindow: 60000
  },
  performance: {
    enableChunkedReading: false, // Disabled for speed
    processingThrottle: 0, // No throttling
    maxConcurrentFiles: 10 // High concurrency
  }
};
```

**⚠️ WARNING**: This configuration should NEVER be used in production environments.

## Security Best Practices

### 1. Environment-Specific Configuration

Always use appropriate security settings based on your deployment environment:

```typescript
const getSecurityConfig = (environment: string) => {
  switch (environment) {
    case 'production':
      return highSecurityConfig;
    case 'staging':
      return mediumSecurityConfig;
    case 'development':
      return lowSecurityConfig;
    default:
      return highSecurityConfig; // Fail secure
  }
};
```

### 2. Input Validation Beyond File Processing

Implement additional validation at the application level:

```typescript
const validateBusinessRules = (data: SpreadsheetData) => {
  // Implement business-specific validation
  // e.g., required columns, data format validation, etc.
};
```

### 3. Error Handling

The library uses secure error handling by default, avoiding information disclosure:

```typescript
// Secure: Generic error messages
try {
  const data = await SpreadSheetService(file, config);
} catch (error) {
  // Error messages don't expose internal details
  console.error('File processing failed:', error.message);
}
```

### 4. Monitoring and Logging

Implement security monitoring:

```typescript
const securityMonitor = {
  logRateLimitExceeded: (clientId: string) => {
    console.warn(`Rate limit exceeded for client: ${clientId}`);
    // Send to monitoring system
  },
  
  logSuspiciousFile: (file: File, reason: string) => {
    console.warn(`Suspicious file detected: ${file.name}, reason: ${reason}`);
    // Send to security monitoring
  }
};
```

## Compliance Considerations

### GDPR/Privacy
- File processing happens client-side
- No data is transmitted to external servers by default
- Implement appropriate data retention policies in your application

### PCI DSS
- If processing files with payment data, use high security configuration
- Implement additional encryption for sensitive data
- Regular security audits recommended

### HIPAA
- Use high security configuration
- Implement audit logging
- Consider additional encryption requirements

## Vulnerability Reporting

If you discover a security vulnerability in the Spreadsheet Mapper library, please report it responsibly:

1. **Do not** create public GitHub issues for security vulnerabilities
2. Email security reports to: [security@your-domain.com]
3. Include detailed steps to reproduce the issue
4. Allow reasonable time for response and remediation

## Regular Security Maintenance

### Updates
- Keep the library updated to the latest version
- Monitor security advisories for dependencies
- Regular dependency audits using `npm audit`

### Testing
- Include security test cases in your application
- Test with malicious file samples
- Regular penetration testing for production applications

### Configuration Review
- Periodic review of security configurations
- Adjust settings based on threat landscape changes
- Document configuration decisions and rationale 