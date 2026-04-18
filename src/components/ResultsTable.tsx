import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Download, TableProperties } from 'lucide-react';
import { QueryResult, SortState } from '../types';
import { cn } from '../utils/cn';

interface ResultsTableProps {
  result: QueryResult;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const handleSort = (col: string) => {
    setSortState((prev) => {
      if (prev.column !== col) return { column: col, direction: 'asc' };
      if (prev.direction === 'asc') return { column: col, direction: 'desc' };
      return { column: null, direction: null };
    });
    setCurrentPage(1);
  };

  const filteredRows = useMemo(() => {
    if (!filterText.trim()) return result.rows;
    const lower = filterText.toLowerCase();
    return result.rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(lower))
    );
  }, [result.rows, filterText]);

  const sortedRows = useMemo(() => {
    if (!sortState.column || !sortState.direction) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const av = a[sortState.column!];
      const bv = b[sortState.column!];
      const aStr = String(av ?? '');
      const bStr = String(bv ?? '');
      const cmp = isNaN(Number(aStr)) ? aStr.localeCompare(bStr) : Number(aStr) - Number(bStr);
      return sortState.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sortState]);

  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);
  const pagedRows = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDownloadCSV = () => {
    const header = result.columns.join(',');
    const rows = result.rows.map((r) => result.columns.map((c) => `"${r[c] ?? ''}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortState.column !== col) return <ChevronsUpDown size={12} className="text-gray-600" />;
    if (sortState.direction === 'asc') return <ChevronUp size={12} className="text-violet-400" />;
    return <ChevronDown size={12} className="text-violet-400" />;
  };

  const formatCellValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-600 italic text-xs">NULL</span>;
    if (typeof value === 'boolean') {
      return (
        <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', value ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-500')}>
          {value ? 'true' : 'false'}
        </span>
      );
    }
    const str = String(value);
    if (str.startsWith('$')) {
      return <span className="text-emerald-400 font-mono text-xs font-medium">{str}</span>;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return <span className="text-blue-400 text-xs font-mono">{str}</span>;
    }
    return <span className="text-gray-200 text-sm">{str}</span>;
  };

  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden bg-gray-900">
      {/* Table header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TableProperties size={15} className="text-gray-500" />
          <span className="text-gray-300 text-sm font-medium">Results</span>
          <span className="bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">
            {sortedRows.length} / {result.rowCount} rows
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={filterText}
              onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }}
              placeholder="Filter results..."
              className="bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-3 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-violet-500 w-44 placeholder-gray-500"
            />
          </div>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600 px-2.5 py-1.5 rounded-lg transition-all"
          >
            <Download size={12} />
            CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-gray-800/50 border-b border-gray-700">
              {result.columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    {col}
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  'border-b border-gray-800 transition-colors hover:bg-gray-800/50',
                  i % 2 === 0 ? 'bg-transparent' : 'bg-gray-800/20'
                )}
              >
                {result.columns.map((col) => (
                  <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                    {formatCellValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-gray-900">
          <p className="text-gray-500 text-xs">
            Page {currentPage} of {totalPages} · showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sortedRows.length)}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-lg transition-all"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-lg transition-all',
                    currentPage === page ? 'bg-violet-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-lg transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
