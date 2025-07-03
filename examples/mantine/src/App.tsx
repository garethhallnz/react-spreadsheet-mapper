import React, { useCallback, useState, useRef } from 'react';
import useSpreadsheetMapper from 'react-spreadsheet-mapper';
import { MappedField } from './types';
import {
  MantineProvider,
  Container,
  Title,
  Button,
  Box,
  Grid,
  Select,
  Card,
  List,
  Alert,
  Group,
  Text,
} from '@mantine/core';
import '@mantine/core/styles.css';

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
    <MantineProvider>
      <Container size="xl" py="xl">
        <Title order={1} mb="lg">
          Spreadsheet Mapper - Mantine
        </Title>
        <Button component="label">
          Upload File
          <input type="file" multiple hidden onChange={handleFileChange} ref={fileInputRef} />
        </Button>

        {processedFiles.map((file: SpreadsheetData, index: number) => {
          if (!file || !file.columns) {
            return null;
          }
          return (
            <Card shadow="sm" p="lg" radius="md" withBorder mt="md" key={file.name || index}>
              <Title order={3}>{file.name}</Title>
              <Grid mt="md">
                {options.map((option) => {
                  const mappedField = map.find((item: MappedField) => item.value === option.value);
                  const isSaved = mappedField && mappedField.saved;

                  return (
                    <Grid.Col span={4} key={option.value}>
                      <Select
                        label={option.label}
                        placeholder="Select a column"
                        value={mappedField ? mappedField.field : null}
                        disabled={isSaved}
                        onChange={(value) =>
                          updateOrCreate({
                            field: value || '',
                            value: option.value,
                          })
                        }
                        data={getAvailableColumns(file, mappedField ? mappedField.field : '')}
                      />
                      <Button onClick={() => save(option.value)} mt="sm" size="xs">
                        {isSaved ? 'Change' : 'Save'}
                      </Button>
                      {mappedField && (
                        <List size="sm" mt="sm">
                          {file.data.map((row: Record<string, unknown>, rowIndex: number) => (
                            <List.Item key={rowIndex}>{String(row[mappedField.field] || '')}</List.Item>
                          ))}
                        </List>
                      )}
                    </Grid.Col>
                  );
                })}
              </Grid>
              <Group justify="center" mt="lg">
                <Button onClick={() => handleFileFinish(file)}>Import</Button>
                <Button variant="default" onClick={handleReset}>
                  Reset
                </Button>
              </Group>
            </Card>
          );
        })}

        {errors.map((error: { message: string }, index: number) => (
          <Alert color="red" title="Error" mt="md" key={index}>
            {error.message}
          </Alert>
        ))}

        {mappedData && (
          <Box mt="lg">
            <Title order={2}>Mapped Data:</Title>
            <pre>{JSON.stringify(mappedData, null, 2)}</pre>
          </Box>
        )}

        {!mappedData && !processedFiles.length && (
          <Text mt="md">Upload a spreadsheet file to see mapped data.</Text>
        )}
      </Container>
    </MantineProvider>
  );
};

export default App;