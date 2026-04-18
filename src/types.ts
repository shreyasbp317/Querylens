export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: string;
}

export interface TableSchema {
  name: string;
  rowCount: number;
  columns: Column[];
  description: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
}

export interface QueryHistoryItem {
  id: string;
  naturalLanguage: string;
  sql: string;
  timestamp: Date;
  executionTime: number;
  rowCount: number;
  status: 'success' | 'error';
  error?: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  naturalLanguage: string;
  sql: string;
  createdAt: Date;
  tags: string[];
}

export type ActiveTab = 'query' | 'history' | 'saved' | 'schema';
export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}
