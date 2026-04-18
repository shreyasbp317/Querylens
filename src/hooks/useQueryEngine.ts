import { useState, useCallback } from 'react';
import { QueryHistoryItem, QueryResult, SavedQuery } from '../types';
import { mockHistory, mockSavedQueries, mockQueryResults } from '../data/mockData';

const SQL_TEMPLATES: Record<string, string> = {
  'last 30 days': `SELECT id, email, username, created_at, is_active\nFROM users\nWHERE created_at >= NOW() - INTERVAL '30 days'\nORDER BY created_at DESC;`,
  'best-selling': `SELECT p.name, p.sku,\n  SUM(oi.quantity) AS total_units,\n  SUM(oi.quantity * oi.unit_price) AS total_revenue\nFROM products p\nJOIN order_items oi ON p.id = oi.product_id\nJOIN orders o ON oi.order_id = o.id\nWHERE o.status = 'completed'\nGROUP BY p.id, p.name, p.sku\nORDER BY total_revenue DESC\nLIMIT 10;`,
  'top product': `SELECT p.name, p.sku,\n  SUM(oi.quantity) AS total_units,\n  SUM(oi.quantity * oi.unit_price) AS total_revenue\nFROM products p\nJOIN order_items oi ON p.id = oi.product_id\nJOIN orders o ON oi.order_id = o.id\nWHERE o.status = 'completed'\nGROUP BY p.id, p.name, p.sku\nORDER BY total_revenue DESC\nLIMIT 10;`,
  'revenue': `SELECT DATE_TRUNC('month', o.created_at) AS month,\n  SUM(o.total_amount) AS revenue,\n  COUNT(o.id) AS order_count\nFROM orders o\nWHERE o.status = 'completed'\n  AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM NOW())\nGROUP BY month\nORDER BY month;`,
  'lifetime': `SELECT u.id, u.email, u.username,\n  pl.name AS plan_name,\n  COUNT(o.id) AS total_orders,\n  SUM(o.total_amount) AS lifetime_value\nFROM users u\nJOIN orders o ON u.id = o.user_id\nJOIN plans pl ON u.plan_id = pl.id\nWHERE o.status = 'completed'\nGROUP BY u.id, u.email, u.username, pl.name\nORDER BY lifetime_value DESC\nLIMIT 20;`,
  'default': `SELECT id, email, username, created_at, is_active\nFROM users\nWHERE is_active = TRUE\nORDER BY created_at DESC\nLIMIT 100;`,
};

function generateSQL(naturalLanguage: string): string {
  const lower = naturalLanguage.toLowerCase();
  for (const [key, sql] of Object.entries(SQL_TEMPLATES)) {
    if (lower.includes(key)) return sql;
  }
  return SQL_TEMPLATES['default'];
}

function getResultSet(sql: string): { columns: string[]; rows: Record<string, unknown>[] } {
  const lower = sql.toLowerCase();
  if (lower.includes('revenue') || lower.includes('month')) return mockQueryResults['revenue'];
  if (lower.includes('product') && lower.includes('revenue')) return mockQueryResults['products'];
  if (lower.includes('lifetime') || lower.includes('plan_name')) return mockQueryResults['users'];
  if (lower.includes('total_units') || lower.includes('best')) return mockQueryResults['products'];
  return mockQueryResults['default'];
}

export function useQueryEngine() {
  const [history, setHistory] = useState<QueryHistoryItem[]>(mockHistory);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(mockSavedQueries);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [currentNL, setCurrentNL] = useState('');
  const [error, setError] = useState<string | null>(null);

  const runQuery = useCallback(async (naturalLanguage: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentNL(naturalLanguage);

    // Simulate OpenAI API call (1.2–2.1s)
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 900));
    const sql = generateSQL(naturalLanguage);
    setGeneratedSQL(sql);

    // Simulate DB execution (200–600ms)
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));
    const execTime = Math.floor(150 + Math.random() * 450);
    const resultSet = getResultSet(sql);

    const result: QueryResult = {
      columns: resultSet.columns,
      rows: resultSet.rows,
      rowCount: resultSet.rows.length,
      executionTime: execTime,
    };

    setQueryResult(result);
    setIsLoading(false);

    const historyItem: QueryHistoryItem = {
      id: Date.now().toString(),
      naturalLanguage,
      sql,
      timestamp: new Date(),
      executionTime: execTime,
      rowCount: result.rowCount,
      status: 'success',
    };
    setHistory((prev) => [historyItem, ...prev]);

    return { sql, result };
  }, []);

  const saveQuery = useCallback((name: string, tags: string[]) => {
    if (!generatedSQL || !currentNL) return;
    const saved: SavedQuery = {
      id: Date.now().toString(),
      name,
      naturalLanguage: currentNL,
      sql: generatedSQL,
      createdAt: new Date(),
      tags,
    };
    setSavedQueries((prev) => [saved, ...prev]);
  }, [generatedSQL, currentNL]);

  const deleteHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const deleteSaved = useCallback((id: string) => {
    setSavedQueries((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const loadQuery = useCallback((sql: string, nl: string) => {
    setGeneratedSQL(sql);
    setCurrentNL(nl);
    const resultSet = getResultSet(sql);
    setQueryResult({
      columns: resultSet.columns,
      rows: resultSet.rows,
      rowCount: resultSet.rows.length,
      executionTime: 0,
    });
  }, []);

  return {
    history,
    savedQueries,
    isLoading,
    generatedSQL,
    queryResult,
    currentNL,
    error,
    runQuery,
    saveQuery,
    deleteHistory,
    deleteSaved,
    loadQuery,
  };
}
