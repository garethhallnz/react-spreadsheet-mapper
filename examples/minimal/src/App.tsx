import React, { useCallback, useState, useRef } from 'react';
import useSpreadsheetMapper from 'react-spreadsheet-mapper';
import './style.css';
import { MappedField } from './types';

// Define types locally to match the hook's interface
interface SpreadsheetData {
  name: string;
  columns: string[];
  data: Record<string, unknown>[];
}

// Updated type for the final mapped data result
type MappedResult = SpreadsheetData & { map: { field: string; value: string }[] };

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const config = {
    headerRow: 1,
    omitHeader: false,
    dataStartRow: 2,
    sheet: 0,
    previewRowCount: 5,
  };

  const options = [
    { label: 'Name', value: 'name', required: true },
    { label: 'Email', value: 'email', required: true },
    { label: 'Phone', value: 'phone' },
  ];

  const [mappedData, setMappedData] = useState<MappedResult | null>(null);

  const onFinish = useCallback((data: MappedResult) => {
    setMappedData(data);
    
    // TODO: Add your server interaction here
    console.log('📡 Server Integration Point: Add your API call here to post the mapped data to your server');
    console.log('Mapped data ready for server:', data);
    console.log('Example: fetch("/api/upload", { method: "POST", body: JSON.stringify(data) })');
  }, []);

  const {
    map,
    errors,
    processedFiles,
    updateOrCreate,
    save,
    handleFiles,
    handleFileFinish,
    reset: resetMapper,
  } = useSpreadsheetMapper({ options, onFinish, config });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  };

  const handleReset = () => {
    resetMapper();
    setMappedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAvailableColumns = (file: SpreadsheetData, currentValue: string) => {
    const mappedColumns = map.map((item: MappedField) => item.field);
    return file.columns.filter((column: string) => !mappedColumns.includes(column) || column === currentValue);
  };


  return (
    <div className="container">
      <h1>Spreadsheet Mapper</h1>
      <div className="file-input-container">
        <input type="file" multiple onChange={handleFileChange} id="file-input" ref={fileInputRef} />
        <label htmlFor="file-input" className="primary-button">Upload File</label>
      </div>
      {processedFiles.map((file: SpreadsheetData, index: number) => {
        if (!file || !file.columns) {
          return null;
        }
        return (
          <div key={file.name || index} className="file-details">
            <h3>{file.name}</h3>
            <div className="column-mappings-container">
              {options.map((option) => {
                const mappedField = map.find((item: MappedField) => item.value === option.value);
                const isSaved = mappedField && mappedField.saved;

                return (
                  <div key={option.value} className="column-mapping">
                    <h4>{option.label}</h4>
                    <select
                      value={mappedField ? mappedField.field : ''}
                      disabled={isSaved}
                      onChange={(e) =>
                        updateOrCreate({
                          field: e.target.value,
                          value: option.value,
                        })
                      }
                    >
                      <option value="">Select a column</option>
                      {getAvailableColumns(file, mappedField ? mappedField.field : '').map((column: string) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => save(option.value)} className="secondary-button">{isSaved ? 'Change' : 'Save'}</button>
                    {mappedField && (
                      <ul className="sample-data">
                        {file.data.map((row: Record<string, unknown>, rowIndex: number) => (
                          <li key={rowIndex}>{String(row[mappedField.field] || '')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="actions-container">
              <button onClick={() => handleFileFinish(file)} className="primary-button">Import</button>
              <button onClick={handleReset} className="secondary-button">Reset</button>
            </div>
          </div>
        );
      })}
      {errors.map((error: { message: string }, index: number) => (
        <p key={index} className="error-message">
          {error.message}
        </p>
      ))}
      {mappedData && (
        <div className="mapped-data-container">
          <h2>Mapped Data:</h2>
          <pre>{JSON.stringify(mappedData, null, 2)}</pre>
        </div>
      )}
      {!mappedData && !processedFiles.length && <p className="info-message">Upload a spreadsheet file to see mapped data.</p>}
    </div>
  );
};

export default App;
