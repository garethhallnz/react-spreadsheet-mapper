# React Spreadsheet Mapper

A headless React library for mapping spreadsheet data with TypeScript support.

## Features

- 🚀 **Headless**: Works with any UI library (Material-UI, Ant Design, Tailwind, etc.)
- 📊 **Multi-format Support**: Excel (.xlsx, .xls) and CSV files
- 🎯 **TypeScript**: Full TypeScript support with type safety
- ⚡ **Performance**: Built-in performance monitoring and optimization
- 🔒 **Security**: File validation and security features
- ♿ **Accessibility**: ARIA labels and keyboard navigation support
- 🧪 **Well Tested**: Comprehensive test coverage

## Installation

```bash
npm install react-spreadsheet-mapper
```

## Quick Start

```tsx
import React from 'react';
import useSpreadsheetMapper from 'react-spreadsheet-mapper';

function MyComponent() {
  const options = [
    { label: 'Name', value: 'name', required: true },
    { label: 'Email', value: 'email', required: true },
    { label: 'Phone', value: 'phone' },
  ];

  const onFinish = (data) => {
    console.log('Mapped data:', data);
    // Send to your API
  };

  const {
    map,
    errors,
    processedFiles,
    updateOrCreate,
    save,
    handleFiles,
    handleFileFinish,
  } = useSpreadsheetMapper({ options, onFinish });

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
      
      {processedFiles.map((file, index) => (
        <div key={index}>
          <h3>{file.name}</h3>
          {options.map((option) => {
            const mappedField = map.find(item => item.value === option.value);
            return (
              <div key={option.value}>
                <label>{option.label}</label>
                <select
                  value={mappedField?.field || ''}
                  onChange={(e) => updateOrCreate({
                    field: e.target.value,
                    value: option.value,
                  })}
                >
                  <option value="">Select column...</option>
                  {file.columns.map(column => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
                <button onClick={() => save(option.value)}>
                  Save Mapping
                </button>
              </div>
            );
          })}
          <button onClick={() => handleFileFinish(file)}>
            Process File
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Configuration

```tsx
const config = {
  headerRow: 1,           // Row containing headers (1-indexed)
  omitHeader: false,      // Whether to omit header row from data
  dataStartRow: 2,        // Row where data starts (1-indexed)
  sheet: 0,              // Sheet index to process (0-indexed)
  previewRowCount: 5,    // Number of preview rows to show
  security: {
    maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    allowedExtensions: ['.csv', '.xlsx', '.xls']
  },
  performance: {
    enableMetrics: true,
    batchSize: 1000
  },
  accessibility: {
    ariaLabels: {
      fileInput: 'Upload spreadsheet file',
      mappingSelect: 'Map column to field'
    }
  }
};

const { ... } = useSpreadsheetMapper({ options, onFinish, config });
```

## API Reference

### useSpreadsheetMapper(params)

#### Parameters

- `options` - Array of mapping options
- `onFinish` - Callback when mapping is complete
- `config` - Optional configuration object

#### Returns

- `map` - Current field mappings
- `errors` - Any processing errors
- `processedFiles` - Array of processed files
- `updateOrCreate` - Update or create a mapping
- `save` - Save a specific mapping
- `handleFiles` - Process uploaded files
- `handleFileFinish` - Complete processing for a file
- `reset` - Reset all state

## Examples

Check out our [examples repository](https://github.com/garethhallnz/react-spreadsheet-mapper/tree/main/examples) for implementations with:

- Material-UI
- Ant Design  
- React Bootstrap
- Tailwind CSS (shadcn/ui)
- Flowbite React
- Mantine
- Minimal setup

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import { 
  SpreadsheetConfig, 
  SpreadsheetData, 
  MappedField, 
  MappingOption 
} from 'react-spreadsheet-mapper';
```

## License

MIT

## Contributing

Contributions are welcome! Please read our [contributing guidelines](https://github.com/garethhallnz/react-spreadsheet-mapper/blob/main/CONTRIBUTING.md).

## Support

- [GitHub Issues](https://github.com/garethhallnz/react-spreadsheet-mapper/issues)
- [Documentation](https://github.com/garethhallnz/react-spreadsheet-mapper#readme) 