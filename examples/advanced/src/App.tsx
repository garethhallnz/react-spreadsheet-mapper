import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import useSpreadsheetMapper from 'react-spreadsheet-mapper';
import { MappedField } from './types';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
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
  LinearProgress,
  Chip,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormHelperText,
  CircularProgress,
  Link,
  AlertTitle,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  Checkbox,
  FormGroup,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Accessibility as AccessibilityIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Settings as SettingsIcon,
  RestartAlt as RestartAltIcon,

} from '@mui/icons-material';

// Define types locally to match the hook's interface
interface SpreadsheetData {
  name: string;
  columns: string[];
  data: Record<string, unknown>[];
  metrics?: {
    fileSize: number;
    processingTime: number;
    rowCount: number;
    memoryUsage?: number;
  };
}

// Updated type for the final mapped data result
type MappedResult = SpreadsheetData & { map: { field: string; value: string }[] };

// Configuration interface
interface AppConfig {
  headerRow: number;
  omitHeader: boolean;
  dataStartRow: number;
  sheet: number;
  previewRowCount: number;
  security: {
    maxFileSize: number;
    allowedExtensions: string[];
    allowedMimeTypes: string[];
    sanitizeData: boolean;
    maxFilesPerWindow: number;
    rateLimitWindow: number;
  };
  performance: {
    enableChunkedReading: boolean;
    chunkSize: number;
    processingThrottle: number;
    enableMetrics: boolean;
    maxConcurrentFiles: number;
  };
  accessibility: {
    announceChanges: boolean;
    highContrastMode: boolean;
    ariaLabels: {
      fileInput: string;
      mappingSelect: string;
      saveButton: string;
      finishButton: string;
      errorList: string;
      successMessage: string;
    };
  };
}

