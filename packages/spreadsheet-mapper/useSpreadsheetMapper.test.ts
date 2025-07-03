import useSpreadsheetMapper from './useSpreadsheetMapper';
import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

describe('useSpreadsheetMapper', () => {
  const mockOnFinish = vi.fn();
  const defaultOptions = [
    { label: 'Name', value: 'name', required: true },
    { label: 'Email', value: 'email', required: true },
    { label: 'Age', value: 'age', required: false }
  ];

  const mockSpreadsheetData = {
    name: 'test.xlsx',
    columns: ['Full Name', 'Email Address', 'Phone Number'],
    data: [
      { 'Full Name': 'John Doe', 'Email Address': 'john@example.com', 'Phone Number': '123-456-7890' },
      { 'Full Name': 'Jane Smith', 'Email Address': 'jane@example.com', 'Phone Number': '098-765-4321' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnFinish.mockClear();
  });

  it('should be a function', () => {
    expect(typeof useSpreadsheetMapper).toBe('function');
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() =>
      useSpreadsheetMapper({
        options: defaultOptions,
        onFinish: mockOnFinish
      })
    );

    expect(result.current.map).toEqual([]);
    expect(result.current.errors).toEqual([]);
    expect(result.current.processedFiles).toEqual([]);
  });

  it('should update or create mapped fields', () => {
    const { result } = renderHook(() =>
      useSpreadsheetMapper({
        options: defaultOptions,
        onFinish: mockOnFinish
      })
    );

    act(() => {
      result.current.updateOrCreate({
        field: 'Full Name',
        value: 'name'
      });
    });

    expect(result.current.map).toHaveLength(1);
    expect(result.current.map[0]).toEqual({
      field: 'Full Name',
      value: 'name'
    });
  });

  it('should save and unsave mapped fields', () => {
    const { result } = renderHook(() =>
      useSpreadsheetMapper({
        options: defaultOptions,
        onFinish: mockOnFinish
      })
    );

    // First create a mapping
    act(() => {
      result.current.updateOrCreate({
        field: 'Full Name',
        value: 'name'
      });
    });

    // Then save it
    act(() => {
      result.current.save('name');
    });

    expect(result.current.map[0]?.saved).toBe(true);

    // Then unsave it
    act(() => {
      result.current.save('name');
    });

    expect(result.current.map[0]?.saved).toBe(false);
  });

  it('should prevent handleFileFinish when required fields are not mapped', () => {
    const { result } = renderHook(() =>
      useSpreadsheetMapper({
        options: defaultOptions,
        onFinish: mockOnFinish
      })
    );

    act(() => {
      result.current.handleFileFinish(mockSpreadsheetData);
    });

    expect(result.current.errors).toHaveLength(2);
    expect(result.current.errors[0]?.message).toBe('Name is required and must be saved');
    expect(result.current.errors[1]?.message).toBe('Email is required and must be saved');
    expect(mockOnFinish).not.toHaveBeenCalled();
  });

  it('should prevent handleFileFinish when required fields are mapped but not saved', () => {
    const { result } = renderHook(() =>
      useSpreadsheetMapper({
        options: defaultOptions,
        onFinish: mockOnFinish
      })
    );

    // Map required fields but don't save them
    act(() => {
      result.current.updateOrCreate({
        field: 'Full Name',
        value: 'name'
      });
      result.current.updateOrCreate({
        field: 'Email Address',
        value: 'email'
      });
    });

    act(() => {
      result.current.handleFileFinish(mockSpreadsheetData);
    });

    expect(result.current.errors).toHaveLength(2);
    expect(result.current.errors[0]?.message).toBe('Name is required and must be saved');
    expect(result.current.errors[1]?.message).toBe('Email is required and must be saved');
    expect(mockOnFinish).not.toHaveBeenCalled();
  });

  it('should allow handleFileFinish when all required fields are mapped and saved', () => {
    const { result } = renderHook(() =>
      useSpreadsheetMapper({
        options: defaultOptions,
        onFinish: mockOnFinish
      })
    );

    // Map and save required fields
    act(() => {
      result.current.updateOrCreate({
        field: 'Full Name',
        value: 'name'
      });
      result.current.updateOrCreate({
        field: 'Email Address',
        value: 'email'
      });
    });

    act(() => {
      result.current.save('name');
      result.current.save('email');
    });

    act(() => {
      result.current.handleFileFinish(mockSpreadsheetData);
    });

    expect(result.current.errors).toHaveLength(0);
    expect(mockOnFinish).toHaveBeenCalledWith({
      ...mockSpreadsheetData,
      map: [
        { field: 'Full Name', value: 'name' },
        { field: 'Email Address', value: 'email' }
      ]
    });
  });

  it('should allow optional fields to be unmapped', () => {
    const { result } = renderHook(() =>
      useSpreadsheetMapper({
        options: defaultOptions,
        onFinish: mockOnFinish
      })
    );

    // Only map and save required fields, leave optional field unmapped
    act(() => {
      result.current.updateOrCreate({
        field: 'Full Name',
        value: 'name'
      });
      result.current.updateOrCreate({
        field: 'Email Address',
        value: 'email'
      });
    });

    act(() => {
      result.current.save('name');
      result.current.save('email');
    });

    act(() => {
      result.current.handleFileFinish(mockSpreadsheetData);
    });

    expect(result.current.errors).toHaveLength(0);
    expect(mockOnFinish).toHaveBeenCalled();
  });

  it('should reset all state', () => {
    const { result } = renderHook(() =>
      useSpreadsheetMapper({
        options: defaultOptions,
        onFinish: mockOnFinish
      })
    );

    // Add some state
    act(() => {
      result.current.updateOrCreate({
        field: 'Full Name',
        value: 'name'
      });
    });

    // Trigger an error
    act(() => {
      result.current.handleFileFinish(mockSpreadsheetData);
    });

    expect(result.current.map).toHaveLength(1);
    expect(result.current.errors).toHaveLength(2);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.map).toEqual([]);
    expect(result.current.errors).toEqual([]);
    expect(result.current.processedFiles).toEqual([]);
  });
});
