import React, { useCallback, useState, useRef } from 'react';
import useSpreadsheetMapper from 'react-spreadsheet-mapper';
import { MappedField } from './types';
import { Button, Card, Select, Label, Alert } from 'flowbite-react';
import { HiUpload, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Spreadsheet Mapper
          </h1>
          <p className="text-xl text-gray-600 font-medium">Flowbite React Edition</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>
        
        {/* Upload Section */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <Button 
              size="xl" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl px-8 py-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <HiUpload className="mr-3 h-5 w-5" />
              Choose Spreadsheet File
            </Button>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv,.xlsx,.xls"
            />
          </div>
        </div>

        {/* File Processing Cards */}
        {processedFiles.map((file: SpreadsheetData, index: number) => {
          if (!file || !file.columns) {
            return null;
          }
          return (
            <Card key={file.name || index} className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="p-8">
                {/* File Header */}
                <div className="flex items-center mb-8 pb-6 border-b border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <HiCheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{file.name}</h3>
                    <p className="text-gray-600">File processed successfully • {file.data.length} rows found</p>
                  </div>
                </div>

                {/* Column Mapping Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {options.map((option) => {
                    const mappedField = map.find((item: MappedField) => item.value === option.value);
                    const isSaved = mappedField && mappedField.saved;

                    return (
                      <div key={option.value} className="space-y-4">
                        {/* Field Header */}
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${option.required ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                          <Label 
                            htmlFor={`${option.value}-select`} 
                            value={option.label} 
                            className="text-lg font-semibold text-gray-700" 
                          />
                          {option.required && <span className="text-red-500 text-sm font-medium">Required</span>}
                        </div>

                        {/* Column Selector */}
                        <div className={`relative ${isSaved ? 'opacity-75' : ''}`}>
                          <Select
                            id={`${option.value}-select`}
                            value={mappedField ? mappedField.field : ''}
                            disabled={isSaved}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                              updateOrCreate({
                                field: e.target.value,
                                value: option.value,
                              })
                            }
                            className="text-base"
                          >
                            <option value="">Select a column</option>
                            {getAvailableColumns(file, mappedField ? mappedField.field : '').map((column: string) => (
                              <option key={column} value={column}>
                                {column}
                              </option>
                            ))}
                          </Select>
                          {isSaved && (
                            <div className="absolute inset-y-0 right-10 flex items-center">
                              <HiCheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          )}
                        </div>

                        {/* Save/Change Button */}
                        <Button 
                          size="sm" 
                          color={isSaved ? "light" : "blue"}
                          onClick={() => save(option.value)}
                          className={`w-full font-medium ${
                            isSaved 
                              ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isSaved ? 'Change Mapping' : 'Save Mapping'}
                        </Button>

                        {/* Data Preview */}
                        {mappedField && (
                          <div className="mt-4">
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                              <div className="text-sm font-medium text-gray-600 mb-2">Sample Data:</div>
                              <div className="space-y-1">
                                {file.data.slice(0, 5).map((row: Record<string, unknown>, rowIndex: number) => (
                                  <div key={rowIndex} className="px-3 py-2 bg-white rounded border text-sm text-gray-800 shadow-sm">
                                    {String(row[mappedField.field] || '')}
                                  </div>
                                ))}
                                {file.data.length > 5 && (
                                  <div className="text-xs text-gray-500 text-center pt-2">
                                    ... and {file.data.length - 5} more rows
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-6 pt-6 border-t border-gray-200">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => handleFileFinish(file)}
                  >
                    <HiCheckCircle className="mr-2 h-5 w-5" />
                    Import Data
                  </Button>
                  <Button 
                    size="lg"
                    color="light" 
                    onClick={handleReset}
                    className="px-8 py-3 font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                  >
                    Reset All
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Error Messages */}
        {errors.map((error: { message: string }, index: number) => (
          <Alert key={index} color="failure" className="mb-6 shadow-lg">
            <HiExclamationCircle className="h-5 w-5" />
            <span className="font-medium">Error occurred:</span> {error.message}
          </Alert>
        ))}

        {/* Mapped Data Results */}
        {mappedData && (
          <Card className="mt-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                  <HiCheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Mapping Complete!</h2>
                  <p className="text-gray-600">Your data has been successfully processed and mapped</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 shadow-inner">
                <pre className="text-green-400 font-mono text-sm overflow-auto leading-relaxed">
                  {JSON.stringify(mappedData, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!mappedData && !processedFiles.length && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiUpload className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">Ready to Process Your Data</h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
              Upload a spreadsheet file (CSV, Excel) to start mapping your columns and importing your data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;