// Configuration Form Component
const ConfigurationForm: React.FC<{
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onReset: () => void;
  hasChanges?: boolean;
}> = ({ config, onConfigChange, onReset, hasChanges = false }) => {
  const [expanded, setExpanded] = useState<string | false>('basic');

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const updateConfig = (path: string, value: unknown) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current: Record<string, unknown> = newConfig as Record<string, unknown>;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onConfigChange(newConfig);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Configuration Playground</Typography>
          {hasChanges && (
            <Chip 
              label="Changes Pending" 
              size="small" 
              color="warning" 
              sx={{ ml: 1 }}
            />
          )}
          <Tooltip title="Reset all settings to defaults">
            <IconButton onClick={onReset} size="small" sx={{ ml: 1 }}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Experiment with different settings to see how they affect the spreadsheet processing behavior.
        </Typography>

        <Alert severity={hasChanges ? "warning" : "info"} sx={{ mb: 2 }}>
          <AlertTitle>
            {hasChanges ? "Configuration Changes Pending" : "When Do Changes Take Effect?"}
          </AlertTitle>
          {hasChanges ? (
            <>
              You have modified settings that will apply to <strong>newly uploaded files</strong>. 
              To see your changes in action, upload a new file or re-upload an existing file.
            </>
          ) : (
            <>
              Configuration changes apply to <strong>newly uploaded files</strong>. To see changes in action:
              <br />• Adjust settings below
              <br />• Upload a new file or re-upload an existing file
              <br />• The new settings will be used for processing
            </>
          )}
        </Alert>

        {/* Basic Settings */}
        <Accordion expanded={expanded === 'basic'} onChange={handleChange('basic')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Basic Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Header Row"
                  type="number"
                  value={config.headerRow}
                  onChange={(e) => updateConfig('headerRow', parseInt(e.target.value) || 1)}
                  helperText="Which row contains the column headers"
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data Start Row"
                  type="number"
                  value={config.dataStartRow}
                  onChange={(e) => updateConfig('dataStartRow', parseInt(e.target.value) || 2)}
                  helperText="First row containing actual data"
                  inputProps={{ min: 1, max: 20 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sheet Index"
                  type="number"
                  value={config.sheet}
                  onChange={(e) => updateConfig('sheet', parseInt(e.target.value) || 0)}
                  helperText="Which sheet to process (0-based)"
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preview Row Count"
                  type="number"
                  value={config.previewRowCount}
                  onChange={(e) => updateConfig('previewRowCount', parseInt(e.target.value) || 10)}
                  helperText="Number of rows to show in preview"
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.omitHeader}
                      onChange={(e) => updateConfig('omitHeader', e.target.checked)}
                    />
                  }
                  label="Omit Header Row"
                />
                <FormHelperText>Skip the header row when processing data</FormHelperText>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Security Settings */}
        <Accordion expanded={expanded === 'security'} onChange={handleChange('security')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon sx={{ mr: 1 }} />
              <Typography>Security Settings</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Max File Size: {formatFileSize(config.security.maxFileSize)}
                </Typography>
                <Slider
                  value={config.security.maxFileSize}
                  onChange={(_, value) => updateConfig('security.maxFileSize', value)}
                  min={1024 * 1024} // 1MB
                  max={500 * 1024 * 1024} // 500MB
                  step={1024 * 1024} // 1MB steps
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatFileSize}
                />
                <FormHelperText>Maximum allowed file size for uploads</FormHelperText>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Files Per Window"
                  type="number"
                  value={config.security.maxFilesPerWindow}
                  onChange={(e) => updateConfig('security.maxFilesPerWindow', parseInt(e.target.value) || 10)}
                  helperText="Maximum files per rate limit window"
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Rate Limit Window (ms)"
                  type="number"
                  value={config.security.rateLimitWindow}
                  onChange={(e) => updateConfig('security.rateLimitWindow', parseInt(e.target.value) || 60000)}
                  helperText="Time window for rate limiting"
                  inputProps={{ min: 1000, max: 300000 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.security.sanitizeData}
                      onChange={(e) => updateConfig('security.sanitizeData', e.target.checked)}
                    />
                  }
                  label="Sanitize Data"
                />
                <FormHelperText>Enable data sanitization for security</FormHelperText>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Performance Settings */}
        <Accordion expanded={expanded === 'performance'} onChange={handleChange('performance')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SpeedIcon sx={{ mr: 1 }} />
              <Typography>Performance Settings</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Chunk Size: {formatFileSize(config.performance.chunkSize)}
                </Typography>
                <Slider
                  value={config.performance.chunkSize}
                  onChange={(_, value) => updateConfig('performance.chunkSize', value)}
                  min={64 * 1024} // 64KB
                  max={10 * 1024 * 1024} // 10MB
                  step={64 * 1024} // 64KB steps
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatFileSize}
                />
                <FormHelperText>Size of each chunk when processing large files</FormHelperText>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Processing Throttle (ms)"
                  type="number"
                  value={config.performance.processingThrottle}
                  onChange={(e) => updateConfig('performance.processingThrottle', parseInt(e.target.value) || 100)}
                  helperText="Delay between processing chunks"
                  inputProps={{ min: 0, max: 1000 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Concurrent Files"
                  type="number"
                  value={config.performance.maxConcurrentFiles}
                  onChange={(e) => updateConfig('performance.maxConcurrentFiles', parseInt(e.target.value) || 3)}
                  helperText="Maximum files to process simultaneously"
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.performance.enableChunkedReading}
                        onChange={(e) => updateConfig('performance.enableChunkedReading', e.target.checked)}
                      />
                    }
                    label="Enable Chunked Reading"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.performance.enableMetrics}
                        onChange={(e) => updateConfig('performance.enableMetrics', e.target.checked)}
                      />
                    }
                    label="Enable Performance Metrics"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Accessibility Settings */}
        <Accordion expanded={expanded === 'accessibility'} onChange={handleChange('accessibility')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessibilityIcon sx={{ mr: 1 }} />
              <Typography>Accessibility Settings</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.accessibility.announceChanges}
                        onChange={(e) => updateConfig('accessibility.announceChanges', e.target.checked)}
                      />
                    }
                    label="Announce Changes"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.accessibility.highContrastMode}
                        onChange={(e) => updateConfig('accessibility.highContrastMode', e.target.checked)}
                      />
                    }
                    label="High Contrast Mode"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <AlertTitle>ARIA Labels</AlertTitle>
                  ARIA labels are automatically updated based on your configuration changes to ensure optimal accessibility.
                </Alert>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

