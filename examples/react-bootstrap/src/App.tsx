import React, { useCallback, useState, useRef } from 'react';
import useSpreadsheetMapper from 'react-spreadsheet-mapper';
import { MappedField } from './types';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  ListGroup,
  Alert,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start', 
      padding: '40px 20px' 
    }}>
      <Container style={{ maxWidth: '1200px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2.5rem' }}>
          Spreadsheet Mapper - React Bootstrap
        </h1>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Form.Group controlId="formFileMultiple">
            <Form.Label style={{ display: 'block', marginBottom: '16px' }}>Upload Files</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
          </Form.Group>
        </div>

        {processedFiles.map((file: SpreadsheetData, index: number) => {
          if (!file || !file.columns) {
            return null;
          }
          return (
            <Card key={file.name || index} style={{ marginBottom: '24px' }}>
              <Card.Header style={{ textAlign: 'center' }}>{file.name}</Card.Header>
              <Card.Body>
                <Row>
                  {options.map((option) => {
                    const mappedField = map.find((item: MappedField) => item.value === option.value);
                    const isSaved = mappedField && mappedField.saved;

                    return (
                      <Col md={4} key={option.value}>
                        <Form.Group style={{ marginBottom: '24px' }}>
                          <Form.Label style={{ fontWeight: 'bold' }}>{option.label}</Form.Label>
                          <Form.Select
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
                          </Form.Select>
                          <Button variant="secondary" size="sm" style={{ marginTop: '8px' }} onClick={() => save(option.value)}>
                            {isSaved ? 'Change' : 'Save'}
                          </Button>
                          {mappedField && (
                            <ListGroup style={{ marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                              {file.data.map((row: Record<string, unknown>, rowIndex: number) => (
                                <ListGroup.Item key={rowIndex} style={{ fontSize: '14px' }}>
                                  {String(row[mappedField.field] || '')}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          )}
                        </Form.Group>
                      </Col>
                    );
                  })}
                </Row>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
                  <Button variant="primary" onClick={() => handleFileFinish(file)}>
                    Import
                  </Button>
                  <Button variant="outline-secondary" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </Card.Body>
            </Card>
          );
        })}

        {errors.map((error: { message: string }, index: number) => (
          <Alert variant="danger" style={{ marginBottom: '16px' }} key={index}>
            {error.message}
          </Alert>
        ))}

        {mappedData && (
          <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Mapped Data:</h2>
            <pre style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '4px', fontSize: '14px', overflow: 'auto' }}>
              {JSON.stringify(mappedData, null, 2)}
            </pre>
          </div>
        )}

        {!mappedData && !processedFiles.length && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ fontSize: '1.1rem', color: '#6c757d' }}>
              Upload a spreadsheet file to see mapped data.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default App;