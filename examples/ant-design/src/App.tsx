import React, { useCallback, useState, useRef } from 'react';
import useSpreadsheetMapper from 'react-spreadsheet-mapper';
import { MappedField } from './types';
import {
  Typography,
  Button,
  Row,
  Col,
  Select,
  Card,
  List,
  Alert,
  Space,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Title, Text } = Typography;
const { Option } = Select;

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
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title>Spreadsheet Mapper - Ant Design</Title>
          <Text type="secondary">Upload your spreadsheet files and map columns to data fields</Text>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <input 
            type="file" 
            multiple 
            onChange={handleFileChange} 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".csv,.xlsx,.xls"
          />
          <Button 
            type="primary" 
            size="large"
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Spreadsheet File
          </Button>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {processedFiles.map((file: SpreadsheetData, index: number) => {
            if (!file || !file.columns) {
              return null;
            }
            return (
              <Card 
                key={file.name || index} 
                title={
                  <Space>
                    <Title level={4} style={{ margin: 0 }}>{file.name}</Title>
                    <Text type="secondary">{file.data.length} rows</Text>
                  </Space>
                }
                extra={
                  <Space>
                    <Button type="primary" onClick={() => handleFileFinish(file)}>
                      Import Data
                    </Button>
                    <Button onClick={handleReset}>Reset</Button>
                  </Space>
                }
              >
                <Row gutter={[24, 24]}>
                  {options.map((option) => {
                    const mappedField = map.find((item: MappedField) => item.value === option.value);
                    const isSaved = mappedField && mappedField.saved;

                    return (
                      <Col xs={24} lg={8} key={option.value}>
                        <Card 
                          size="small" 
                          title={
                            <Space>
                              <Title level={5} style={{ margin: 0 }}>{option.label}</Title>
                              {option.required && <Text type="danger">*</Text>}
                            </Space>
                          }
                          style={{ height: '100%' }}
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Select
                              style={{ width: '100%' }}
                              value={mappedField ? mappedField.field : undefined}
                              disabled={isSaved}
                              onChange={(value: string) =>
                                updateOrCreate({
                                  field: value,
                                  value: option.value,
                                })
                              }
                              placeholder="Select a column"
                              status={option.required && !mappedField ? 'error' : ''}
                            >
                              {getAvailableColumns(file, mappedField ? mappedField.field : '').map((column: string) => (
                                <Option key={column} value={column}>
                                  {column}
                                </Option>
                              ))}
                            </Select>
                            
                            <Button 
                              type={isSaved ? "default" : "primary"}
                              block
                              onClick={() => save(option.value)}
                            >
                              {isSaved ? 'Change Mapping' : 'Save Mapping'}
                            </Button>
                            
                            {mappedField && (
                              <div>
                                <Text strong>Sample Data:</Text>
                                <List
                                  size="small"
                                  bordered
                                  dataSource={file.data.slice(0, 3).map((row) => String(row[mappedField.field] || ''))}
                                  renderItem={(item) => <List.Item>{item}</List.Item>}
                                  style={{ marginTop: 8, maxHeight: 120, overflow: 'auto' }}
                                />
                                {file.data.length > 3 && (
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    ...and {file.data.length - 3} more rows
                                  </Text>
                                )}
                              </div>
                            )}
                          </Space>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            );
          })}

          {errors.map((error: { message: string }, index: number) => (
            <Alert 
              key={index}
              message="Processing Error" 
              description={error.message} 
              type="error" 
              showIcon 
            />
          ))}

          {mappedData && (
            <Card title="Mapped Data Result" style={{ marginTop: 24 }}>
              <Alert
                message="Success"
                description="Your data has been successfully mapped and is ready for import."
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <pre style={{ 
                background: '#fafafa', 
                padding: '16px', 
                borderRadius: '6px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '400px'
              }}>
                {JSON.stringify(mappedData, null, 2)}
              </pre>
            </Card>
          )}

          {!mappedData && !processedFiles.length && (
            <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Space direction="vertical" size="middle">
                <Title level={3} type="secondary">Ready to Get Started?</Title>
                <Text type="secondary">
                  Upload a spreadsheet file (CSV, Excel) to begin mapping your data columns
                </Text>
              </Space>
            </Card>
          )}
        </Space>
      </div>
    </div>
  );
};

export default App;