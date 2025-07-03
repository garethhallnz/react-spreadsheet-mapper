export interface MappedField {
  field: string;
  value: string;
  saved?: boolean;
}

export interface FileData {
  name: string;
  columns: string[];
  data: Record<string, unknown>[];
}

export interface MappedData {
  [key: string]: unknown;
}
