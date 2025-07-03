import React, { useCallback, useState, useRef } from 'react';
import useSpreadsheetMapper from 'react-spreadsheet-mapper';
import { MappedField } from './types';
import {
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Alert,
  Container,
  Grid,
} from '@mui/material';

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Spreadsheet Mapper - Material-UI
      </Typography>
      
      <input 
        type="file" 
        multiple 
        onChange={handleFileChange} 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        id="file-upload" 
      />
      <Button 
        variant="contained" 
        onClick={() => fileInputRef.current?.click()}
        sx={{ mb: 3 }}
      >
        Upload File
      </Button>

      {processedFiles.map((file: SpreadsheetData, index: number) => {
        if (!file || !file.columns) {
          return null;
        }
        return (
          <Card key={file.name || index} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {file.name}
              </Typography>
              
              <Grid container spacing={3}>
                {options.map((option) => {
                  const mappedField = map.find((item: MappedField) => item.value === option.value);
                  const isSaved = mappedField && mappedField.saved;

                  return (
                    <Grid size={{ xs: 12, md: 4 }} key={option.value}>
                      <Typography variant="h6" gutterBottom>
                        {option.label}
                      </Typography>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select a column</InputLabel>
                        <Select
                          value={mappedField ? mappedField.field : ''}
                          disabled={!!isSaved}
                          onChange={(e) =>
                            updateOrCreate({
                              field: e.target.value,
                              value: option.value,
                            })
                          }
                        >
                          {getAvailableColumns(file, mappedField ? mappedField.field : '').map((column: string) => (
                            <MenuItem key={column} value={column}>
                              {column}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Button 
                        variant="outlined" 
                        onClick={() => save(option.value)}
                        sx={{ mb: 2 }}
                      >
                        {isSaved ? 'Change' : 'Save'}
                      </Button>
                      
                      {mappedField && (
                        <List dense>
                          {file.data.map((row: Record<string, unknown>, rowIndex: number) => (
                            <ListItem key={rowIndex}>
                              <ListItemText primary={String(row[mappedField.field] || '')} />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleFileFinish(file)}
                >
                  Import
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {errors.map((error: { message: string }, index: number) => (
        <Alert severity="error" sx={{ mb: 2 }} key={index}>
          {error.message}
        </Alert>
      ))}

      {mappedData && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Mapped Data:
            </Typography>
            <pre style={{ overflow: 'auto' }}>
              {JSON.stringify(mappedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {!mappedData && !processedFiles.length && (
        <Typography variant="body1" sx={{ mt: 3 }}>
          Upload a spreadsheet file to see mapped data.
        </Typography>
      )}
    </Container>
  );
};

export default App;