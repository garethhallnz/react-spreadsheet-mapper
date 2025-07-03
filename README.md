# �� React Spreadsheet Mapper

[![npm version](https://img.shields.io/npm/v/react-spreadsheet-mapper.svg)](https://www.npmjs.com/package/react-spreadsheet-mapper)
[![Build Status](https://github.com/garethhallnz/react-spreadsheet-mapper/actions/workflows/ci.yml/badge.svg)](https://github.com/garethhallnz/react-spreadsheet-mapper/actions)
[![Coverage Status](https://img.shields.io/coveralls/github/garethhallnz/react-spreadsheet-mapper/main.svg?style=flat)](https://coveralls.io/github/garethhallnz/react-spreadsheet-mapper?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-16.8%2B-blue.svg)](https://reactjs.org/)

## 🚀 What is Spreadsheet Mapper?

Spreadsheet Mapper is a headless React library that transforms the tedious process of mapping spreadsheet columns to your application's data structure into an intuitive, user-friendly experience. Whether you're building a CRM, e-commerce platform, or any application that needs to import Excel/CSV data, this library provides the building blocks for a seamless data mapping interface.

### ✨ Key Features

- **🎯 Headless Design** - Complete UI control while handling complex mapping logic
- **📁 Multi-File Support** - Process multiple spreadsheets simultaneously
- **🔒 Built-in Security** - File validation, sanitization, and size limits
- **⚡ Performance Optimized** - Chunked reading for large files with metrics
- **♿ Accessibility First** - WCAG compliant with screen reader support
- **🎨 Framework Agnostic** - Works with any UI library (Material-UI, Ant Design, Tailwind, etc.)
- **📊 Rich Data Preview** - Show sample data before final import
- **🛡️ TypeScript Native** - Full type safety and IntelliSense support

## 🔒 Security Features

Spreadsheet Mapper includes comprehensive security protections:

- **File Validation** - Size limits, extension filtering, and MIME type verification
- **XSS Protection** - Automatic data sanitization to prevent script injection
- **Rate Limiting** - Configurable per-client processing limits
- **Memory Protection** - Column and row limits to prevent resource exhaustion
- **Secure Error Handling** - Generic error messages to prevent information disclosure
- **Chunked Processing** - Large file handling without memory overflow

See our [Security Guide](SECURITY.md) for detailed configuration options.

## 🎯 Perfect For

- **Data Import Wizards** - Build multi-step import flows for your users
- **CRM Systems** - Import contacts, leads, and customer data
- **E-commerce Platforms** - Bulk product imports and inventory management
- **Financial Applications** - Transaction and reporting data imports
- **HR Systems** - Employee data and payroll imports

## 🔧 Quick Start

### Installation

```bash
npm install react-spreadsheet-mapper
# or
yarn add react-spreadsheet-mapper
```

### Basic Usage

```tsx
import React from 'react';
import useSpreadsheetMapper from 'react-spreadsheet-mapper';
import type { SpreadsheetData } from 'react-spreadsheet-mapper';

const DataImporter = () => {
  const options = [
    { label: 'Full Name', value: 'name', required: true },
    { label: 'Email Address', value: 'email', required: true },
    { label: 'Phone Number', value: 'phone' },
  ];

  const config = {
    headerRow: 1,
    previewRowCount: 5,
    security: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      sanitizeData: true
    },
    performance: {
      enableMetrics: true
    },
    accessibility: {
      announceChanges: true
    }
  };

  const onFinish = (mappedData: SpreadsheetData & { map: { field: string; value: string }[] }) => {
    // Send to your API
    console.log('Ready to import:', mappedData);
  };

  const {
    map,
    errors,
    processedFiles,
    isProcessing,
    updateOrCreate,
    save,
    handleFiles,
    handleFileFinish,
    announce,
    getPerformanceSummary
  } = useSpreadsheetMapper({ 
    options, 
    onFinish, 
    config,
    clientId: 'my-app',
    onAnnounce: (message, type) => {
      console.log(`${type}: ${message}`);
    }
  });

  return (
    <div>
      <input 
        type="file" 
        multiple 
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        accept=".xlsx,.xls,.csv"
        disabled={isProcessing}
      />
      
      {errors.length > 0 && (
        <div role="alert">
          {errors.map((error, index) => (
            <p key={index} style={{ color: 'red' }}>
              {error.message}
            </p>
          ))}
        </div>
      )}
      
      {processedFiles.map((file) => (
        <div key={file.name}>
          <h3>{file.name}</h3>
          {options.map((option) => {
            const mapped = map.find(m => m.value === option.value);
            return (
              <div key={option.value}>
                <label>{option.label} {option.required && '*'}</label>
                <select
                  value={mapped?.field || ''}
                  onChange={(e) => updateOrCreate({
                    field: e.target.value,
                    value: option.value
                  })}
                >
                  <option value="">Select column...</option>
                  {file.columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <button onClick={() => save(option.value)}>
                  {mapped?.saved ? 'Change' : 'Save'}
                </button>
              </div>
            );
          })}
          <button onClick={() => handleFileFinish(file)}>
            Import Data
          </button>
        </div>
      ))}
      
      {getPerformanceSummary() && (
        <div>
          <h4>Performance Summary</h4>
          <p>Files: {getPerformanceSummary()?.totalFiles}</p>
          <p>Total Size: {((getPerformanceSummary()?.totalSize || 0) / 1024 / 1024).toFixed(2)}MB</p>
        </div>
      )}
    </div>
  );
};
```

## 🚀 Advanced Features

### Multi-File Processing

Process multiple spreadsheets simultaneously with progress tracking:

```tsx
const {
  processedFiles,
  fileProcessingStates,
  isProcessing,
  getPerformanceSummary
} = useSpreadsheetMapper({ options, onFinish, config });

// Track processing progress
const completedFiles = fileProcessingStates.filter(state => state.status === 'completed').length;
const totalFiles = fileProcessingStates.length;

return (
  <div>
    {isProcessing && (
      <div>Processing {completedFiles} of {totalFiles} files...</div>
    )}
    
    {processedFiles.map(file => (
      <FileMapper key={file.name} file={file} />
    ))}
  </div>
);
```

### Performance Monitoring

Built-in performance tracking for enterprise applications:

```tsx
const performanceSummary = getPerformanceSummary();

if (performanceSummary) {
  console.log('Performance Summary:', {
    totalFiles: performanceSummary.totalFiles,
    totalSize: `${(performanceSummary.totalSize / 1024 / 1024).toFixed(2)}MB`,
    averageTime: `${performanceSummary.averageProcessingTime.toFixed(2)}ms`,
    totalRows: performanceSummary.totalRows
  });
}
```

### Direct File Processing

Use the SpreadSheetService directly for custom workflows:

```tsx
import { SpreadSheetService } from 'react-spreadsheet-mapper';

const processCustomFile = async (file: File) => {
  const data = await SpreadSheetService(file, {
    security: { maxFileSize: 25 * 1024 * 1024 },
    performance: { enableMetrics: true, enableChunkedReading: true }
  });
  
  return {
    fileName: data.name,
    columns: data.columns,
    rowCount: data.data.length,
    processingTime: data.metrics?.processingTime
  };
};
```

## 🎨 Live Examples

Try out Spreadsheet Mapper with different UI frameworks:

| Framework | Demo | Source |
|-----------|------|--------|
| **Minimal** | [View Demo](examples/minimal) | [Source Code](examples/minimal/src/App.tsx) |
| **Material-UI** | [View Demo](examples/material-ui) | [Source Code](examples/material-ui/src/App.tsx) |
| **Ant Design** | [View Demo](examples/ant-design) | [Source Code](examples/ant-design/src/App.tsx) |
| **Shadcn/UI** | [View Demo](examples/shadcn-ui) | [Source Code](examples/shadcn-ui/src/App.tsx) |
| **Mantine** | [View Demo](examples/mantine) | [Source Code](examples/mantine/src/App.tsx) |
| **React Bootstrap** | [View Demo](examples/react-bootstrap) | [Source Code](examples/react-bootstrap/src/App.tsx) |
| **Flowbite React** | [View Demo](examples/flowbite-react) | [Source Code](examples/flowbite-react/src/App.tsx) |
| **Advanced Features** | [View Demo](examples/advanced) | [Source Code](examples/advanced/src/App.tsx) |

### Run Examples Locally

```bash
# Clone the repository
git clone https://github.com/your-username/react-spreadsheet-mapper.git
cd react-spreadsheet-mapper

# Install dependencies
npm install

# Start any example
npm run start:example:material-ui
npm run start:example:ant-design
npm run start:example:shadcn-ui
# ... or any other example
```

## 🔧 Configuration Options

### Security Configuration

```tsx
const securityConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedExtensions: ['.xlsx', '.xls', '.csv'],
  allowedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  sanitizeData: true,
  maxFilesPerWindow: 10,
  rateLimitWindow: 60000, // 1 minute
};
```

### Performance Configuration

```tsx
const performanceConfig = {
  enableChunkedReading: true,
  chunkSize: 1024 * 1024, // 1MB
  processingThrottle: 100,
  enableMetrics: true,
  maxConcurrentFiles: 3,
};
```

### Accessibility Configuration

```tsx
const accessibilityConfig = {
  announceChanges: true,
  highContrastMode: false,
  ariaLabels: {
    fileInput: 'Upload spreadsheet file',
    mappingSelect: 'Map column to field',
    saveButton: 'Save column mapping',
    finishButton: 'Complete import process',
  },
};
```

## 📚 API Reference

### `useSpreadsheetMapper(options)`

The main React hook for spreadsheet mapping functionality.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `MappingOption[]` | Array of field options for mapping |
| `onFinish` | `(data: MappedResult) => void` | Callback when mapping is complete |
| `config` | `SpreadsheetConfig` | Configuration options (optional) |
| `clientId` | `string` | Client identifier for rate limiting (optional, defaults to 'default') |
| `onAnnounce` | `(message: string, type?: 'success' \| 'error' \| 'info') => void` | Accessibility announcement callback (optional) |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `map` | `MappedField[]` | Current field mappings |
| `errors` | `MappingError[]` | Validation errors and warnings |
| `processedFiles` | `SpreadsheetData[]` | Loaded spreadsheet files |
| `fileProcessingStates` | `FileProcessingState[]` | Processing state for each file |
| `isProcessing` | `boolean` | Whether any files are currently processing |
| `performanceMetrics` | `PerformanceMetrics[]` | Performance data for processed files |
| `updateOrCreate` | `(field: MappedField) => void` | Update or create mapping |
| `save` | `(value: string) => void` | Save a mapping |
| `finish` | `() => void` | Validate all required mappings |
| `handleFiles` | `(files: File[]) => void` | Process uploaded files |
| `handleFileFinish` | `(file: SpreadsheetData) => void` | Complete file import |
| `reset` | `() => void` | Reset all mappings and state |
| `getPerformanceSummary` | `() => PerformanceSummary \| null` | Get aggregated performance metrics |
| `announce` | `(message: string, type?: 'success' \| 'error' \| 'info') => void` | Trigger accessibility announcement |

### `SpreadSheetService(file, config?, clientId?)`

Direct file processing service for advanced use cases.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | `File` | The spreadsheet file to process |
| `config` | `SpreadsheetConfig` | Configuration options (optional) |
| `clientId` | `string` | Client identifier for rate limiting (optional) |

#### Returns

`Promise<SpreadsheetData>` - Processed spreadsheet data

### TypeScript Types and Interfaces

The library exports comprehensive TypeScript definitions:

```tsx
import type {
  // Configuration
  SpreadsheetConfig,
  SecurityConfig,
  PerformanceConfig,
  AccessibilityConfig,
  
  // Data structures
  SpreadsheetData,
  MappedField,
  MappingOption,
  MappingError,
  PerformanceMetrics,
  
  // Utility types
  CellValue,
  SpreadsheetRow,
  SpreadsheetMatrix,
  FileValidationResult,
  RateLimitState
} from 'react-spreadsheet-mapper';
```

## 🏗️ Architecture

### Monorepo Structure

```
react-spreadsheet-mapper/
├── packages/
│   └── spreadsheet-mapper/     # Core library
├── examples/                   # Framework examples
│   ├── minimal/               # Basic implementation
│   ├── material-ui/           # Material-UI styling
│   ├── ant-design/            # Ant Design components
│   ├── shadcn-ui/             # Shadcn/UI components
│   └── ...                    # More UI frameworks
└── scripts/                   # Development tools
```

### Core Package

- **🔧 [`SpreadsheetService`](packages/spreadsheet-mapper/SpreadsheetService.ts)** - File processing engine
- **⚛️ [`useSpreadsheetMapper`](packages/spreadsheet-mapper/useSpreadsheetMapper.ts)** - Main React hook
- **📋 [`types.ts`](packages/spreadsheet-mapper/types.ts)** - TypeScript definitions

## 🚀 Development

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/react-spreadsheet-mapper.git
cd react-spreadsheet-mapper

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Start development with examples
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- File processing powered by [xlsx](https://github.com/SheetJS/sheetjs)
- Inspired by the need for better data import experiences

## 📞 Support

- 📖 [Documentation](https://github.com/your-username/react-spreadsheet-mapper/wiki)
- 🐛 [Issue Tracker](https://github.com/your-username/react-spreadsheet-mapper/issues)
- 💬 [Discussions](https://github.com/your-username/react-spreadsheet-mapper/discussions)

---

Made with ❤️ by developers who believe data import shouldn't be painful.