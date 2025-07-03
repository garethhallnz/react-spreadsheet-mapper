import SpreadSheetService from './SpreadsheetService';
import * as XLSX from 'xlsx';
import { vi, describe, beforeEach, it, expect } from 'vitest';

// Mock XLSX
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn()
  }
}));

// Mock FileReader
interface MockFileReader {
  readAsBinaryString: ReturnType<typeof vi.fn>;
  onload: ((event: { target: { result: string } }) => void) | null;
  onerror: ((error: Error) => void) | null;
  result: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).FileReader = vi.fn().mockImplementation((): MockFileReader => ({
  readAsBinaryString: vi.fn(),
  onload: null,
  onerror: null,
  result: null
}));

describe('SpreadSheetService', () => {
  let mockFileReader: MockFileReader;
  let mockFile: File;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFileReader = {
      readAsBinaryString: vi.fn(),
      onload: null,
      onerror: null,
      result: 'mock-binary-data'
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).FileReader.mockImplementation(() => mockFileReader);

    mockFile = new File(['content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  });

  describe('default configuration', () => {
    it('should process file with default configuration', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      const mockSheetData = [
        ['Name', 'Age', 'Email'],
        ['John', 25, 'john@example.com'],
        ['Jane', 30, 'jane@example.com'],
        ['Bob', 35, 'bob@example.com']
      ];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile);

      // Simulate FileReader onload
      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      const result = await promise;

      expect(result.name).toBe('test.xlsx');
      expect(result.columns).toEqual(['Name', 'Age', 'Email']);
      expect(result.data).toEqual([
        { Name: 'John', Age: 25, Email: 'john@example.com' },
        { Name: 'Jane', Age: 30, Email: 'jane@example.com' },
        { Name: 'Bob', Age: 35, Email: 'bob@example.com' }
      ]);

      expect(XLSX.read).toHaveBeenCalledWith('mock-binary-data', { type: 'binary' });
      expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith({}, { header: 1, defval: '' });
    });
  });

  describe('custom configuration', () => {
    it('should handle custom header row', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      const mockSheetData = [
        ['Skip this row'],
        ['Name', 'Age', 'Email'],
        ['John', 25, 'john@example.com'],
        ['Jane', 30, 'jane@example.com']
      ];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile, { headerRow: 2 });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      const result = await promise;

      expect(result.columns).toEqual(['Name', 'Age', 'Email']);
      expect(result.data).toEqual([
        { Name: 'John', Age: 25, Email: 'john@example.com' },
        { Name: 'Jane', Age: 30, Email: 'jane@example.com' }
      ]);
    });

    it('should handle omitHeader configuration', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      const mockSheetData = [
        ['John', 25, 'john@example.com'],
        ['Jane', 30, 'jane@example.com']
      ];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile, { omitHeader: true });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      const result = await promise;

      expect(result.columns).toEqual(['A', 'B', 'C']);
      expect(result.data).toEqual([
        { A: 'John', B: 25, C: 'john@example.com' },
        { A: 'Jane', B: 30, C: 'jane@example.com' }
      ]);
    });

    it('should handle custom dataStartRow', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      const mockSheetData = [
        ['Name', 'Age', 'Email'],
        ['Skip this row'],
        ['John', 25, 'john@example.com'],
        ['Jane', 30, 'jane@example.com']
      ];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile, { dataStartRow: 3 });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      const result = await promise;

      expect(result.data).toEqual([
        { Name: 'John', Age: 25, Email: 'john@example.com' },
        { Name: 'Jane', Age: 30, Email: 'jane@example.com' }
      ]);
    });

    it('should handle sheet selection by name', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1', 'Sheet2'],
        Sheets: {
          Sheet1: {},
          Sheet2: {}
        }
      };

      const mockSheetData = [
        ['Name', 'Age'],
        ['John', 25]
      ];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile, { sheet: 'Sheet2' });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      const result = await promise;

      expect(result.data).toHaveLength(1);
      expect(result.data).toEqual([
        { Name: 'John', Age: 25 }
      ]);
    });

    it('should handle sheet selection by index', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1', 'Sheet2'],
        Sheets: {
          Sheet1: {},
          Sheet2: {}
        }
      };

      const mockSheetData = [
        ['Name', 'Age'],
        ['John', 25]
      ];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile, { sheet: 1 });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      const result = await promise;

      expect(result.data).toHaveLength(1);
      expect(result.data).toEqual([
        { Name: 'John', Age: 25 }
      ]);
    });

    it('should handle previewRowCount configuration', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      const mockSheetData = [
        ['Name', 'Age'],
        ['John', 25],
        ['Jane', 30],
        ['Bob', 35],
        ['Alice', 40],
        ['Charlie', 45]
      ];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile, { previewRowCount: 2 });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      const result = await promise;

      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual([
        { Name: 'John', Age: 25 },
        { Name: 'Jane', Age: 30 }
      ]);
    });
  });

  describe('error handling', () => {
    it('should reject when sheet index is out of bounds', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);

      const promise = SpreadSheetService(mockFile, { sheet: 5 });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      await expect(promise).rejects.toThrow('Invalid sheet selection');
    });

    it('should reject when named sheet is not found', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);

      const promise = SpreadSheetService(mockFile, { sheet: 'NonExistentSheet' });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      await expect(promise).rejects.toThrow('Named sheet not found');
    });

    it('should reject when headerRow is out of bounds', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      const mockSheetData = [
        ['Name', 'Age']
      ];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile, { headerRow: 5 });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      await expect(promise).rejects.toThrow('Header row is out of bounds');
    });

    it('should handle empty data', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      const mockSheetData: never[] = [];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile);

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      await expect(promise).rejects.toThrow('Header data not available');
    });

    it('should handle FileReader error', async () => {
      const promise = SpreadSheetService(mockFile);

      mockFileReader.onerror?.(new Error('File read error'));

      await expect(promise).rejects.toThrow('File read error');
    });

    it('should handle missing data when omitHeader is true', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      const mockSheetData: never[] = [];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile, { omitHeader: true });

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      const result = await promise;
      expect(result.data).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle missing cells in rows', async () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      const mockSheetData = [
        ['Name', 'Age', 'Email'],
        ['John', 25], // Missing email
        ['Jane', '', 'jane@example.com'], // Missing age
        ['Bob'] // Missing age and email
      ];

      (XLSX.read as ReturnType<typeof vi.fn>).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as ReturnType<typeof vi.fn>).mockReturnValue(mockSheetData);

      const promise = SpreadSheetService(mockFile);

      mockFileReader.onload?.({ target: { result: 'mock-binary-data' } });

      const result = await promise;

      expect(result.data).toEqual([
        { Name: 'John', Age: 25, Email: '' },
        { Name: 'Jane', Age: '', Email: 'jane@example.com' },
        { Name: 'Bob', Age: '', Email: '' }
      ]);
    });
  });
}); 