// Lazy loading component for large datasets
const LazyDataPreview: React.FC<{
  data: Record<string, unknown>[];
  fieldName: string;
  maxInitialItems?: number;
}> = ({ data, fieldName, maxInitialItems = 5 }) => {
  const [visibleItems, setVisibleItems] = useState(maxInitialItems);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    // Simulate async loading with a small delay
    await new Promise(resolve => setTimeout(resolve, 100));
    setVisibleItems(prev => Math.min(prev + 10, data.length));
    setIsLoading(false);
  }, [data.length]);

  const visibleData = data.slice(0, visibleItems);
  const hasMore = visibleItems < data.length;

  return (
    <Box>
      <List dense sx={{ maxHeight: 200, overflow: 'auto' }} role="list" aria-label={`Preview of ${fieldName} data`}>
        {visibleData.map((row, rowIndex) => (
          <ListItem key={rowIndex} role="listitem">
            <ListItemText 
              primary={String(row[fieldName] || '')} 
              sx={{ 
                color: !row[fieldName] ? 'text.secondary' : 'text.primary',
                fontStyle: !row[fieldName] ? 'italic' : 'normal'
              }}
            />
          </ListItem>
        ))}
      </List>
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Button 
            size="small" 
            onClick={loadMore} 
            disabled={isLoading}
            aria-label={`Load more ${fieldName} data. Showing ${visibleItems} of ${data.length} items`}
          >
            {isLoading ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Loading...
              </>
            ) : (
              `Load More (${data.length - visibleItems} remaining)`
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
};

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [liveRegion, setLiveRegion] = useState('');
  const [announcements, setAnnouncements] = useState<Array<{message: string, type: string, timestamp: number}>>([]);

  // Default configuration
  const defaultConfig: AppConfig = useMemo(() => ({
    headerRow: 1,
    omitHeader: false,
    dataStartRow: 2,
    sheet: 0,
    previewRowCount: 10,
    
    // Security configuration
    security: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedExtensions: ['.xlsx', '.xls', '.csv'],
      allowedMimeTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv'
      ],
      sanitizeData: true,
      maxFilesPerWindow: 10,
      rateLimitWindow: 60000
    },
    
    // Performance configuration
    performance: {
      enableChunkedReading: true,
      chunkSize: 1024 * 1024, // 1MB chunks
      processingThrottle: 100,
      enableMetrics: true,
      maxConcurrentFiles: 3
    },
    
    // Accessibility configuration
    accessibility: {
      announceChanges: true,
      highContrastMode: false,
      ariaLabels: {
        fileInput: 'Select spreadsheet files to upload. Supported formats: Excel (.xlsx, .xls) and CSV (.csv). Maximum file size: 50MB.',
        mappingSelect: 'Choose which data field this spreadsheet column should map to',
        saveButton: 'Save the current field mapping',
        finishButton: 'Complete all mappings and process the uploaded data',
        errorList: 'List of validation errors that need attention',
        successMessage: 'Spreadsheet processing completed successfully'
      }
    }
  }), []);

  // Dynamic configuration state
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [configChanged, setConfigChanged] = useState(false);

  const options = [
    { label: 'Name', value: 'name', required: true },
    { label: 'Email', value: 'email', required: true },
    { label: 'Phone', value: 'phone' },
  ];

  const [mappedData, setMappedData] = useState<MappedResult | null>(null);

  // Announcement handler for accessibility
  const handleAnnouncement = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setLiveRegion(`${type}: ${message}`);
    setAnnouncements(prev => [...prev, { message, type, timestamp: Date.now() }].slice(-5));
    
    // Clear live region after screen readers have time to announce
    setTimeout(() => setLiveRegion(''), 3000);
  }, []);

  // Configuration handlers
  const handleConfigChange = useCallback((newConfig: AppConfig) => {
    setConfig(newConfig);
    setConfigChanged(true);
    handleAnnouncement('Configuration updated', 'info');
  }, [handleAnnouncement]);

  const handleConfigReset = useCallback(() => {
    setConfig(defaultConfig);
    setConfigChanged(true);
    handleAnnouncement('Configuration reset to defaults', 'info');
  }, [defaultConfig, handleAnnouncement]);

  const onFinish = useCallback((data: MappedResult) => {
    setMappedData(data);
    handleAnnouncement('Data mapping completed successfully. Results are now available.', 'success');

    // TODO: Add your server interaction here
    console.log('📡 Server Integration Point: Add your API call here to post the mapped data to your server');
    console.log('Mapped data ready for server:', data);
    console.log('Example: fetch("/api/upload", { method: "POST", body: JSON.stringify(data) })');
  }, [handleAnnouncement]);

  const {
    map,
    errors,
    processedFiles,
    fileProcessingStates,
    isProcessing,
    performanceMetrics,
    updateOrCreate,
    save,
    handleFiles,
    handleFileFinish,
    reset: resetMapper,
    getPerformanceSummary,
  } = useSpreadsheetMapper({ 
    options, 
    onFinish, 
    config,
    clientId: 'material-ui-example',
    onAnnounce: handleAnnouncement
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleAnnouncement(`Starting to process ${files.length} file${files.length > 1 ? 's' : ''}`, 'info');
      setConfigChanged(false); // Reset config changed flag when new files are uploaded
    }
    handleFiles(files);
  };

  const handleReset = () => {
    resetMapper();
    setMappedData(null);
    setAnnouncements([]);
    setConfigChanged(false); // Reset config changed flag when all data is reset
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    handleAnnouncement('All data has been reset', 'info');
  };

  const getAvailableColumns = (file: SpreadsheetData, currentValue: string) => {
    // Only filter out columns that are mapped for THIS specific file
    const mappedColumnsForThisFile = map
      .filter((item: MappedField) => item.fileName === file.name)
      .map((item: MappedField) => item.field);
    return file.columns.filter((column: string) => !mappedColumnsForThisFile.includes(column) || column === currentValue);
  };

  // Focus management
  useEffect(() => {
    if (errors.length > 0) {
      const errorElement = document.getElementById('error-list');
      if (errorElement) {
        errorElement.focus();
      }
    }
  }, [errors]);

  // Monitor performance metrics for debugging in development
  useEffect(() => {
    if (performanceMetrics.length > 0 && process.env.NODE_ENV === 'development') {
      console.log('Performance metrics updated:', performanceMetrics);
    }
  }, [performanceMetrics]);

  const performanceSummary = getPerformanceSummary();

  return (
    <Container maxWidth="lg">
      {/* Screen reader live region */}
      <div
        id="live-region"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      >
        {liveRegion}
      </div>

      {/* Skip links for accessibility */}
      <Box sx={{ position: 'absolute', top: -40, left: 0, zIndex: 1000 }}>
        <Link
          href="#file-upload"
          sx={{
            position: 'absolute',
            left: '-10000px',
            '&:focus': {
              position: 'static',
              left: 'auto',
              background: 'primary.main',
              color: 'primary.contrastText',
              padding: 1,
              textDecoration: 'none',
              borderRadius: 1
            }
          }}
        >
          Skip to file upload
        </Link>
        <Link
          href="#field-mapping"
          sx={{
            position: 'absolute',
            left: '-10000px',
            ml: 2,
            '&:focus': {
              position: 'static',
              left: 'auto',
              background: 'primary.main',
              color: 'primary.contrastText',
              padding: 1,
              textDecoration: 'none',
              borderRadius: 1
            }
          }}
        >
          Skip to field mapping
        </Link>
      </Box>

      <Box sx={{ my: 4 }}>
                 <Typography variant="h4" component="h1" gutterBottom>
           <AccessibilityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
           Advanced Spreadsheet Mapper
         </Typography>
         <Typography variant="subtitle1" color="text.secondary" gutterBottom>
           Complete demonstration of advanced features: security, performance monitoring, accessibility, and advanced UI patterns
        </Typography>
        
        {/* Feature indicators */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip icon={<SecurityIcon />} label="Security Enabled" size="small" color="success" />
          <Chip icon={<SpeedIcon />} label="Performance Monitoring" size="small" color="info" />
          <Chip icon={<AccessibilityIcon />} label="WCAG Compliant" size="small" color="secondary" />
        </Box>
      </Box>

      {/* Configuration Playground */}
      <ConfigurationForm
        config={config}
        onConfigChange={handleConfigChange}
        onReset={handleConfigReset}
        hasChanges={configChanged}
      />

      <Box sx={{ my: 4 }}>
        <Button 
          id="file-upload"
          variant="contained" 
          component="label"
          disabled={isProcessing}
          aria-describedby="file-upload-description"
        >
          {isProcessing ? 'Processing...' : 'Upload Files'}
          <input 
            type="file" 
            multiple 
            hidden 
            onChange={handleFileChange} 
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            aria-label={config.accessibility.ariaLabels.fileInput}
          />
        </Button>
        <FormHelperText id="file-upload-description">
          Supported formats: Excel (.xlsx, .xls) and CSV (.csv). Maximum file size: {(config.security.maxFileSize / 1024 / 1024).toFixed(0)}MB per file.
        </FormHelperText>
      </Box>

      {/* Processing progress */}
      {isProcessing && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Processing Files...
            </Typography>
            <LinearProgress sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {fileProcessingStates.map((state, index) => (
                <Chip
                  key={index}
                  label={`${state.file.name}: ${state.status}`}
                  color={
                    state.status === 'completed' ? 'success' :
                    state.status === 'error' ? 'error' :
                    state.status === 'processing' ? 'info' : 'default'
                  }
                  icon={
                    state.status === 'completed' ? <CheckCircleIcon /> :
                    state.status === 'error' ? <ErrorIcon /> :
                    state.status === 'processing' ? <CircularProgress size={16} /> : undefined
                  }
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Performance metrics */}
      {performanceSummary && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Performance Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Files Processed</Typography>
                <Typography variant="h6">{performanceSummary.totalFiles}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Size</Typography>
                <Typography variant="h6">{(performanceSummary.totalSize / 1024 / 1024).toFixed(2)}MB</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Rows</Typography>
                <Typography variant="h6">{performanceSummary.totalRows.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Avg Processing Time</Typography>
                <Typography variant="h6">{performanceSummary.averageProcessingTime.toFixed(0)}ms</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Announcement history for development */}
      {announcements.length > 0 && (
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Events ({announcements.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {announcements.slice().reverse().map((announcement) => (
                <ListItem key={announcement.timestamp}>
                  <Chip 
                    size="small" 
                    label={announcement.type.toUpperCase()} 
                    color={announcement.type === 'error' ? 'error' : announcement.type === 'success' ? 'success' : 'info'}
                    sx={{ mr: 1, minWidth: 80 }}
                  />
                  <ListItemText primary={announcement.message} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* File processing and mapping */}
      {processedFiles.map((file: SpreadsheetData, index: number) => {
        if (!file || !file.columns) {
          return null;
        }
        return (
          <Card key={file.name || index} sx={{ mt: 2 }} id="field-mapping">
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {file.name}
                {file.metrics && (
                  <Chip 
                    size="small" 
                    label={`${(file.metrics.fileSize / 1024 / 1024).toFixed(2)}MB, ${file.metrics.rowCount} rows, ${file.metrics.processingTime.toFixed(0)}ms`}
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Map the spreadsheet columns to your data fields. Required fields are marked with *.
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {options.map((option) => {
                  const mappedField = map.find((item: MappedField) => item.value === option.value && item.fileName === file.name);
                  const isSaved = mappedField && mappedField.saved;
                  const isRequired = option.required;

                  return (
                    <Grid item xs={12} md={6} lg={4} key={option.value}>
                      <Paper sx={{ p: 2, border: isRequired && !isSaved ? 2 : 1, borderColor: isRequired && !isSaved ? 'warning.main' : 'divider' }}>
                        <FormControl fullWidth>
                          <InputLabel required={isRequired}>
                            {option.label} {isRequired && '*'}
                          </InputLabel>
                          <Select
                            value={mappedField ? mappedField.field : ''}
                            disabled={isSaved}
                            onChange={(e) => {
                              updateOrCreate({
                                field: e.target.value,
                                value: option.value,
                                fileName: file.name,
                              });
                            }}
                            aria-label={config.accessibility.ariaLabels.mappingSelect}
                            aria-describedby={`${option.value}-helper`}
                          >
                            <MenuItem value="">
                              <em>Select a column</em>
                            </MenuItem>
                            {getAvailableColumns(file, mappedField ? mappedField.field : '').map((column: string) => (
                              <MenuItem key={column} value={column}>
                                {column}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText id={`${option.value}-helper`}>
                            {isRequired ? 'This field is required' : 'This field is optional'}
                          </FormHelperText>
                        </FormControl>
                        
                        <Button 
                          onClick={() => save(option.value, file.name)} 
                          sx={{ mt: 1 }}
                          color={isSaved ? 'secondary' : 'primary'}
                          variant={isSaved ? 'outlined' : 'contained'}
                          aria-label={config.accessibility.ariaLabels.saveButton}
                          disabled={!mappedField}
                        >
                          {isSaved ? 'Change Mapping' : 'Save Mapping'}
                        </Button>
                        
                        {isSaved && <CheckCircleIcon color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />}
                        
                        {mappedField && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Data Preview:
                            </Typography>
                            <LazyDataPreview 
                              data={file.data} 
                              fieldName={mappedField.field}
                              maxInitialItems={3}
                            />
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleFileFinish(file)}
                  aria-label={config.accessibility.ariaLabels.finishButton}
                  disabled={options.some(opt => opt.required && !map.find(item => item.value === opt.value && item.fileName === file.name && item.saved))}
                >
                  Process Data
                </Button>
                <Button variant="outlined" onClick={handleReset}>
                  Reset All
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {/* Errors section */}
      {errors.length > 0 && (
        <Box sx={{ mt: 2 }} id="error-list" tabIndex={-1} role="region" aria-label={config.accessibility.ariaLabels.errorList}>
          <Typography variant="h6" gutterBottom color="error">
            <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Validation Errors
          </Typography>
          {errors.map((error: { message: string, type?: string }, index: number) => (
            <Alert 
              severity={error.type === 'security' ? 'error' : 'warning'} 
              sx={{ mt: 1 }} 
              key={index}
              icon={error.type === 'security' ? <SecurityIcon /> : <WarningIcon />}
            >
              <AlertTitle>
                {error.type === 'security' ? 'Security Error' : 'Validation Error'}
              </AlertTitle>
              {error.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Success section */}
      {mappedData && (
        <Card sx={{ mt: 4 }} role="region" aria-labelledby="results-heading">
          <CardContent>
            <Typography id="results-heading" variant="h5" gutterBottom color="success.main">
              <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Processing Complete!
            </Typography>
            <Typography variant="body1" gutterBottom>
              Your data has been successfully mapped and is ready for use.
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>View Mapped Data ({mappedData.data.length} rows)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre style={{ fontSize: '0.875rem', overflow: 'auto', maxHeight: '300px' }}>
                  {JSON.stringify(mappedData, null, 2)}
                </pre>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!mappedData && !processedFiles.length && !isProcessing && (
        <Paper sx={{ mt: 4, p: 4, textAlign: 'center' }}>
          <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Ready to Process Your Spreadsheets
          </Typography>
          <Typography color="text.secondary">
            Upload Excel (.xlsx, .xls) or CSV files to start mapping your data fields.
            Files are processed securely in your browser with no data sent to external servers.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default App;